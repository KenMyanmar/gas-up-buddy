

# Fix `getAuthCode` `scopes` Parameter Format

KBZ Pay runtime rejects the current call with:
`"getAuthCode fail, parameter error: parameter.scopes type not legal, please check it."`

The `scopes` field must be an **array**, and the correct value is `auth_base` (not `auth_user`).

## File to edit

| File | Change |
|---|---|
| `src/lib/kbzpay-bridge.ts` | In `getAuthCode()`, change `scopes: "auth_user"` → `scopes: ["auth_base"]`. |

## Exact change

Before:
```ts
scopes: "auth_user",
```

After:
```ts
scopes: ["auth_base"],
```

Two edits in one line: string → array, and `auth_user` → `auth_base`.

## Out of scope (do NOT touch)
- Anything else in `kbzpay-bridge.ts` (timeouts, logs, callbacks, `startPay`)
- `useKbzAutoLogin.ts` (hook flow, diagnostics, retry logic)
- `PhoneEntry.tsx` retry card UI
- Edge functions: `kbzpay-auto-login`, `kbzpay-link-customer`, `kbzpay-create-payment`, `kbzpay-webhook`, `create-customer-order`
- `/welcome` page, payment flow, order flow
- `verify_jwt`, DB schema, RLS, triggers, enums

## Acceptance criteria
1. Inside KBZ Pay: consent dialog appears, tester taps **Allow** → console shows `[KBZ-DIAG] getAuthCode SUCCESS` (no more `parameter.scopes type not legal` error).
2. `[KBZ-DIAG] Invoking kbzpay-auto-login` fires → edge function returns 200.
3. `Final status: linked` (or `new_account`) → navigation to `/welcome`.
4. `kbzpay-auto-login` Edge Function logs show first ever 200 from a real device.

## Post-deploy checklist
1. Tester closes KBZ Pay fully, reopens, opens AnyGas Mini App fresh.
2. Taps **Allow** on consent dialog.
3. Screenshots full `[KBZ-DIAG]` console sequence — confirm `SUCCESS`, not `FAIL`.
4. Confirm `kbzpay-auto-login` 200 in Edge Function logs.
5. Re-toggle `verify_jwt = false` on `kbzpay-create-payment` (Lovable deploys reset it).
6. Run full order flow end-to-end.

