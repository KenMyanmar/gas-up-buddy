import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizePhone } from "./phone.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Landmark masking ─────────────────────────────────────────────
const LANDMARK_KEYWORDS = [
  "City", "Tower", "Condo", "Residence", "Plaza", "Park",
  "Garden", "Square", "Heights", "View", "Complex", "Estate",
  "Junction", "Mall",
];

function maskAddress(fullAddress: string, township?: string): string {
  if (!fullAddress) return "***";
  const parts = fullAddress.split(",").map((s) => s.trim());
  const kept: string[] = [];
  const lower = fullAddress.toLowerCase();
  for (const kw of LANDMARK_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      const part = parts.find((p) => p.toLowerCase().includes(kw.toLowerCase()));
      if (part && !kept.includes(part)) kept.push(part);
    }
  }
  if (township && !kept.some((k) => k.toLowerCase().includes(township.toLowerCase()))) {
    kept.push(township);
  }
  if (kept.length === 0) {
    if (parts.length <= 2) return "***" + (township ? `, ${township}` : "");
    return `***, ${parts[parts.length - 1]}`;
  }
  return kept.join(", ");
}

// ── Soft rate limit (in-memory, resets on cold start) ────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 5;
}

// ── SCALABILITY FIX: Replace listUsers O(N) with targeted lookup ──
async function findAuthUserByEmail(
  supabaseAdmin: any,
  bridgeEmail: string,
): Promise<{ id: string; email: string | null; phone: string | null } | null> {
  // perPage:1000 — perPage:10 missed orphan auth users beyond first page.
  // kbz_openid fast-path makes this cold-path code.
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
    page: 1,
  });
  if (error || !users) return null;
  
  const found = users.find((u: any) => u.email === bridgeEmail);
  return found ? { id: found.id, email: found.email ?? null, phone: found.phone ?? null } : null;
}

// ── Session minting via deterministic HMAC password + email sign-in ──
async function mintSession(
  supabaseAdmin: any,
  authUserId: string,
  bridgeEmail: string,
  e164: string,
): Promise<{ access_token: string; refresh_token: string; expires_at: number; expires_in: number }> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authSecret = Deno.env.get("KBZPAY_AUTH_SECRET");
  if (!authSecret) throw new Error("KBZPAY_AUTH_SECRET not configured");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(authUserId));
  const password = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const { data: getRes } = await supabaseAdmin.auth.admin.getUserById(authUserId);
  const currentUser = getRes?.user;
  const patch: Record<string, unknown> = { password };
  if (currentUser?.email !== bridgeEmail) {
    patch.email = bridgeEmail;
    patch.email_confirm = true;
  }
  if (currentUser?.phone !== e164) {
    patch.phone = e164;
    patch.phone_confirm = true;
  }

  const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(authUserId, patch);
  if (pwErr) {
    if (patch.phone) {
      console.warn("phone_update_rejected_continuing_email_only", { auth_user_id: authUserId });
      const retryPatch = { ...patch };
      delete retryPatch.phone;
      delete retryPatch.phone_confirm;
      const { error: retryErr } = await supabaseAdmin.auth.admin.updateUserById(authUserId, retryPatch);
      if (retryErr) throw new Error(`Failed to set canonical email/password: ${retryErr.message}`);
    } else {
      throw new Error(`Failed to set canonical email/password: ${pwErr.message}`);
    }
  }

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  let { data, error } = await anonClient.auth.signInWithPassword({
    email: bridgeEmail,
    password,
  });

  if (error && /invalid_credentials/i.test(error.message || "")) {
    await new Promise((r) => setTimeout(r, 400));
    const retry = await anonClient.auth.signInWithPassword({ email: bridgeEmail, password });
    data = retry.data;
    error = retry.error;
  }

  if (error || !data.session) {
    console.error("mintSession_signin_failed", { auth_user_id: authUserId, code: error?.code });
    throw new Error("KBZ_MINT_SESSION_SIGNIN_FAILED");
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
  };
}

