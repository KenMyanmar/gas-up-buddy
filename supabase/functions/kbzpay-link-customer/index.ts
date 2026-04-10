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

    // Validate selected_customer_id
    if (selected_customer_id !== null && selected_customer_id !== undefined) {
      if (!candidateIds.includes(selected_customer_id)) {
        return json({ error: "selected_customer_id not in candidates" }, 400);
      }
    }

    const e164 = toE164(phone);

    // ── Null selection → "none of these" escape ────────────────
    if (selected_customer_id === null || selected_customer_id === undefined) {
      // Create fresh auth user
      let userId: string;
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        phone: e164,
        phone_confirm: true,
      });

      if (createErr) {
        // Might already exist
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existing = users?.find((u) => u.phone === e164);
        if (existing) {
          userId = existing.id;
        } else {
          console.error("Create user error:", createErr);
          return json({ error: "Failed to create account" }, 500);
        }
      } else {
        userId = newUser.user.id;
      }

      // Log
      await supabaseAdmin.from("activity_logs").insert({
        entity_type: "customer",
        entity_id: userId,
        action_type: "kbzpay.customer.none_of_above_escape",
        summary: `KBZ Pay user ${phoneMasked} selected "none of these" — new account path`,
        user_id: userId,
        metadata: { phone_masked: phoneMasked, candidate_count: candidateIds.length },
      });

      return json({
        status: "new_account",
        customer_id: null,
        is_new_link: true,
        auth_user_id: userId,
        phone_e164: e164,
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
        auth_user_id: customer.auth_user_id,
        phone_e164: e164,
      });
    }

    // No auth → create auth user + link
    let userId: string;
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      phone: e164,
      phone_confirm: true,
    });

    if (createErr) {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const existing = users?.find((u) => u.phone === e164);
      if (existing) {
        userId = existing.id;
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
      auth_user_id: userId,
      phone_e164: e164,
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
