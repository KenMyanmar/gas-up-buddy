

# Frontend Session Handoff Diagnostic + Fix

Backend is confirmed perfect (phone extracted, customer matched `79e0bf1e…`, session minted). The frontend receives the session but never navigates to `/welcome`. This plan adds the diagnostic logs the advisor asked for AND closes the three remaining frontend gaps in one pass.

## Root cause analysis

Looking at `useKbzAutoLogin.ts` after the last fix, the success path does:
```ts
await supabase.auth.setSession({ access_token, refresh_token });
setStatus("linked");
```
Three real problems remain:

1. **No log around `setSession`** — we can't tell from the device whether `setSession` succeeded, threw, or was skipped. Advisor explicitly asked for this.
2. **`globalRanOnce` blocks the success-side state update on remount** — if React re-mounts `PhoneEntry` in the brief window between `setSession` resolving and `onAuthStateChange` firing, the new mount sees `globalRanOnce=true`, skips `runAutoLogin`, and `kbz.status` stays at default `"idle"` → spinner forever. The session DID get set, but the component that would navigate is gone.
3. **`PhoneEntry` only navigates on `(user && customer)`** — if `customer` query errors or returns `null` (e.g. RLS race right after `setSession`), the user is authenticated but stuck on the spinner with no fallback.

## Files to edit

| File | Change |
|---|---|
| `src/hooks/useKbzAutoLogin.ts` | Add `[KBZ-DIAG]` logs around `setSession`. On mount when `globalRanOnce` is already true, check `supabase.auth.getSession()`; if a session exists, set `status="linked"` so the parent can navigate. |
| `src/pages/PhoneEntry.tsx` | Add fallback navigation: when `user` is present and `customer` query has settled (loaded or errored) — navigate to `/welcome`. Add `[KBZ-DIAG]` log when navigation fires. |
| `src/pages/WelcomePage.tsx` | (Read only — verify it doesn't bounce back when `customer` is null. If it does, add a follow-up plan.) |

## `src/hooks/useKbzAutoLogin.ts`

Around the `setSession` call inside `runAutoLogin`, wrap with diagnostics:
```ts
console.log("[KBZ-DIAG] setSession START, has access_token:", !!data.access_token);
try {
  const { data: setData, error: setErr } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
  if (setErr) {
    console.error("[KBZ-DIAG] setSession ERROR:", setErr.message);
    safeSet(setStatus, "retry_needed");
    safeSet(setError, `Session error: ${setErr.message}`);
    return;
  }
  console.log("[KBZ-DIAG] setSession SUCCESS, user id:", setData.session?.user?.id);
} catch (e) {
  console.error("[KBZ-DIAG] setSession THREW:", e);
  safeSet(setStatus, "retry_needed");
  return;
}
safeSet(setStatus, "linked");
console.log("[KBZ-DIAG] status -> linked");
```

In the mount effect, when `globalRanOnce` is already true, still reflect existing session into local status so a remount doesn't strand the spinner:
```ts
useEffect(() => {
  if (globalRanOnce) {
    console.log("[KBZ-DIAG] globalRanOnce true — checking existing session");
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("[KBZ-DIAG] existing session found on remount → linked");
        safeSet(setStatus, "linked");
      }
    });
    return;
  }
  globalRanOnce = true;
  console.log("[KBZ-DIAG] useKbzAutoLogin mounted (first run)");
  runAutoLogin();
}, [runAutoLogin]);
```

## `src/pages/PhoneEntry.tsx`

Pull `isLoading` / `isFetched` from `useCustomerProfile` and add a fallback navigation so a missing/errored customer row doesn't strand an authenticated user. Replace the navigation effect with:
```tsx
const { data: customer, isFetched: customerFetched } = useCustomerProfile(user?.id);

useEffect(() => {
  if (!user) return;
  if (customer) {
    console.log("[KBZ-DIAG] navigate /welcome (user + customer)");
    navigate("/welcome", { replace: true });
    return;
  }
  // Fallback: user is authenticated, customer query has settled with no row.
  // Still send to /welcome — that page can decide whether to show link flow.
  if (customerFetched && !customer) {
    console.log("[KBZ-DIAG] navigate /welcome (user, no customer row)");
    navigate("/welcome", { replace: true });
  }
}, [user, customer, customerFetched, navigate]);
```

Update the spinner gate to wait for `customerFetched`, not just `customer`:
```tsx
if (
  kbz.status === "idle" ||
  kbz.status === "authenticating" ||
  (user && !customerFetched)
) {
  return <Spinner copy="Connecting via KBZ Pay..." />;
}
```

## Verification (read-only)

Open `src/pages/WelcomePage.tsx` and any wrapping route guard. Confirm: when `user` is present but `customer` is null/loading, the page does not `navigate("/onboarding/phone")`. If it does, log a finding for a follow-up plan — do not edit in this pass.

## Out of scope
- Edge functions (backend confirmed perfect)
- `kbzpay-bridge.ts`, scopes
- DB / RLS / `verify_jwt`
- Authorization Card / Retry Card UI
- Order, payment, tracking flows

## Acceptance criteria
1. Console shows `[KBZ-DIAG] setSession START` → `setSession SUCCESS, user id: …` → `status -> linked` on a fresh open.
2. Console shows `[KBZ-DIAG] navigate /welcome (user + customer)` exactly once.
3. On remount during the success window, console shows `existing session found on remount → linked` instead of stranding on spinner.
4. Edge function still hit exactly 1× per Mini App open.
5. Existing customer (`79e0bf1e…`) lands on `/welcome` and stays.

## Post-deploy checklist
1. Click **Publish → Update** in Lovable. Wait 60s.
2. Hard-refresh `miniapp.anygas.org` on desktop with DevTools open. Capture `[KBZ-DIAG]` chain.
3. Open in real KBZ Mini App. Confirm 1 POST + landing on `/welcome`.
4. If still stuck after `setSession SUCCESS`, paste the next 5 console lines so we can see whether the issue is navigation, route guard, or `useCustomerProfile`.
5. Re-toggle `verify_jwt = false` on `kbzpay-create-payment` after deploy (Lovable resets it).

