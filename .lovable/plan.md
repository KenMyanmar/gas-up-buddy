

# Fix Batch 3 — KBZ Pay API Spec Alignment

## Overview

8 fixes across 2 edge functions + 1 client-side file. All changes align our implementation with the official KBZ Pay API documentation.

---

## kbzpay-webhook (Fixes 1–5)

### Fix 1: Plain text "success" response
Replace all `JSON.stringify({ Response: { result_code: "SUCCESS" } })` responses with plain text `"success"`. KBZ retries infinitely on anything else.

For error responses (signature mismatch, missing data), keep returning non-success so KBZ retries — but for truly unrecoverable errors (config missing), still return `"success"` to stop retries and log the issue.

### Fix 2: Parse `body.Request` not `body.biz_content`
KBZ wraps callbacks in `{ "Request": { ... } }`. Change signature verification to extract `body.Request` first, with flat fallback.

### Fix 3: Check `trade_status === "PAY_SUCCESS"`
Remove `"SUCCESS"` and `"TRADE_SUCCESS"` checks. The official field is `trade_status` with value `"PAY_SUCCESS"`.

### Fix 4: Amount verification
After looking up the payment, compare `parseInt(fields.total_amount)` against `payment.amount`. On mismatch: log activity, return success (stop retries), but do NOT mark as paid.

### Fix 5: Store `mm_order_id` as `provider_ref`
On payment update, set `provider_ref: fields.mm_order_id` (KBZ's internal ID) instead of keeping our `merch_order_id` (already stored and used for lookup).

**Note on idempotency**: Currently we look up payments by `provider_ref = merchOrderId`. Since we're now storing `mm_order_id` as `provider_ref` on success, we need to look up by a different field for the initial match. We'll query payments where `metadata->>'merch_order_id'` matches OR use the existing `provider_ref` (which starts as our `merch_order_id` from the create-payment upsert). On success update, we overwrite `provider_ref` with `mm_order_id`. The idempotency check (`status === 'paid'`) still works because we check status before updating.

Actually simpler: keep the lookup by `provider_ref = merchOrderId` as-is. Store `mm_order_id` in a separate field (`transaction_id` column which already exists on the payments table, or in `metadata`). This avoids breaking the idempotency lookup.

**Revised approach for Fix 5**: Store `mm_order_id` in the `transaction_id` column (already used on line 113). Keep `provider_ref` as `merch_order_id` for idempotency lookup. This is already partially done — just ensure it's explicit.

---

## kbzpay-create-payment (Fixes 6–8)

### Fix 6: Remove VPS proxy, call KBZ directly
- Replace `fetch(\`${proxyUrl}/precreate\`)` with direct KBZ endpoint URLs
- UAT: `http://api-uat.kbzpay.com/payment/gateway/uat/precreate`
- PROD: `https://api.kbzpay.com/payment/gateway/precreate`
- Remove `PROXY_URL`, `PROXY_SECRET` from required env vars and headers
- Remove `X-Proxy-Secret` header

### Fix 7: Correct request body structure
Current code sends flat params. KBZ expects nested `{ "Request": { timestamp, method, notify_url, nonce_str, sign_type, sign, version, "biz_content": { merch_order_id, merch_code, appid, trade_type, title, total_amount, trans_currency, timeout_express } } }`.

- Split params into outer (timestamp, method, notify_url, nonce_str, sign_type, version) and biz_content (merch_order_id, merch_code, appid, trade_type, title, total_amount, trans_currency, timeout_express)
- Signature: flatten ALL params (outer + biz_content), sort, join, append `&key=`, SHA256 uppercase
- Timestamp: change from `YYYYMMDDHHMMSS` to Unix seconds (10-digit)
- Parse response as `response.Response.result === "SUCCESS"` and `response.Response.prepay_id`

### Fix 8: Build signed orderInfo for frontend
After getting `prepay_id` from precreate response, build a SECOND signature over exactly 5 fields (alphabetical): `appid`, `merch_code`, `nonce_str`, `prepay_id`, `timestamp`.

Return to frontend:
```
{
  prepay_id, 
  orderinfo: "appid=...&merch_code=...&nonce_str=...&prepay_id=...&timestamp=...",
  sign: ORDERINFO_SIGNATURE,
  signType: "SHA256"
}
```

### Client-side update: `src/lib/kbzpay-bridge.ts` and `src/pages/OrderConfirm.tsx`
Update `startPay` call to pass the new shape:
```
ma.callNativeAPI('startPay', {
  prepayId: data.prepay_id,
  orderInfo: data.orderinfo,
  sign: data.sign,
  signType: data.signType,
  useMiniResultFlag: true
}, callback);
```

Update `OrderConfirm.tsx` to pass the new response fields instead of `startPayParams`.

---

## Files Modified (4)

1. **`supabase/functions/kbzpay-webhook/index.ts`** — Fixes 1-5: plain text response, `body.Request` parsing, `PAY_SUCCESS` check, amount verification, `mm_order_id` in `transaction_id`
2. **`supabase/functions/kbzpay-create-payment/index.ts`** — Fixes 6-8: direct KBZ call, nested `{ Request: { biz_content } }` body, Unix timestamp, orderInfo signature, new response shape
3. **`src/lib/kbzpay-bridge.ts`** — Update `startPay` to pass `prepayId`, `orderInfo`, `sign`, `signType`, `useMiniResultFlag`
4. **`src/pages/OrderConfirm.tsx`** — Update payment response handling to use new field names

## Secrets cleanup
After deploy, the following secrets are no longer needed and can be removed:
- `KBZPAY_UAT_VPS_PROXY_URL`
- `KBZPAY_UAT_PROXY_SECRET`
- (and their PROD equivalents if set)

