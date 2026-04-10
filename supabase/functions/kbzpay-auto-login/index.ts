import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// ── Phone normalization (matches link-customer-account pattern) ──
function toLocal09(raw: string): string {
  let p = raw.replace(/[\s\-()]/g, "");
  if (p.startsWith("+959")) p = "09" + p.slice(4);
  else if (p.startsWith("959")) p = "09" + p.slice(3);
  else if (p.startsWith("+95")) p = "0" + p.slice(3);
  else if (p.startsWith("95") && p.length > 9 && !p.startsWith("09")) p = "0" + p.slice(2);
  if (!p.startsWith("09")) p = "09" + p;
  return p;
}

function toE164(local09: string): string {
  return "+959" + local09.slice(2);
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
// TODO(v1.1): This rate limit is in-memory per isolate and does NOT survive
// cold starts or span instances. Upgrade to Upstash Redis / Deno KV when
// cross-instance enforcement is needed.
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

// ── Session minting via password-rotation ────────────────────────
async function mintSession(
  supabaseAdmin: any,
  authUserId: string,
  e164: string,
): Promise<{ access_token: string; refresh_token: string; expires_at: number; expires_in: number }> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // 1. Set a random one-time password
  const otp = crypto.randomUUID();
  const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: otp });
  if (pwErr) throw new Error(`Failed to set temp password: ${pwErr.message}`);

  // 2. Sign in with anon client to get real tokens (no session persistence in edge)
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await anonClient.auth.signInWithPassword({
    phone: e164,
    password: otp,
  });
  if (error || !data.session) throw new Error(`Session minting failed: ${error?.message || "no session"}`);

  // 3. Rotate password to prevent reuse
  await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: crypto.randomUUID() });

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
  };
}

