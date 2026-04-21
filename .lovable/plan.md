

## Enable Orders + Tracking in KBZ Mini App (cid pattern)

`OrdersPage` and `OrderTracking` rely on `user?.id`, which is null in the KBZ WebView (no Supabase session). Thread the `cid` URL param through both pages so customer lookup works without auth.

### Changes

**1. `src/pages/OrdersPage.tsx`**
- Import `useSearchParams`; read `urlCustomerId = searchParams.get("cid")`.
- `useCustomerProfile(user?.id, urlCustomerId ?? undefined)` — direct customer lookup by id.
- Order card click → `navigate(\`/order/tracking/${order.id}${cidQs}\`)`.
- "Place your first order!" button → `/home?cid=<uuid>`.
- "Reorder" button → `/order/configure?cid=<uuid>`.

**2. `src/pages/OrderTracking.tsx`**
- Import `useSearchParams`; read `urlCustomerId`.
- Customer GPS fallback `useEffect`: gate on `user || urlCustomerId`; query `customers` by `id` when `urlCustomerId` is present, else `auth_user_id`. Add `urlCustomerId` to deps.
- Both back/header `navigate("/orders")` calls and `handleConfirmCancel` → `/orders?cid=<uuid>` when present.

### Out of Scope
- No edge function, DB/RLS, `useOrders` hook, auth/routing, or realtime subscription changes.

### Acceptance
- `/orders?cid=<uuid>` shows past orders.
- Tapping active order → `/order/tracking/<id>?cid=<uuid>` loads details.
- All navigation within these pages preserves `cid`.

