

# Steps 1–8 Implementation Plan (v4.2 Final)

## Execution Order

All steps ship in sequence. Each step is a discrete commit-ready unit.

---

## Step 1: HashRouter + KBZ Profile Route

**File: `src/App.tsx`**
- Line 5: `import { HashRouter, Routes, Route, Navigate } from "react-router-dom"`
- Line 72: Add `<Route path="/onboarding/kbz-profile" element={<AuthOnlyRoute><KbzProfileComplete /></AuthOnlyRoute>} />`
- Lines 99/103: `<HashRouter>` / `</HashRouter>`
- Add import for `KbzProfileComplete`

---

## Step 2: Bridge + Utils

**New: `src/lib/kbzpay-bridge.ts`**
```text
Exports:
- LANDMARK_KEYWORDS constant (City, Tower, Condo, Residence, Plaza, Park, Garden, Square, Heights, View, Complex, Estate, Junction, Mall)
- isInKbzPay() — checks window.__majs_environment, window.ma, localStorage anygas_miniapp, URL param miniapp=1
- getAuthCode() — wraps window.ma.getAuthCode with 10s timeout, returns Promise<string>
- startPay(params) — wraps window.ma.callNativeAPI("startPay"), returns Promise
- pollOrderUntilPaid(supabase, orderId, timeoutMs=120000) — polls orders.payment_status every 2s
- maskAddress(fullAddress, township) — landmark-preserving masking per approved spec
```

**Modified: `src/utils/kbzpay.ts`** (line 15)
- Change `'kbzpay'` → `'kbzpay_miniapp'` (this only feeds `orderSource`, not `paymentMethod`)

---

## Step 3: `kbzpay-auto-login` Edge Function

**New: `supabase/functions/kbzpay-auto-login/index.ts`**

Phone helpers (copied from production `link-customer-account` pattern):
- `toLocal09(raw)` — +959/959/+95/95/09 → `09xxxxxxxxx`. ALL DB queries/writes use this.
- `toE164(local09)` — `09xxx` → `+959xxx`. ONLY for auth.admin calls.

Core flow:
1. Rate limit check (in-memory Map, 5 req/IP/min, soft/best-effort)
2. Read `authCode` from POST body
3. Exchange authCode → phone via `KBZPAY_{ENV}_VPS_PROXY_URL` + `PROXY_SECRET`
4. Normalize phone with `toLocal09()`
5. Query `customer_phones` JOIN `customers` LEFT JOIN `orders` (count, max date)
6. LEFT JOIN `auth.users` on customer `auth_user_id` to determine `has_auth_account`
7. Branch on match count:
   - **0 matches** → `new_account`: create auth user via admin API (`toE164`), return `{ status: "new_account", access_token, refresh_token }`
   - **1 match, has auth** → `linked`: generate session for existing auth user, return `{ status: "linked", access_token, refresh_token, customer_id }`
   - **1 match, no auth** → `link_pending`: generate token + candidates (single item), return `{ status: "link_pending", temporary_token, candidates }`
   - **2+ matches** → `linked_select` or `link_pending`: generate token, return all candidates sorted by `last_order_date DESC NULLS LAST, total_orders DESC`
8. Candidate shape: `{ customer_id, name, address_masked, last_order_date, total_orders, member_since, has_auth_account }`
9. Token: 32 random bytes → SHA256 hash stored in `kbzpay_link_tokens`, raw hex returned as `temporary_token`, `candidate_ids[]` pinned, 5-min TTL
10. Activity logs:
    - `kbzpay.multi_match.ambiguous_duplicate` → **`user_id: null`** (no auth user minted yet), metadata includes `phone_masked` (after `toLocal09()`), `candidate_count`, `candidate_ids`
    - `kbzpay.auto_login.success` → populate `user_id` with minted/existing auth user

---

## Step 4: `kbzpay-link-customer` Edge Function

**New: `supabase/functions/kbzpay-link-customer/index.ts`**

Critical: **Atomic token claim BEFORE any link work.**
```text
1. Hash incoming temporary_token with SHA256
2. Atomic UPDATE: 
   UPDATE kbzpay_link_tokens SET used_at = now() 
   WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
   RETURNING *
3. If 0 rows → HTTP 409 { error: "token_invalid_or_used" }
4. Validate selected_customer_id ∈ token.candidate_ids[] (or null for escape)
5. If null → create fresh customer + auth user, log kbzpay.customer.none_of_above_escape
6. If valid + no auth → create auth user (toE164) + link to customer, log kbzpay.customer.linked
7. If valid + has auth → mint session for existing user, log kbzpay.customer.multi_identity_select
8. Return { status, access_token, refresh_token, customer_id, is_new_link }
```

All activity logs populate `user_id` with the minted/existing auth user.

---

## Step 5: `kbzpay-create-payment` Edge Function