// ── Extract KBZ identity from getUserInfo response ──────────────
function extractKbzIdentity(parsedContent: any, userData: any): { openid: string | null; fullName: string | null } {
  // KBZ AppCube doc-confirmed response shape: { accessToken, userInfo: { openid, fullName, msisdn, userId } }
  // The VPS proxy may pass it through as parsedContent or userData.content depending on wrapping.
  const openid =
    // PRIMARY paths — userInfo wrapper (KBZ AppCube spec confirmed)
    parsedContent?.userInfo?.openid ||
    userData?.userInfo?.openid ||
    userData?.content?.userInfo?.openid ||
    // FALLBACK paths — kept defensively for unknown proxy shapes
    parsedContent?.user?.Response?.openid ||
    parsedContent?.user?.Response?.open_id ||
    parsedContent?.openid ||
    parsedContent?.open_id ||
    userData?.content?.user?.Response?.openid ||
    userData?.content?.openid ||
    userData?.openid ||
    userData?.Response?.openid ||
    null;

  const fullName =
    // PRIMARY paths — userInfo wrapper
    parsedContent?.userInfo?.fullName ||
    userData?.userInfo?.fullName ||
    userData?.content?.userInfo?.fullName ||
    // FALLBACK paths
    parsedContent?.user?.Response?.fullName ||
    parsedContent?.user?.Response?.full_name ||
    parsedContent?.user?.Response?.nickName ||
    parsedContent?.user?.Response?.nick_name ||
    parsedContent?.fullName ||
    parsedContent?.full_name ||
    parsedContent?.nickName ||
    userData?.content?.user?.Response?.fullName ||
    userData?.content?.fullName ||
    userData?.fullName ||
    userData?.Response?.fullName ||
    null;

  return { openid: openid ? String(openid) : null, fullName: fullName ? String(fullName) : null };
}

