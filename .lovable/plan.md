

# Fix Auto-Login Loop on `PhoneEntry`

Backend `kbzpay-auto-login` v25 is healthy (200 + session tokens) but the frontend re-mounts and re-fires it ~10× in 30s, leaving the user stuck on the spinner. Two collaborating bugs: `ranOnce` is per-mount (resets on remount), and navigation triggers before `customer` is loaded so the destination bounces back.

## Files to edit

| File | Change |
|---|---|
| `src/hooks/useKbzAutoLogin.ts` | Add module-level `globalRanOnce` flag. Short-circuit `runAutoLogin` if a Supabase session already exists. Reset `globalRanOnce` in `retry()`. |
| `src/pages/PhoneEntry.tsx` | Single navigation trigger `(user && customer)`. Keep spinner visible while `(user && !customer)`. |

## `src/hooks/useKbzAutoLogin.ts`

Add at the top of the module (outside the hook):
```ts
let globalRanOnce = false;
```

Inside `runAutoLogin`, before flipping `running.current = true`:
```ts
const { data: { session: existing } } = await supabase.auth.getSession();
if (existing) {
  console.log("[KBZ-DIAG] Session already exists — skipping auto-login");
  safeSet(setStatus, "linked");
  return;
}
```

Replace the mount effect:
```ts
useEffect(() => {
  if (globalRanOnce) {
    console.log("[KBZ-DIAG] globalRanOnce already true — skipping mount run");
    return;
  }
  globalRanOnce = true;
  console.log("[KBZ-DIAG] useKbzAutoLogin mounted (first run)");
  runAutoLogin();
}, [runAutoLogin]);
```

Update `retry`:
```ts
const retry = useCallback(() => {
  globalRanOnce = false;
  running.current = false;
  runAutoLogin();
}, [runAutoLogin]);
```

Leave `AbortController`, `safeSet`, `mounted`, status union, candidate handling, and `handleOpenSettings` untouched.

## `src/pages/PhoneEntry.tsx`

Replace the navigation effect with a single `(user && customer)` trigger — drop the `kbz.status === "linked" | "new_account"` branch:
```tsx
useEffect(() => {
  if (user && customer) {
    navigate("/welcome", { replace: true });
  }
}, [user, customer, navigate]);
```

Update the spinner early-return so we don't flash the Retry Card while the customer profile query is loading:
```tsx
if (
  kbz.status === "idle" ||
  kbz.status === "authenticating" ||
  (user && !customer)
) {
  return <Spinner copy="Connecting via KBZ Pay..." />;
}
```

Leave `link_pending`, `linked_select`, `authorization_rejected`, and the existing Retry Card branches unchanged.

## Diagnostic note (no edit)

After deploy, watch `WelcomePage` + its route guard. If `/welcome` still bounces back to `/onboarding/phone` when `customer` exists, a follow-up plan will adjust the guard. Not touched here.

## Out of scope
- Edge functions (`kbzpay-auto-login`, `kbzpay-link-customer`, `kbzpay-create-payment`, `kbzpay-webhook`, `create-customer-order`)
- `src/lib/kbzpay-bridge.ts`, scopes, `openSettings`
- `useCustomerProfile` (already hook-stable via `enabled`)
- DB schema, RLS, `verify_jwt`
- Authorization Card / Retry Card UI

## Acceptance criteria
1. Exactly **1** `kbzpay-auto-login` POST per Mini App open.
2. Console: `useKbzAutoLogin mounted (first run)` once; later mounts log `globalRanOnce already true`.
3. Existing customer reaches `/welcome` and stays.
4. No Retry Card flash during `(user && !customer)`.
5. Retry Card "Try Again" still works (resets `globalRanOnce` + `running.current`).

## Post-deploy checklist
1. Open Mini App → 1 POST → land on `/welcome`.
2. Airplane mode → Retry Card → Try Again → 1 new POST.
3. Reject KBZ consent → Authorization Card → Allow Access → 1 new POST.
4. Re-toggle `verify_jwt = false` on `kbzpay-create-payment`.
5. Full order flow end-to-end.

