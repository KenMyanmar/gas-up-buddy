# Frontend Payment State Fixes

Apply 4 surgical changes to make payment status correctly drive UI. Scope locked to 4 files.

## Files & Changes

### 1. `src/hooks/useOrders.ts`
- Add `payment_status: string | null` and `payment_method: string | null` to `OrderWithDetails` interface (after `status`).
- Add `payment_status, payment_method` to the `.select()` string in the orders query.

### 2. `src/pages/OrderTracking.tsx`
- Extend lucide-react import with `Clock, AlertCircle`.
- Replace the single "Order confirmed" banner (gated only on `status === "new"`) with three payment-status-aware banners:
  - `status==="new" && payment_status==="paid"` → existing green "Order confirmed!" banner.
  - `status==="new" && payment_status==="pending"` → amber Clock "Payment processing" banner.
  - `status==="new" && (payment_status==="failed" || "expired")` → red AlertCircle "Payment failed" banner.
- Leave handleCheckPayment, showCheckPayment, realtime, map, and all other code untouched.

### 3. `src/pages/OrdersPage.tsx`
- Update the `filtered` const so:
  - "Active" excludes orders where `payment_status` is `failed` or `expired`.
  - "Cancelled" includes `status==="cancelled"` OR failed/expired payment.
- Replace the status badge `<span>` on order cards so failed/expired payments render a destructive "Payment Failed" badge, pending payments on `new` orders render amber "Payment Pending", otherwise the existing label/style.
- No changes to tabs array, activeStatuses, imports, or other logic.

### 4. `src/pages/OrderSuccess.tsx`
- In `handleAction`, change `retry` navigation from `/order/configure...` to `/order/tracking/${state.orderId}${location.search}`.
- In the failure variant's `screenConfig`, change `primaryButton.text` from `"Try Again"` to `"View Order Status"`.
- Success and pending variants remain byte-identical.

## Verification
- TypeScript clean.
- Pending-payment order on tracking page shows amber banner.
- OrdersPage Active tab excludes failed/expired payments; they appear under Cancelled with red badge.
- OrderSuccess failure screen → "View Order Status" → tracking page (preserves orderId).

## Out of Scope
No edge function, schema, RLS, or other file changes.
