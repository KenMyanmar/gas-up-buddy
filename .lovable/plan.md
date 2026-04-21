

## SOT Alignment: Thread `cid` Through Order Flow

Propagate the `cid` URL param from Home → Configure → Confirm → Success so the customer identity persists without relying on a Supabase auth session (KBZ WebView).

### Changes

**1. `src/hooks/useOrders.ts`** — extend `useCustomerProfile` to accept an optional `customerId`. When provided, query `customers.id` directly (works without auth session); otherwise fall back to `auth_user_id` lookup. Query key includes whichever ID is used.

**2. `src/pages/OrderConfigure.tsx`**
- Import `useSearchParams`; read `cid` from URL.
- Pass `cid` into `useCustomerProfile(user?.id, urlCustomerId)`.
- Back button: `navigate(\`/home${location.search}\`)`.
- CONFIRM ORDER: `navigate(\`/order/confirm${location.search}\`, { state: {...} })` — preserves all existing state.

**3. `src/pages/OrderConfirm.tsx`**
- Import `useSearchParams`; read `cid` from URL.
- Pass `cid` into `useCustomerProfile(user?.id, urlCustomerId)`.
- Back button: `navigate(\`/order/configure${location.search}\`)`.
- All 3 success navigations: prepend `${location.search}` to `/order/success` path; keep state args unchanged.

### Out of Scope
- No edge function changes.
- No auth/route guard changes.
- No DB / RLS changes.

### Acceptance
- `/order/configure?cid=<uuid>` shows "Delivering to" bar.
- CONFIRM preserves `cid` → `/order/confirm?cid=<uuid>` renders with customer address.
- Pay button triggers `create-customer-order` + `kbzpay-create-payment` and opens KBZ cashier.

