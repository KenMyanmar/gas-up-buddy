

## Preserve `cid` in BottomNav + OrderSuccess Navigation

After payment, navigation from `/order/success?cid=<uuid>` drops the `cid`, causing ProtectedRoute to redirect to PhoneEntry and re-trigger KBZ auto-login. Fix by reading `cid` from URL and re-appending it on every navigation.

### Changes

**1. `src/components/BottomNav.tsx`**
- Add `useSearchParams`; read `cid`.
- Add helper `navigateWithCid(path)` that appends `?cid=<uuid>` when present.
- Use it for all 4 tab buttons (Home, Orders, Alerts, Profile).
- Keep existing hide rules and styling unchanged.

**2. `src/pages/OrderSuccess.tsx`**
- Add `useSearchParams`; read `urlCustomerId`.
- Fallback `<Navigate>` (when no `orderId`): preserve `location.search` on the redirect target.
- "Track Order" button: `navigate(\`/order/tracking/${state.orderId}${location.search}\`)`.
- "Back to Home" button: `navigate(\`/home${location.search}\`)`.

### Out of Scope
- No edge function, auth, route guard, DB, PhoneEntry, auto-login, or OrderTracking changes.

### Acceptance
- "Back to Home" → `/home?cid=<uuid>` (no PhoneEntry redirect).
- BottomNav Home/Orders/Alerts/Profile preserve `cid`.
- No KBZ auto-login re-trigger after payment.

