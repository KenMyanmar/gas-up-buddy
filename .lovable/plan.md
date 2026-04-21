

# Fix Spinner Gap During `linked`/`new_account` → Auth State Hand-off

## Root cause (matches advisor's diagnosis)

Backend logs prove `kbzpay-auto-login` returns 200 with a session token. `setSession` succeeds. But there is a ~100ms window where:

- `kbz.status === "linked"` (or `"new_account"`) — set synchronously after `setSession` resolves
- `user === null` — `onAuthStateChange` hasn't fired yet
- `customerFetched === false`

Current spinner condition in `src/pages/PhoneEntry.tsx` (lines 47-51) only covers `idle`, `authenticating`, and `(user && !customerFetched)`. None match this window → component falls through all branches to the **Retry Card** ("We couldn't sign you in"). User sees failure even though auth succeeded.

## Change — single file, single condition

**File:** `src/pages/PhoneEntry.tsx`, lines 47-51.

Replace:
```ts
if (
  kbz.status === "idle" ||
  kbz.status === "authenticating" ||
  (user && !customerFetched)
) {
```

With:
```ts
if (
  kbz.status === "idle" ||
  kbz.status === "authenticating" ||
  kbz.status === "linked" ||
  kbz.status === "new_account" ||
  (user && !customerFetched)
) {
```

Spinner stays visible during the auth-state hand-off. The existing `useEffect` (lines 19-30) navigates to `/welcome` as soon as `user` populates and the customer query settles.

## Out of scope
- `index.html`, `kbzpay-bridge.ts`, `useKbzAutoLogin.ts` — already correct
- Supabase client (lock override already applied)
- Edge functions (v26 working)
- DB / RLS / migrations
- No `waitForMa` — `window.ma` is working (5 successful POSTs today prove it)

## Acceptance criteria
1. Inside real KBZ Pay app: spinner shows continuously from auto-login start until `/welcome` navigation. No Retry Card flash.
2. Console still shows `[KBZ-DIAG] setSession SUCCESS` followed by `[KBZ-DIAG] navigate /welcome (user + customer)` (or `(user, no customer row)`).
3. Existing `link_pending`, `linked_select`, `authorization_rejected`, and true-failure retry paths unchanged.

## Post-deploy checklist
1. Publish → Update. Wait 60s.
2. Open AnyGas via KBZ Pay → Mini Apps on phone.
3. Confirm `/welcome` lands without seeing the Retry Card.
4. Re-toggle `verify_jwt = false` on `kbzpay-create-payment` (Lovable resets on deploy).

