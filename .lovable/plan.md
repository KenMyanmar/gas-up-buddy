## v55 — kbzpay-auto-login: remove customer_phones insert in new_account branch

**File:** `supabase/functions/kbzpay-auto-login/index.ts`

**Change:** Delete lines 612–619 (and the trailing blank line 620) — the `if (customerId) { await supabaseAdmin.from("customer_phones").insert({...}) }` block inside the `if (candidates.length === 0)` new_account branch.

**Keep:** Line 610 `const customerId = newCustomer?.id || null;` — still consumed by the activity_logs insert (`entity_id`, metadata `customer_id`) and the response payload below.

**Out of scope:** No other lines, files, configs, or functions touched. `supabase/config.toml` untouched (`verify_jwt = false` preserved). No frontend changes.

**Deploy:** Lovable commits → GitHub auto-redeploys to Supabase (version → 55).