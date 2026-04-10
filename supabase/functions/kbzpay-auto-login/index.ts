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
    const phoneMasked = "09xxxx" + phone.slice(-4);

    // ── Supabase admin client ──────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Look up customer_phones → customers → orders ───────────
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

    // Also check customers.phone directly
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

    // Get order counts for each customer
    const candidates = await Promise.all(
      customerList.map(async (c) => {
        const { count, data: orderData } = await supabaseAdmin
          .from("orders")
          .select("created_at", { count: "exact", head: false })
          .eq("customer_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);

        return {
          customer_id: c.id,
          name: c.full_name,
          address_masked: maskAddress(c.address, c.township),
          last_order_date: orderData?.[0]?.created_at || null,
          total_orders: count || 0,
          member_since: c.created_at,
          has_auth_account: !!c.auth_user_id,
          _auth_user_id: c.auth_user_id,
        };
      })
    );

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
      const e164 = toE164(phone);
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        phone: e164,
        phone_confirm: true,
      });
      if (createErr) {
        // User might already exist in auth
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existing = users?.find((u) => u.phone === e164);
        if (existing) {
          const { data: session, error: sessErr } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email: existing.email || `${existing.id}@placeholder.local`,
          });
          // Fall back to password-based session
          // For phone-only users, we generate a session directly
        }
        console.error("Create user error:", createErr);
        return json({ error: "Failed to create account" }, 500);
      }

      // Generate session
      const { data: sessionData } = await supabaseAdmin.rpc("", {}) // placeholder
        .then(() => ({ data: null }));

      // Use signInWithPassword workaround or admin session generation
      // For now, we create the user and return tokens via a custom approach
      const userId = newUser.user.id;

      // Log activity
      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "customer",
        entity_id: userId,
        action_type: "kbzpay.auto_login.new_account",
        summary: `New KBZ Pay account created for ${phoneMasked}`,
        user_id: userId,
        metadata: { phone_masked: phoneMasked, source: "kbzpay_miniapp" },
      });

      return json({
        status: "new_account",
        customer_id: null,
        // Note: session tokens will be generated via OTP sign-in
        // The client should call supabase.auth.signInWithOtp for session
        auth_user_id: userId,
      });
    }

    // 1 match with auth → linked
    if (candidates.length === 1 && candidates[0].has_auth_account) {
      const c = candidates[0];
      const e164 = toE164(phone);

      // Generate OTP session for the existing user
      const { error: otpErr } = await supabaseAdmin.auth.signInWithOtp({ phone: e164 });

      // We can't directly mint a session without the OTP flow in standard Supabase
      // Instead, auto-verify by using admin API
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = users?.find((u) => u.id === c._auth_user_id);

      if (!authUser) {
        return json({ error: "Auth user not found" }, 500);
      }

      // Generate a custom session using admin
      // Supabase admin API doesn't have generateSession, so we use a workaround:
      // Create a one-time OTP that we immediately verify
      const { data: otpData, error: signInErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: authUser.email || `kbz_${authUser.id}@placeholder.anygas.app`,
      });

      // Actually for phone auth, let's use the admin user management approach
      // The cleanest approach: we have the service role, let's just return a signed JWT
      // But Supabase JS doesn't expose that. So we'll do OTP-less sign in:

      // We'll rely on a short-lived custom approach
      // For now, generate an invite link-like session
      // The most reliable way: signInWithOtp + auto-verify

      await supabaseAdmin.auth.admin.updateUserById(c._auth_user_id, {
        phone: e164,
        phone_confirm: true,
      });

      // Now use the anon client with auto-confirm trick
      // Actually the simplest: just issue an OTP and have the edge function verify it
      // But that requires SMS. For mini app flow, we trust KBZ auth.

      // APPROACH: Use supabaseAdmin.auth.admin to directly create a session
      // This requires custom JWT signing which Supabase admin API supports via generateLink
      // For phone users without email, we need another approach.

      // FINAL APPROACH: Store the user_id in a signed token and have the client 
      // call setSession with it. We use Supabase's built-in session generation.

      // Actually, the Supabase Admin API in recent versions supports:
      // auth.admin.generateLink which returns a hashed_token we can exchange

      // For MVP: return the customer info and let the client do signInWithOtp
      // In production, the VPS proxy will handle session minting

      // Log success
      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "customer",
        entity_id: c.customer_id,
        action_type: "kbzpay.auto_login.success",
        summary: `KBZ Pay auto-login for ${phoneMasked} → linked to existing account`,
        user_id: c._auth_user_id,
        metadata: { phone_masked: phoneMasked, customer_id: c.customer_id },
      });

      // Clean candidate for response (remove internal fields)
      const { _auth_user_id, ...cleanCandidate } = c;

      return json({
        status: "linked",
        customer_id: c.customer_id,
        auth_user_id: c._auth_user_id,
        phone_e164: e164,
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
        user_id: null, // No auth user minted yet
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
      phone_e164: toE164(phone),
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
