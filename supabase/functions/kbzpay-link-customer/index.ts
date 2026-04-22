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

// ── Session minting via password-rotation ────────────────────────
async function mintSession(
  supabaseAdmin: any,
  authUserId: string,
  e164: string,
): Promise<{ access_token: string; refresh_token: string; expires_at: number; expires_in: number }> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const otp = crypto.randomUUID();
  const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: otp });
  if (pwErr) throw new Error(`Failed to set temp password: ${pwErr.message}`);

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await anonClient.auth.signInWithPassword({
    phone: e164,
    password: otp,
  });
  if (error || !data.session) throw new Error(`Session minting failed: ${error?.message || "no session"}`);

  // NOTE: Post-signIn password rotation removed (Option A).
  // See kbzpay-auto-login/index.ts for full rationale. Rotating immediately
  // after signInWithPassword invalidated the just-issued refresh token in
  // the KBZ Pay iPhone WebView, breaking supabase.auth.setSession on the
  // client. Temp password remains as opaque server-only material.
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

    // Hash the incoming token
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

    const phone = tokenData.phone_local;
    const candidateIds: string[] = tokenData.candidate_ids;
    const phoneMasked = "09xxxx" + phone.slice(-4);
    const e164 = toE164(phone);

    // Validate selected_customer_id
    if (selected_customer_id !== null && selected_customer_id !== undefined) {
      if (!candidateIds.includes(selected_customer_id)) {
        return json({ error: "selected_customer_id not in candidates" }, 400);
      }
    }

    // ── Null selection → "none of these" escape ────────────────
    if (selected_customer_id === null || selected_customer_id === undefined) {
      // Add 1 guard: reject if any candidate already has an auth account
      // (prevents duplicate auth_user_id on customers → maybeSingle() breaks)
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

      // Create fresh auth user
      let userId: string;
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        phone: e164,
        phone_confirm: true,
        password: crypto.randomUUID(),
      });

      if (createErr) {
        // Might already exist — orphan auth user
        const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const existing = (users || []).find((u: any) => u.phone === e164);
        if (existing) {
          userId = existing.id;

          // Log orphan detection
          await supabaseAdmin.from("activity_logs").insert({
            entity_type: "auth_user",
            entity_id: userId,
            action_type: "kbzpay.auto_login.orphan_auth_user_detected",
            summary: `Orphan auth user detected for ${phoneMasked} during none_of_above link`,
            user_id: userId,
            metadata: {
              phone_masked: phoneMasked,
              fallback_reason: "createUser_duplicate_phone",
              existing_user_id: userId,
              source: "kbzpay_miniapp",
              path: "link_customer.none_of_above",
            },
          });
        } else {
          console.error("Create user error:", createErr);
          return json({ error: "Failed to create account" }, 500);
        }
      } else {
        userId = newUser.user.id;
      }

      // Create customers row (P0-3 fix)
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

      // Log
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
      // Has auth → mint session for existing user
      const session = await mintSession(supabaseAdmin, customer.auth_user_id, e164);

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

    // No auth → create auth user + link
    let userId: string;
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      phone: e164,
      phone_confirm: true,
      password: crypto.randomUUID(),
    });

    if (createErr) {
      const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const existing = (users || []).find((u: any) => u.phone === e164);
      if (existing) {
        userId = existing.id;

        // Log orphan detection
        await supabaseAdmin.from("activity_logs").insert({
          entity_type: "auth_user",
          entity_id: userId,
          action_type: "kbzpay.auto_login.orphan_auth_user_detected",
          summary: `Orphan auth user detected for ${phoneMasked} during link-no-auth`,
          user_id: userId,
          metadata: {
            phone_masked: phoneMasked,
            fallback_reason: "createUser_duplicate_phone",
            existing_user_id: userId,
            source: "kbzpay_miniapp",
            path: "link_customer.link_no_auth",
          },
        });
      } else {
        console.error("Create user error:", createErr);
        return json({ error: "Failed to create account" }, 500);
      }
    } else {
      userId = newUser.user.id;
    }

    // Link customer to auth user
    const { error: linkErr } = await supabaseAdmin
      .from("customers")
      .update({ auth_user_id: userId })
      .eq("id", customer.id);

    if (linkErr) {
      console.error("Link customer error:", linkErr);
      return json({ error: "Failed to link account" }, 500);
    }

    // Mint session (P0-1 fix)
    const session = await mintSession(supabaseAdmin, userId, e164);

    // Log
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
