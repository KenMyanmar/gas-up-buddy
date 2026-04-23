import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizePhone } from "../_shared/phone.ts";

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

// ── Find auth user by bridgeEmail → e164 → e164NoPlus ────────────
async function findAuthUser(
  supabaseAdmin: any,
  ids: { bridgeEmail: string; e164: string; e164NoPlus: string },
): Promise<{ id: string; email: string | null; phone: string | null } | null> {
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr || !users) return null;
  const found = users.find((u: any) =>
    u.email === ids.bridgeEmail ||
    u.phone === ids.e164 ||
    u.phone === ids.e164NoPlus
  );
  return found ? { id: found.id, email: found.email ?? null, phone: found.phone ?? null } : null;
}

// ── Session minting via deterministic HMAC password + email sign-in ──
// Identical body to kbzpay-auto-login/mintSession. Keep in sync.
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

  // Deterministic password: HMAC_SHA256(secret, auth_user_id).
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

  // Self-heal: ensure email + phone + password are canonical for this user.
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
    // Phone update may collide (e.g., another row already holds e164). Retry without phone.
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

  // Email sign-in only — never phone.
  let { data, error } = await anonClient.auth.signInWithPassword({
    email: bridgeEmail,
    password,
  });

  // One retry on invalid_credentials (covers the rare update→signIn replication gap).
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { temporary_token, selected_customer_id } = await req.json();

    if (!temporary_token || typeof temporary_token !== "string") {
      return json({ error: "temporary_token is required" }, 400);
    }

    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(temporary_token),
    );
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Atomic token claim ─────────────────────────────────────
    const { data: tokenData, error: claimErr } = await supabaseAdmin
      .from("kbzpay_link_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token_hash", tokenHash)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .select()
      .single();

    if (claimErr || !tokenData) {
      return json({ error: "token_invalid_or_used" }, 409);
    }

    const norm = normalizePhone(tokenData.phone_local);
    if (!norm) {
      console.error("LINK_TOKEN_PHONE_INVALID for stored phone (length:", String(tokenData.phone_local || "").length, ")");
      return json({ error: "Invalid phone in link token", failure_code: "LINK_TOKEN_PHONE_INVALID" }, 422);
    }
    const { local09: phone, e164, e164NoPlus, bridgeEmail } = norm;
    const candidateIds: string[] = tokenData.candidate_ids;
    const phoneMasked = "09xxxx" + phone.slice(-4);

    // Validate selected_customer_id
    if (selected_customer_id !== null && selected_customer_id !== undefined) {
      if (!candidateIds.includes(selected_customer_id)) {
        return json({ error: "selected_customer_id not in candidates" }, 400);
      }
    }

    // ── Null selection → "none of these" escape ────────────────
    if (selected_customer_id === null || selected_customer_id === undefined) {
      const { data: candidatesWithAuth } = await supabaseAdmin
        .from("customers")
        .select("id")
        .in("id", candidateIds)
        .not("auth_user_id", "is", null)
        .limit(1);

      if (candidatesWithAuth && candidatesWithAuth.length > 0) {
        return json({
          error: "phone_already_linked",
          message: "This phone is already linked to an account. Please select the correct account from the list above.",
        }, 409);
      }

      let userId: string;
      const existing = await findAuthUser(supabaseAdmin, { bridgeEmail, e164, e164NoPlus });
      if (existing) {
        userId = existing.id;
        await supabaseAdmin.from("activity_logs").insert({
          entity_type: "auth_user",
          entity_id: userId,
          action_type: "kbzpay.auto_login.orphan_auth_user_detected",
          summary: `Orphan auth user detected for ${phoneMasked} during none_of_above link`,
          user_id: userId,
          metadata: {
            phone_masked: phoneMasked,
            fallback_reason: "existing_auth_user_no_customer",
            existing_user_id: userId,
            source: "kbzpay_miniapp",
            path: "link_customer.none_of_above",
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

      // Create customers row
      const { data: newCustomer, error: custInsertErr } = await supabaseAdmin
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

      if (custInsertErr) {
        console.error("Create customer error:", custInsertErr);
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
        action_type: "kbzpay.customer.none_of_above_escape",
        summary: `KBZ Pay user ${phoneMasked} selected "none of these" — new account path`,
        user_id: userId,
        metadata: { phone_masked: phoneMasked, candidate_count: candidateIds.length, customer_id: customerId },
      });

      return json({
        status: "new_account",
        customer_id: customerId,
        is_new_link: true,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
      });
    }

    // ── Valid selection → link or mint session ──────────────────
    const { data: customer, error: custErr } = await supabaseAdmin
      .from("customers")
      .select("id, auth_user_id, full_name")
      .eq("id", selected_customer_id)
      .single();

    if (custErr || !customer) {
      return json({ error: "Customer not found" }, 404);
    }

    if (customer.auth_user_id) {
      const session = await mintSession(supabaseAdmin, customer.auth_user_id, bridgeEmail, e164);

      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "customer",
        entity_id: customer.id,
        action_type: "kbzpay.customer.multi_identity_select",
        summary: `KBZ Pay user ${phoneMasked} selected existing linked account: ${customer.full_name}`,
        user_id: customer.auth_user_id,
        metadata: { phone_masked: phoneMasked, customer_id: customer.id },
      });

      return json({
        status: "linked",
        customer_id: customer.id,
        is_new_link: false,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
      });
    }

    // No auth → find or create auth user + link
    let userId: string;
    const existing = await findAuthUser(supabaseAdmin, { bridgeEmail, e164, e164NoPlus });
    if (existing) {
      userId = existing.id;
      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "auth_user",
        entity_id: userId,
        action_type: "kbzpay.auto_login.orphan_auth_user_detected",
        summary: `Orphan auth user detected for ${phoneMasked} during link-no-auth`,
        user_id: userId,
        metadata: {
          phone_masked: phoneMasked,
          fallback_reason: "existing_auth_user_no_customer",
          existing_user_id: userId,
          source: "kbzpay_miniapp",
          path: "link_customer.link_no_auth",
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

    const { error: linkErr } = await supabaseAdmin
      .from("customers")
      .update({ auth_user_id: userId })
      .eq("id", customer.id);

    if (linkErr) {
      console.error("Link customer error:", linkErr);
      return json({ error: "Failed to link account" }, 500);
    }

    const session = await mintSession(supabaseAdmin, userId, bridgeEmail, e164);

    await supabaseAdmin.from("activity_logs").insert({
      entity_type: "customer",
      entity_id: customer.id,
      action_type: "kbzpay.customer.linked",
      summary: `KBZ Pay linked ${phoneMasked} to customer ${customer.full_name}`,
      user_id: userId,
      metadata: { phone_masked: phoneMasked, customer_id: customer.id },
    });

    return json({
      status: "linked",
      customer_id: customer.id,
      is_new_link: true,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
