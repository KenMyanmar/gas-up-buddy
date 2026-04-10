

# KBZ Pay Mini App Integration — Plan v4.2 (Implemented)

## Status: Steps 1–8 SHIPPED ✅

### What was implemented

**New files (7):**
- `src/lib/kbzpay-bridge.ts` — JSSDK wrappers (getAuthCode, startPay, pollOrderUntilPaid, maskAddress)
- `src/hooks/useKbzAutoLogin.ts` — State machine hook for KBZ auto-login flow
- `src/pages/KbzProfileComplete.tsx` — Profile completion for new KBZ Pay users
- `supabase/functions/kbzpay-auto-login/index.ts` — AuthCode→phone exchange, candidate matching
- `supabase/functions/kbzpay-link-customer/index.ts` — Atomic token claim + account linking
- `supabase/functions/kbzpay-create-payment/index.ts` — KBZ /precreate + signed startPay params
- `supabase/functions/kbzpay-webhook/index.ts` — Payment status webhook with idempotency

**Modified files (7):**
- `src/App.tsx` — HashRouter + /onboarding/kbz-profile route
- `src/pages/PhoneEntry.tsx` — useKbzAutoLogin hook + candidate selection UI
- `src/pages/OrderConfirm.tsx` — paymentMethod field + KBZ Pay flow (startPay + polling)
- `src/pages/OrderSuccess.tsx` — Payment status display (paid/pending/failed)
- `src/utils/kbzpay.ts` — getOrderSource() returns 'kbzpay_miniapp'
- `supabase/functions/create-customer-order/index.ts` — Allowlists + cross-field validation
- `supabase/config.toml` — verify_jwt config for all 4 new functions

**Migration:**
- `kbzpay_link_tokens` table with token_hash, phone_local, candidate_ids, expires_at, used_at
- pg_cron cleanup job every 15 min

### Deploy-safety invariants (verified)
- order_source = 'kbzpay_miniapp', payment_method = 'kbzpay'
- Phone: toLocal09() for DB, toE164() for auth only
- Atomic token claim before link work
- user_id = null for ambiguous_duplicate logs only
- Webhook is payment status source of truth
- Zero hits for kbz_pay in new code (only in read-only types.ts enum)

### Pending (requires external setup)
- KBZ Pay secrets: KBZPAY_UAT_VPS_PROXY_URL, KBZPAY_UAT_PROXY_SECRET, KBZPAY_UAT_APP_ID, KBZPAY_UAT_APP_KEY, KBZPAY_UAT_MERCH_CODE, KBZPAY_ENV
- VPS proxy deployment
- KBZ Pay merchant credentials from Khine Phyo