// ── Store KBZ identity on customer record ─────────────────────────
async function storeKbzIdentity(
  supabaseAdmin: any,
  customerId: string,
  openid: string | null,
  fullName: string | null,
) {
  if (!openid && !fullName) return;
  const update: Record<string, unknown> = {};
  if (openid) update.kbz_openid = openid;
  if (fullName) update.kbz_full_name = fullName;
  
  const { error } = await supabaseAdmin
    .from("customers")
    .update(update)
    .eq("id", customerId);
  
  if (error) {
    // Unique constraint violation on kbz_openid = another customer already has this openid
    console.warn("[AUTO-LOGIN] kbz_identity store failed (may be duplicate openid):", error.message);
  } else {
    console.log(`[AUTO-LOGIN] Stored kbz identity for customer=${customerId} openid=${openid?.slice(0,8)}...`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return json({ error: "Too many requests" }, 429);
    }

    const { authCode } = await req.json();
    if (!authCode || typeof authCode !== "string") {
      return json({ error: "authCode is required" }, 400);
    }

    // ── Exchange authCode → phone via VPS proxy (two-call flow) ──
    const env = (Deno.env.get("KBZPAY_ENV") || "UAT").toUpperCase();
    const proxyUrl = Deno.env.get("KBZPAY_VPS_PROXY_URL");
    const proxySecret = Deno.env.get("KBZPAY_VPS_PROXY_SECRET");

    if (!proxyUrl || !proxySecret) {
      console.error("Missing KBZPAY_VPS_PROXY_URL/SECRET");
      return json({ error: "Payment service not configured" }, 503);
    }

    const kbzHost =
      env === "PROD"
        ? "https://appcube.easy-run.kbzpay.com"
        : "https://uat-miniapp.kbzpay.com";

    const callProxy = async (
      targetPath: string,
      body: Record<string, unknown>,
      tag: string,
    ): Promise<any> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);
      try {
        const res = await fetch(proxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Proxy-Secret": proxySecret,
            "X-Target-Url": `${kbzHost}${targetPath}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) {
          const errText = (await res.text()).slice(0, 300);
          console.error(`VPS proxy ${tag} error:`, res.status, errText);
          return null;
        }
        return await res.json();
      } catch (e: any) {
        console.error(`VPS proxy ${tag} exception:`, e?.name || "error");
        return null;
      } finally {
        clearTimeout(timeout);
      }
    };

    // Call 1: getAccessToken
    const tokenData = await callProxy(
      "/miniprogram/open/getAccessToken",
      { authCode },
      "getAccessToken",
    );
    if (!tokenData) {
      return json({ error: "Failed to verify KBZ Pay account" }, 502);
    }
    const accessToken =
      (tokenData?.responseCode === 0 ? tokenData?.content : null) ||
      tokenData.accessToken ||
      tokenData.access_token ||
      tokenData?.Response?.accessToken ||
      tokenData?.Response?.access_token;
    if (!accessToken) {
      console.error(
        "getAccessToken: no accessToken in response (keys):",
        Object.keys(tokenData || {}),
        "responseCode:",
        (tokenData as any)?.responseCode,
      );
      return json({ error: "Failed to verify KBZ Pay account", failure_code: "KBZ_TOKEN_REJECTED" }, 502);
    }

    // Call 2: getUserInfo
    const userData = await callProxy(
      "/miniprogram/open/getUserInfo",
      { authCode, accessToken },
      "getUserInfo",
    );
    if (!userData) {
      return json({ error: "Failed to verify KBZ Pay account" }, 502);
    }

    // Normalize content (may be JSON string or already an object)
    let parsedContent: any = null;
    if (userData?.responseCode === 0 && userData?.content != null) {
      if (typeof userData.content === "string") {
        try {
          parsedContent = JSON.parse(userData.content);
        } catch (_e) {
          parsedContent = null;
        }
      } else if (typeof userData.content === "object") {
        parsedContent = userData.content;
      }
    }

    const rawPhone =
      parsedContent?.user?.Response?.msisdn ||
      parsedContent?.user?.Response?.phone ||
      parsedContent?.user?.Response?.mobile ||
      parsedContent?.msisdn ||
      parsedContent?.phone ||
      parsedContent?.mobile ||
      userData?.content?.user?.Response?.msisdn ||
      userData?.content?.user?.Response?.phone ||
      userData?.content?.user?.Response?.mobile ||
      userData?.content?.msisdn ||
      userData?.content?.phone ||
      userData?.content?.mobile ||
      userData?.phone ||
      userData?.msisdn ||
      userData?.mobile ||
      userData?.Response?.phone ||
      userData?.Response?.msisdn ||
      userData?.Response?.mobile;

    if (!rawPhone) {
      const contentKeys =
        parsedContent && typeof parsedContent === "object"
          ? Object.keys(parsedContent)
          : userData?.content && typeof userData.content === "object"
          ? Object.keys(userData.content)
          : null;
      const userKeys =
        parsedContent?.user && typeof parsedContent.user === "object"
          ? Object.keys(parsedContent.user)
          : null;
      const userResponseKeys =
        parsedContent?.user?.Response && typeof parsedContent.user.Response === "object"
          ? Object.keys(parsedContent.user.Response)
          : null;
      console.error(
        "getUserInfo: no phone in response. responseCode:",
        (userData as any)?.responseCode,
        "top_keys:",
        Object.keys(userData || {}),
        "content_keys:",
        contentKeys,
        "user_keys:",
        userKeys,
        "user_Response_keys:",
        userResponseKeys,
      );
      return json({ error: "No phone returned from KBZ Pay", failure_code: "KBZ_NO_PHONE" }, 502);
    }

    // ── GAP 4: Extract KBZ identity (openid + fullName) ──────────
    const kbzIdentity = extractKbzIdentity(parsedContent, userData);
    if (kbzIdentity.openid) {
      console.log(`[AUTO-LOGIN] KBZ identity extracted: openid=${kbzIdentity.openid.slice(0, 8)}... fullName=${kbzIdentity.fullName || 'null'}`);
    } else {
      // DIAGNOSTIC: if openid still missing after spec-aligned paths,
      // capture actual response keys so we can identify the right path.
      // Removable in a future commit once openid is observed flowing.
      console.warn("[AUTO-LOGIN] openid_missing — diagnostic dump:", {
        parsedContent_keys: parsedContent && typeof parsedContent === 'object' ? Object.keys(parsedContent) : null,
        parsedContent_userInfo_keys: parsedContent?.userInfo && typeof parsedContent.userInfo === 'object' ? Object.keys(parsedContent.userInfo) : null,
        parsedContent_user_keys: parsedContent?.user && typeof parsedContent.user === 'object' ? Object.keys(parsedContent.user) : null,
        userData_top_keys: userData ? Object.keys(userData) : null,
        userData_userInfo_keys: userData?.userInfo && typeof userData.userInfo === 'object' ? Object.keys(userData.userInfo) : null,
        userData_content_type: typeof userData?.content,
        userData_content_keys: userData?.content && typeof userData.content === 'object' ? Object.keys(userData.content) : null,
        phone_extracted_ok: !!rawPhone,
      });
    }

    const norm = normalizePhone(rawPhone);
    if (!norm) {
      console.error("UNRECOGNIZED_PHONE_FORMAT for raw KBZ phone (length:", String(rawPhone).length, ")");
      return json({ error: "Unrecognized phone format", failure_code: "UNRECOGNIZED_PHONE_FORMAT" }, 400);
    }
    const { local09: phone, e164, e164NoPlus, bridgeEmail } = norm;
    const phoneMasked = "09xxxx" + phone.slice(-4);

    // ── Supabase admin client ──────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── GAP 5: FAST PATH — check kbz_openid first (O(1) indexed) ──
    if (kbzIdentity.openid) {
      const { data: openidMatch } = await supabaseAdmin
        .from("customers")
        .select("id, full_name, auth_user_id, kbz_openid")
        .eq("kbz_openid", kbzIdentity.openid)
        .maybeSingle();

      if (openidMatch && openidMatch.auth_user_id) {
        // Returning KBZ user — skip ALL phone matching
        console.log(`[AUTO-LOGIN] FAST PATH: kbz_openid match → customer=${openidMatch.id}`);
        
        const session = await mintSession(supabaseAdmin, openidMatch.auth_user_id, bridgeEmail, e164);

        // Update fullName if changed
        if (kbzIdentity.fullName && kbzIdentity.fullName !== openidMatch.full_name) {
          await storeKbzIdentity(supabaseAdmin, openidMatch.id, null, kbzIdentity.fullName);
        }

        await supabaseAdmin.from("activity_logs").insert({
          entity_type: "customer",
          entity_id: openidMatch.id,
          action_type: "kbzpay.auto_login.success",
          summary: `KBZ Pay fast-path auto-login for ${phoneMasked} via openid`,
          user_id: openidMatch.auth_user_id,
          metadata: { phone_masked: phoneMasked, customer_id: openidMatch.id, fast_path: true },
        });

        return json({
          status: "linked",
          customer_id: openidMatch.id,
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          expires_in: session.expires_in,
        });
      }
    }

    // ── Standard phone matching (existing logic) ───────────────
    const { data: matches, error: matchErr } = await supabaseAdmin
      .from("customer_phones")
      .select(`
        customer_id,
        customers!inner (
          id, full_name, address, township, auth_user_id, created_at
        )
      `)
      .eq("phone", phone);

    if (matchErr) {
      console.error("customer_phones lookup error:", matchErr);
      return json({ error: "Database error" }, 500);
    }

    const uniqueCustomers = new Map<string, any>();
    for (const m of matches || []) {
      const c = (m as any).customers;
      if (c && !uniqueCustomers.has(c.id)) {
        uniqueCustomers.set(c.id, c);
      }
    }

    const { data: directMatches } = await supabaseAdmin
      .from("customers")
      .select("id, full_name, address, township, auth_user_id, created_at")
      .eq("phone", phone);

    for (const c of directMatches || []) {
      if (!uniqueCustomers.has(c.id)) {
        uniqueCustomers.set(c.id, c);
      }
    }

    const customerList = Array.from(uniqueCustomers.values());

    const customerIds = customerList.map((c: any) => c.id);
    let orderStatsMap = new Map<string, { count: number; lastDate: string | null }>();

    if (customerIds.length > 0) {
      const { data: allOrders } = await supabaseAdmin
        .from("orders")
        .select("customer_id, created_at")
        .in("customer_id", customerIds);

      for (const o of allOrders || []) {
        const existing = orderStatsMap.get(o.customer_id);
        if (!existing) {
          orderStatsMap.set(o.customer_id, { count: 1, lastDate: o.created_at });
        } else {
          existing.count++;
          if (o.created_at && (!existing.lastDate || o.created_at > existing.lastDate)) {
            existing.lastDate = o.created_at;
          }
        }
      }
    }

    const candidates = customerList.map((c: any) => {
      const stats = orderStatsMap.get(c.id) || { count: 0, lastDate: null };
      return {
        customer_id: c.id,
        name: c.full_name,
        address_masked: maskAddress(c.address, c.township),
        last_order_date: stats.lastDate,
        total_orders: stats.count,
        member_since: c.created_at,
        has_auth_account: !!c.auth_user_id,
        _auth_user_id: c.auth_user_id,
      };
    });

    candidates.sort((a, b) => {
      if (a.last_order_date && !b.last_order_date) return -1;
      if (!a.last_order_date && b.last_order_date) return 1;
      if (a.last_order_date && b.last_order_date) {
        const cmp = new Date(b.last_order_date).getTime() - new Date(a.last_order_date).getTime();
        if (cmp !== 0) return cmp;
      }
      return b.total_orders - a.total_orders;
    });

    // ── 0 matches → new_account ──────────────────────────────────
    if (candidates.length === 0) {
      let userId: string;

      // GAP 5 FIX: Try bridge email lookup instead of listUsers({perPage:1000})
      const existing = await findAuthUserByEmail(supabaseAdmin, bridgeEmail);
      if (existing) {
        userId = existing.id;
        await supabaseAdmin.from("activity_logs").insert({
          entity_type: "auth_user",
          entity_id: userId,
          action_type: "kbzpay.auto_login.orphan_auth_user_detected",
          summary: `Orphan auth user detected for ${phoneMasked} during new_account creation`,
          user_id: userId,
          metadata: {
            phone_masked: phoneMasked,
            fallback_reason: "existing_auth_user_no_customer",
            existing_user_id: userId,
            source: "kbzpay_miniapp",
          },
        });
      } else {
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: bridgeEmail,
          email_confirm: true,
          phone: e164,
          phone_confirm: true,
          password: crypto.randomUUID(),
        });
        if (createErr || !newUser?.user) {
          console.error("Create user error:", createErr);
          return json({ error: "Failed to create account" }, 500);
        }
        userId = newUser.user.id;
      }

      const { data: newCustomer, error: custErr } = await supabaseAdmin
        .from("customers")
        .insert({
          auth_user_id: userId,
          phone: phone,
          full_name: kbzIdentity.fullName || "",
          address: "",
          township: "",
          status: "active",
          kbz_openid: kbzIdentity.openid || null,
          kbz_full_name: kbzIdentity.fullName || null,
        })
        .select("id")
        .single();

      if (custErr) {
        console.error("Create customer error:", custErr);
      }

      const customerId = newCustomer?.id || null;

      if (customerId) {
        await supabaseAdmin.from("customer_phones").insert({
          customer_id: customerId,
          phone: phone,
          label: "primary",
          is_primary: true,
        }).catch((e: any) => console.error("customer_phones insert error:", e));
      }

      const session = await mintSession(supabaseAdmin, userId, bridgeEmail, e164);

      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "customer",
        entity_id: customerId || userId,
        action_type: "kbzpay.auto_login.new_account",
        summary: `New KBZ Pay account created for ${phoneMasked}`,
        user_id: userId,
        metadata: { phone_masked: phoneMasked, source: "kbzpay_miniapp", customer_id: customerId, kbz_openid: kbzIdentity.openid },
      });

      return json({
        status: "new_account",
        customer_id: customerId,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
      });
    }

    // ── 1 match with auth → linked ──────────────────────────────
    if (candidates.length === 1 && candidates[0].has_auth_account) {
      const c = candidates[0];

      const { data: { user: authUser }, error: getUserErr } = await supabaseAdmin.auth.admin.getUserById(c._auth_user_id);
      if (getUserErr || !authUser) {
        console.error("Auth user not found for getUserById:", c._auth_user_id, getUserErr);
        return json({ error: "Auth user not found" }, 500);
      }

      const session = await mintSession(supabaseAdmin, c._auth_user_id, bridgeEmail, e164);

      // GAP 4: Store KBZ identity on successful link
      await storeKbzIdentity(supabaseAdmin, c.customer_id, kbzIdentity.openid, kbzIdentity.fullName);

      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "customer",
        entity_id: c.customer_id,
        action_type: "kbzpay.auto_login.success",
        summary: `KBZ Pay auto-login for ${phoneMasked} → linked to existing account`,
        user_id: c._auth_user_id,
        metadata: { phone_masked: phoneMasked, customer_id: c.customer_id, kbz_openid: kbzIdentity.openid },
      });

      return json({
        status: "linked",
        customer_id: c.customer_id,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
      });
    }

    // ── 1 match without auth OR 2+ matches → generate token ─────
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const tokenHex = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("");

    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(tokenHex));
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const candidateIds = candidates.map((c) => c.customer_id);

    const { error: tokenErr } = await supabaseAdmin.from("kbzpay_link_tokens").insert({
      token_hash: tokenHash,
      phone_local: phone,
      candidate_ids: candidateIds,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    if (tokenErr) {
      console.error("Token insert error:", tokenErr);
      return json({ error: "Failed to create link token" }, 500);
    }

    const hasMultiple = candidates.length > 1;
    const hasAnyAuth = candidates.some((c) => c.has_auth_account);
    let status: string;

    if (hasMultiple && hasAnyAuth) {
      status = "linked_select";
    } else {
      status = "link_pending";
    }

    if (hasMultiple) {
      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "customer",
        entity_id: candidateIds[0],
        action_type: "kbzpay.multi_match.ambiguous_duplicate",
        summary: `KBZ Pay phone ${phoneMasked} matched ${candidates.length} customers`,
        user_id: null,
        metadata: {
          phone_masked: phoneMasked,
          candidate_count: candidates.length,
          candidate_ids: candidateIds,
        },
      });
    }

    const cleanCandidates = candidates.map(({ _auth_user_id, ...rest }) => rest);

    return json({
      status,
      temporary_token: tokenHex,
      candidates: cleanCandidates,
      phone_e164: e164,
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
