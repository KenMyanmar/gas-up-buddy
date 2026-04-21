

## Pass `customerId` to Edge Functions in OrderConfirm

Add `customerId: urlCustomerId ?? undefined` to both edge function payloads in `handlePlaceOrder` so the backend can identify the customer without relying on a JWT session (KBZ WebView).

### Change

**`src/pages/OrderConfirm.tsx`** — `handlePlaceOrder`:

1. `create-customer-order` invoke body: append `customerId: urlCustomerId ?? undefined`.
2. `kbzpay-create-payment` invoke body: change from `{ orderId }` to `{ orderId, customerId: urlCustomerId ?? undefined }`.

`urlCustomerId` is already read from `searchParams` earlier in the component — no new imports or hooks required.

### Out of Scope
- No other files.
- No auth/routing/edge function changes.
- No validation or analytics additions.

### Acceptance
- `create-customer-order` returns 200 with `customerId` in payload.
- `kbzpay-create-payment` returns 200 with `prepay_id`.
- KBZ Pay cashier opens.