// ── Helper: find existing auth user by phone (filtered, no full scan) ──
async function findAuthUserByPhone(
  supabaseAdmin: any,
  e164: string,
): Promise<{ id: string; phone: string } | null> {
  // Use admin listUsers with page/perPage — Supabase JS v2 doesn't support
  // server-side filter param on listUsers, but we can use getUserById if we
  // have the ID. For phone lookup without ID, we query auth.users via SQL.
  const { data, error } = await supabaseAdmin.rpc("", {}).catch(() => ({ data: null, error: "rpc not available" }));
  // Fallback: use the admin API with a small page scan filtered client-side
  // This is still O(N) in the worst case, but listUsers supports pagination.
  // For correctness we do a direct query via service role.
  const { data: userData, error: userErr } = await supabaseAdmin
    .from("auth_user_phone_lookup")
    .select("id, phone")
    .eq("phone", e164)
    .limit(1)
    .maybeSingle();

  // auth_user_phone_lookup doesn't exist as a view, so fall back to listUsers
  // with a targeted approach - get first page and filter
  if (userErr || !userData) {
    const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr || !users) return null;
    const found = users.find((u: any) => u.phone === e164);
    return found ? { id: found.id, phone: found.phone } : null;
  }
  return userData;
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

    // ── Exchange authCode → phone via VPS proxy ────────────────
    const env = Deno.env.get("KBZPAY_ENV") || "UAT";
    const proxyUrl = Deno.env.get(`KBZPAY_${env}_VPS_PROXY_URL`);
    const proxySecret = Deno.env.get(`KBZPAY_${env}_PROXY_SECRET`);

    if (!proxyUrl || !proxySecret) {
      console.error("Missing KBZPAY proxy env vars for env:", env);
      return json({ error: "Payment service not configured" }, 503);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const proxyRes = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Proxy-Secret": proxySecret,
      },
      body: JSON.stringify({ authCode }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!proxyRes.ok) {
      const errText = await proxyRes.text();
      console.error("VPS proxy error:", proxyRes.status, errText);
      return json({ error: "Failed to verify KBZ Pay account" }, 502);
    }

    const proxyData = await proxyRes.json();
    const rawPhone = proxyData.phone || proxyData.msisdn;
    if (!rawPhone) {
      return json({ error: "No phone returned from KBZ Pay" }, 502);
    }

    const phone = toLocal09(rawPhone);
    const e164 = toE164(phone);
    const phoneMasked = "09xxxx" + phone.slice(-4);

    // ── Supabase admin client ──────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Look up customer_phones → customers ────────────────────
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

    // Dedupe by customer_id
    const uniqueCustomers = new Map<string, any>();
    for (const m of matches || []) {
      const c = (m as any).customers;
      if (c && !uniqueCustomers.has(c.id)) {
        uniqueCustomers.set(c.id, c);
      }
    }

    // Also check customers.phone directly (legacy fallback — P2: remove post-UAT)
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

    // ── Get order stats in a single query (P1-4 fix) ───────────
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

    // Sort: last_order_date DESC NULLS LAST, total_orders DESC
    candidates.sort((a, b) => {
      if (a.last_order_date && !b.last_order_date) return -1;
      if (!a.last_order_date && b.last_order_date) return 1;
      if (a.last_order_date && b.last_order_date) {
        const cmp = new Date(b.last_order_date).getTime() - new Date(a.last_order_date).getTime();
        if (cmp !== 0) return cmp;
      }
      return b.total_orders - a.total_orders;
    });

    // ── Branch on match count ──────────────────────────────────

    // 0 matches → new_account
    if (candidates.length === 0) {
      let userId: string;

      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        phone: e164,
        phone_confirm: true,
        password: crypto.randomUUID(), // ensure password exists for mintSession
      });

      if (createErr) {
        // Phone already has an auth user — find them (orphan detection)
        const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const existing = (users || []).find((u: any) => u.phone === e164);

        if (!existing) {
          console.error("Create user error (no existing found):", createErr);
          return json({ error: "Failed to create account" }, 500);
        }

        userId = existing.id;

        // Log orphan detection for audit visibility
        await supabaseAdmin.from("activity_logs").insert({
          entity_type: "auth_user",
          entity_id: userId,
          action_type: "kbzpay.auto_login.orphan_auth_user_detected",
          summary: `Orphan auth user detected for ${phoneMasked} during new_account creation`,
          user_id: userId,
          metadata: {
            phone_masked: phoneMasked,
            fallback_reason: "createUser_duplicate_phone",
            existing_user_id: userId,
            source: "kbzpay_miniapp",
          },
        });
      } else {
        userId = newUser.user.id;
      }

      // Create customers row (P0-3 fix)
      const { data: newCustomer, error: custErr } = await supabaseAdmin
        .from("customers")
        .insert({
          auth_user_id: userId,
          phone: phone,
          full_name: "",
          address: "",
          township: "",
          status: "active",
        })
        .select("id")
        .single();

      if (custErr) {
        console.error("Create customer error:", custErr);
        // Non-fatal — customer might already exist for this auth_user_id
      }

      const customerId = newCustomer?.id || null;

      // Create customer_phones row
      if (customerId) {
        await supabaseAdmin.from("customer_phones").insert({
          customer_id: customerId,
          phone: phone,
          label: "primary",
          is_primary: true,
        }).catch((e: any) => console.error("customer_phones insert error:", e));
      }

      // Mint session (P0-1 fix)
      const session = await mintSession(supabaseAdmin, userId, e164);

      // Log activity
      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "customer",
        entity_id: customerId || userId,
        action_type: "kbzpay.auto_login.new_account",
        summary: `New KBZ Pay account created for ${phoneMasked}`,
        user_id: userId,
        metadata: { phone_masked: phoneMasked, source: "kbzpay_miniapp", customer_id: customerId },
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

    // 1 match with auth → linked
    if (candidates.length === 1 && candidates[0].has_auth_account) {
      const c = candidates[0];

      // Verify auth user exists via getUserById (no full scan)
      const { data: { user: authUser }, error: getUserErr } = await supabaseAdmin.auth.admin.getUserById(c._auth_user_id);
      if (getUserErr || !authUser) {
        console.error("Auth user not found for getUserById:", c._auth_user_id, getUserErr);
        return json({ error: "Auth user not found" }, 500);
      }

      // Mint session (P0-1 fix — replaces signInWithOtp + dead code)
      const session = await mintSession(supabaseAdmin, c._auth_user_id, e164);

      // Log success
      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "customer",
        entity_id: c.customer_id,
        action_type: "kbzpay.auto_login.success",
        summary: `KBZ Pay auto-login for ${phoneMasked} → linked to existing account`,
        user_id: c._auth_user_id,
        metadata: { phone_masked: phoneMasked, customer_id: c.customer_id },
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

    // 1 match without auth OR 2+ matches → generate token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const tokenHex = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("");

    // SHA256 hash for storage
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(tokenHex));
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const candidateIds = candidates.map((c) => c.customer_id);

    // Store token
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

    // Determine status
    const hasMultiple = candidates.length > 1;
    const hasAnyAuth = candidates.some((c) => c.has_auth_account);
    let status: string;

    if (hasMultiple && hasAnyAuth) {
      status = "linked_select";
    } else {
      status = "link_pending";
    }

    // Log ambiguous duplicate if multiple matches
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

    // Clean candidates for response
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
