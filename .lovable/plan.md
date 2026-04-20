

# KBZ Auto-Login Diagnostic Logging + Detection Hardening

Add `[KBZ-DIAG]`-prefixed `console.log` traces at every step of the auto-login flow, harden the bridge detection to check for the actual `ma.getAuthCode` function (not generic `window.ma` presence), and add a `getOpenUserInfo` diagnostic fallback. Frontend-only, two files.

## Files to edit

| Action | File | Change |
|---|---|---|
| Edit | `src/lib/kbzpay-bridge.ts` | Add `isKbzPayRuntime()` that checks `typeof window.ma.getAuthCode === "function"` directly. Keep existing `isInKbzPay()` for non-auth callers (sticky `miniapp=1` flag still useful for payment startPay path). Add `[KBZ-DIAG]` logs inside `getAuthCode()` at entry, success, and fail callbacks. |
| Edit | `src/hooks/useKbzAutoLogin.ts` | Add `[KBZ-DIAG]` logs at hook mount, before/after detection, before `getAuthCode`, before edge function invoke, on response, on session set, and at every error branch. Use `isKbzPayRuntime()` (not `isInKbzPay()`) for the catch-branch decision. Add a `getOpenUserInfo` diagnostic call when `getAuthCode` fails (logs only — no behavior change). |

No edge function changes. No `/welcome`, payment, schema, RLS, or `verify_jwt` changes. Retry card UI stays exactly as shipped.

## `kbzpay-bridge.ts` additions

```ts
export function isKbzPayRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const ma = (window as any).ma;
  if (!ma || typeof ma !== "object") return false;
  return typeof ma.getAuthCode === "function";
}
```

Inside existing `getAuthCode()`:
- `console.log("[KBZ-DIAG] getAuthCode() invoked, ma type:", typeof ma)`
- on success: `console.log("[KBZ-DIAG] getAuthCode SUCCESS:", JSON.stringify(res))`
- on fail: `console.log("[KBZ-DIAG] getAuthCode FAIL:", JSON.stringify(err))`
- on timeout: `console.log("[KBZ-DIAG] getAuthCode TIMEOUT after 5s")` (also align internal timeout to 5s for consistency with hook)

## `useKbzAutoLogin.ts` log points

```text
[KBZ-DIAG] useKbzAutoLogin mounted
[KBZ-DIAG] window.ma type: <typeof>
[KBZ-DIAG] ma.getAuthCode type: <typeof>
[KBZ-DIAG] isKbzPayRuntime result: true|false
[KBZ-DIAG] Calling getAuthCode...
[KBZ-DIAG] authCode received, length: N
[KBZ-DIAG] Invoking kbzpay-auto-login edge function
[KBZ-DIAG] Edge function response status: <status>
[KBZ-DIAG] Setting Supabase session
[KBZ-DIAG] Final status: <status>
```

Error branches:
- `[KBZ-DIAG] Bridge failure → retry_needed: <message>`
- `[KBZ-DIAG] Backend error → error: <message>`
- `[KBZ-DIAG] Attempting getOpenUserInfo fallback (diagnostic only)` then log its success/fail JSON

Behavior unchanged: success → existing status routing; bridge failure / `!isKbzPayRuntime()` → `retry_needed`; backend non-2xx after valid authCode → `error`. Both terminal states render the same retry card already in `PhoneEntry.tsx`.

## Detection swap

Replace the `!isInKbzPay()` check in the catch block with `!isKbzPayRuntime()`. Reason: `isInKbzPay()` returns true whenever `window.ma` exists at all (even partially-injected bridges with no `getAuthCode`), which hides exactly the failure mode we're trying to diagnose. Other callers of `isInKbzPay()` (payment, miniapp sticky flag) keep using it unchanged.

## Out of scope (do NOT touch)
- Edge functions: `kbzpay-auto-login`, `kbzpay-link-customer`, `kbzpay-create-payment`, `kbzpay-webhook`, `create-customer-order`
- `/welcome` page
- Retry card UI in `PhoneEntry.tsx` (no rendering changes)
- Payment flow, `startPay`, miniapp sticky-flag behavior in `isInKbzPay()`
- DB schema, RLS, enums, triggers
- `verify_jwt` settings

## Acceptance criteria
1. On every page load of `/#/onboarding/phone`, `[KBZ-DIAG] useKbzAutoLogin mounted` appears in console first.
2. Inside real KBZ Pay with working bridge: full success log sequence appears, ending at `Final status: linked` (or `new_account`) and navigation to `/welcome`.
3. Inside KBZ Pay with bridge timeout/failure: logs end at `[KBZ-DIAG] getAuthCode FAIL` or `TIMEOUT` followed by `Bridge failure → retry_needed`, then `getOpenUserInfo` diagnostic line. Retry card renders.
4. Outside KBZ Pay (desktop browser): logs end at `isKbzPayRuntime result: false` → `retry_needed`. No crash, retry card renders.
5. No edge function or backend changes; `kbzpay-auto-login` still receives invocations only when a valid authCode is obtained.

## Post-deploy test protocol
1. Tester closes KBZ Pay fully, reopens, opens AnyGas Mini App fresh.
2. Opens debug console "Log" tab, screenshots full `[KBZ-DIAG]` sequence.
3. Diagnose from last log line per the spec table.
4. Re-toggle `verify_jwt = false` on `kbzpay-create-payment` (Lovable deploys reset it).
5. Confirm Edge Function logs show a `kbzpay-auto-login` 200 if and only if a successful auto-login was attempted.

