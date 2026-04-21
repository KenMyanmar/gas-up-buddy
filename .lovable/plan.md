

# Fix `getAuthCode` Scope Casing — UPPERCASE per KBZ PM

KBZ Pay PM (Khine Phyo) confirmed the correct scope value is **uppercase** `AUTH_BASE`, not lowercase `auth_base`. Reference: https://miniapp.kbzpay.com/developer/reference?dir=H5#miniprogramcloud-h5-108.html

## File to edit

| File | Change |
|---|---|
| `src/lib/kbzpay-bridge.ts` | In `getAuthCode()`, change `scopes: ["auth_base"]` → `scopes: ["AUTH_BASE"]`. |

## Exact change

Before:
```ts
ma.getAuthCode({
  scopes: ["auth_base"],
  success: (res: { authCode?: string }) => {
```

After:
```ts
ma.getAuthCode({
  scopes: ["AUTH_BASE"],
  success: (res: { authCode?: string }) => {
```

One line. Four letters to uppercase. Array format preserved.

## Out of scope (do NOT touch)
- 60s timeout in `getAuthCode`
- `useKbzAutoLogin.ts` (no Promise.race, direct call preserved)
- All `[KBZ-DIAG]` log statements
- `getOpenUserInfo` diagnostic fallback
- `startPay`, payment flow, order flow
- `PhoneEntry.tsx` retry card UI
- Edge functions: `kbzpay-auto-login`, `kbzpay-link-customer`, `kbzpay-create-payment`, `kbzpay-webhook`, `create-customer-order`
- `/welcome` page, `verify_jwt`, DB schema, RLS, triggers, enums

## Acceptance criteria
1. Inside KBZ Pay: consent dialog appears, tester taps **Allow** → console shows `[KBZ-DIAG] getAuthCode SUCCESS` (no more `parameter.scopes` or `scope not authorized` error).
2. `[KBZ-DIAG] Invoking kbzpay-auto-login` fires → edge function returns 200.
3. `Final status: linked` (or `new_account`) → navigation to `/welcome`.
4. `kbzpay-auto-login` Edge Function logs show first ever 200 from a real device.

## Post-deploy checklist
1. Tester fully closes KBZ Pay (swipe away, not background), reopens, opens AnyGas Mini App fresh.
2. Taps **Allow** on consent dialog.
3. Screenshots full `[KBZ-DIAG]` console sequence — confirm `SUCCESS`, not `FAIL`.
4. Confirm `kbzpay-auto-login` 200 in Edge Function logs.
5. Re-toggle `verify_jwt = false` on `kbzpay-create-payment` (Lovable deploys reset it).
6. Run full order flow end-to-end.