**New: `supabase/functions/kbzpay-create-payment/index.ts`**
- `verify_jwt = true` (default) — validate via `getClaims()`
- Validate order ownership, `payment_method = 'kbzpay'`, not already paid
- Build SHA256 signature: `SHA256(sortedQuerystring + "&key=" + APP_KEY).toUpperCase()`
- POST to KBZ `/precreate` via VPS proxy with HMAC
- 15s AbortController timeout
- Return signed `startPay` params

---

## Step 6: `kbzpay-webhook` Edge Function

**New: `supabase/functions/kbzpay-webhook/index.ts`**
- Verify KBZ signature (flat_raw/biz_raw fallback)
- `merch_order_id` → look up order, idempotency via `payments.provider_ref`
- Flip `orders.payment_status` → `paid`/`failed`, set `paid_at`
- Return `{ Response: { result_code: "SUCCESS" } }`

---

## Step 7: Patch `create-customer-order`

**Modified: `supabase/functions/create-customer-order/index.ts`**

After body parsing (~line 52), add:
```text
const ALLOWED_ORDER_SOURCES = ['customer_app', 'kbzpay_miniapp'];
const ALLOWED_PAYMENT_METHODS = ['cash', 'kbzpay'];
const orderSource = body.orderSource || 'customer_app';
const paymentMethod = body.paymentMethod || 'cash';
// Validate against allowlists → 400
// Cross-field: kbzpay_miniapp ⇔ kbzpay → 400 on mismatch
```

Line 143: change `order_source: "customer_app"` → `order_source: orderSource`
Add: `payment_method: paymentMethod` to the insert object (after line 143)

Note: Production already reads `body.orderSource`. This patch extends the hardcoded repo version to match prod + add validation. Functionally equivalent to prod-plus-extensions.

---

## Step 8: UI Wiring

**New: `src/hooks/useKbzAutoLogin.ts`**
- State machine: `idle → authenticating → linked|linked_select|link_pending|new_account|error|not-in-kbz`
- Calls `getAuthCode()` → invokes `kbzpay-auto-login` → on `linked`: `supabase.auth.setSession()`
- Stores `temporary_token` and `candidates` for selection UI

**Modified: `src/pages/PhoneEntry.tsx`**
- Replace 2s timeout with `useKbzAutoLogin` hook
- `linked` → navigate `/home`
- `linked_select`/`link_pending` → show candidate selection bottom sheet
- `new_account` → navigate `/onboarding/kbz-profile`
- `error`/`not-in-kbz` → fall through to manual phone input

Selection card UI (per approved spec):
```text
┌─────────────────────────────────────────────────────┐
│ U Kyaw Kyaw                            [Linked] ✓   │
│ Time City, Thingangyun                              │
│ 12 orders · Last: Mar 28, 2026                      │
│ Member since Mar 2025                               │
└─────────────────────────────────────────────────────┘
```
"None of these is me" escape button at bottom.

**New: `src/pages/KbzProfileComplete.tsx`**
- Reuses form pattern from `LinkNewCustomer` (name, address, township select, GPS button)
- Route: `/onboarding/kbz-profile`

**Modified: `src/pages/OrderConfirm.tsx`**
- Line 65 area: add `paymentMethod: isKBZPayMiniApp() ? 'kbzpay' : 'cash'` to body
- After order creation in KBZ mode: invoke `kbzpay-create-payment` → `startPay()` → "Payment submitted, confirming..." → `pollOrderUntilPaid()`
- Debounce: disable button after first tap

**Modified: `src/pages/OrderSuccess.tsx`**
- Accept optional `paymentStatus` in route state
- Show "Payment confirmed" or "Payment pending" based on status

**Modified: `supabase/config.toml`**
```toml
[functions.kbzpay-auto-login]
verify_jwt = false

[functions.kbzpay-link-customer]
verify_jwt = false

[functions.kbzpay-create-payment]
# verify_jwt = true (default)

[functions.kbzpay-webhook]
verify_jwt = false
```

---

## Files Summary

**New (7):** `src/lib/kbzpay-bridge.ts`, `src/hooks/useKbzAutoLogin.ts`, `src/pages/KbzProfileComplete.tsx`, `supabase/functions/kbzpay-auto-login/index.ts`, `supabase/functions/kbzpay-link-customer/index.ts`, `supabase/functions/kbzpay-create-payment/index.ts`, `supabase/functions/kbzpay-webhook/index.ts`

**Modified (7):** `src/App.tsx`, `src/pages/PhoneEntry.tsx`, `src/pages/OrderConfirm.tsx`, `src/pages/OrderSuccess.tsx`, `src/utils/kbzpay.ts`, `supabase/functions/create-customer-order/index.ts`, `supabase/config.toml`

## Deploy-Safety Invariants
- `order_source = 'kbzpay_miniapp'`, `payment_method = 'kbzpay'` — no underscore variants
- Phone: `toLocal09()` for DB, `toE164()` for auth only
- Atomic token claim before link work (prevents double-spend)
- `user_id = null` for ambiguous_duplicate logs only
- Webhook is payment status source of truth
- Grep for `kbz_pay` before push — must return zero

