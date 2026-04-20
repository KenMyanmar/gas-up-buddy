

# Fix `getAuthCode` Timeout Race Condition

The KBZ Pay native consent dialog needs ~10–15 s for the user to read and tap **Allow**. We currently kill that flow at 5 s in two places, so when the user finally accepts, the `authCode` arrives into an already-rejected Promise and is lost. Result: `kbzpay-auto-login` is never called and the retry card stays forever.

Fix: collapse the two competing 5 s timeouts into a single 60 s timeout (same pattern `startPay` already uses successfully).

## Files to edit

| File | Change |
|---|---|
| `src/hooks/useKbzAutoLogin.ts` | Remove the outer `Promise.race` 5 s timeout wrapper around `getAuthCode()`. Call `getAuthCode()` directly and keep the `__bridgeFailure` tag in `.catch`. |
| `src/lib/kbzpay-bridge.ts` | Inside `getAuthCode()`, change the internal `setTimeout` from `5_000` to `60_000` ms and update the diag log string to "TIMEOUT after 60s". |

## Exact replacements

**`src/hooks/useKbzAutoLogin.ts` (lines 55–66)** — replace the `Promise.race` block with:
```ts
console.log("[KBZ-DIAG] Calling getAuthCode...");
// Bridge owns the timeout (60s, matches startPay). No outer race.
const authCode = await getAuthCode().catch((e) => {
  throw Object.assign(new Error(e?.message || "getAuthCode failed"), {
    __bridgeFailure: true,
  });
});
```

**`src/lib/kbzpay-bridge.ts` (lines 45–48)** — replace:
```ts
const timer = setTimeout(() => {
  console.log("[KBZ-DIAG] getAuthCode TIMEOUT after 60s");
  reject(new Error("getAuthCode timed out"));
}, 60_000);
```

## Out of scope (do NOT touch)
- `scopes: "auth_user"` value — consent dialog rendering proves it's accepted
- Edge functions: `kbzpay-auto-login`, `kbzpay-link-customer`, `kbzpay-create-payment`, `kbzpay-webhook`, `create-customer-order`
- `/welcome` page, `PhoneEntry.tsx` retry card UI
- `startPay`, payment / order flows
- `isInKbzPay()` / `isKbzPayRuntime()` detection logic
- `verify_jwt`, DB schema, RLS, triggers, enums
- `[KBZ-DIAG]` log statements elsewhere — keep them

## Acceptance criteria
1. Inside KBZ Pay, consent dialog appears, tester taps **Allow** within 60 s → console shows `getAuthCode SUCCESS` → `Invoking kbzpay-auto-login` → `Final status: linked` (or `new_account`) → navigation to `/welcome`.
2. `kbzpay-auto-login` Edge Function logs show a 200 response (first ever non-zero invocation from real device).
3. If user ignores the dialog for >60 s, single timeout fires once → `retry_needed` → retry card; `Try Again` re-prompts the dialog.
4. Desktop browser (no `ma`) → immediate `bridge not available` → `retry_needed` (unchanged).

## Post-deploy checklist
1. Tester closes KBZ Pay fully, reopens, opens AnyGas Mini App fresh.
2. Reads consent dialog at normal pace, taps **Allow**.
3. Screenshots full `[KBZ-DIAG]` console sequence.
4. Confirm `kbzpay-auto-login` 200 in Edge Function logs.
5. Re-toggle `verify_jwt = false` on `kbzpay-create-payment` (Lovable deploys reset it).
6. Run full order flow end-to-end.

