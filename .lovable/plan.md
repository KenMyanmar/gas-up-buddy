

# Root Cause: Hooks Order Crash in `PhoneEntry.tsx` Prevents Auto-Login

## What's actually happening

Runtime errors show:
```
Error: Rendered more hooks than during the previous render.
PhoneEntry@/src/pages/PhoneEntry.tsx:50:14
updateEffectImpl
```

This means React unmounts/crashes `PhoneEntry` mid-render, on every status transition. That's why the advisor sees **zero POST calls to `kbzpay-auto-login`** — the component crashes before (or right at the moment) the effect that would fire the fetch can run cleanly.

### Why hooks count is changing

`PhoneEntry.tsx` does this in order:

```tsx
const navigate = ...                  // hook 1
const { user } = useAuth()            // hook 2..n
const { data: customer } = useCustomerProfile(user?.id) // hooks
const { toast } = useToast()          // hooks
const kbz = useKbzAutoLogin()         // hooks (multiple useState/useRef/useCallback/useEffect inside)
useEffect(...)                        // line 19
useEffect(...)                        // line 26
// ...then EARLY RETURNS based on kbz.status:
if (kbz.status === "idle" || "authenticating") return <Spinner/>
if (kbz.status === "link_pending" && candidates.length === 1) return <HeroCard/>
if (...linked_select...) return <Selector/>
if (kbz.status === "authorization_rejected") return <AuthCard/>
return <RetryCard/>
```

That part is fine on its own — top-level hooks come before early returns. **But** look at what `useKbzAutoLogin` returns and how it's used: each branch reads different fields off `kbz` (e.g. `kbz.candidates`, `kbz.selecting`, `kbz.handleOpenSettings`). The hook itself is stable in hook count — so the crash is *not* from `useKbzAutoLogin` changing its hook count.

The actual culprit is more subtle and visible at the stack trace:
- `updateEffectImpl` at `PhoneEntry.tsx:50` — line 50 is the `<div>` returned by the spinner branch, which means React is re-running effects from the previous render against a render that has *fewer* hooks.

Two real bugs are colliding:

### Bug 1 — `useCustomerProfile(user?.id)` likely conditionally calls hooks

`useCustomerProfile` is consumed with a possibly-`undefined` arg. If that hook short-circuits internally (`if (!userId) return;` before calling `useQuery`), the hook count for `PhoneEntry` changes the moment `user` flips from `null` → defined (after KBZ session is set inside `useKbzAutoLogin`'s `runAutoLogin`). That's exactly the trigger sequence: auto-login succeeds → `setSession` → `user` becomes truthy → `useCustomerProfile` now runs an extra `useQuery` hook → React throws "Rendered more hooks than during the previous render" → `PhoneEntry` unmounts → in-flight fetch state is discarded → no visible POST in network tab.

### Bug 2 — Effect-vs-early-return ordering

Even when Bug 1 is fixed, the second `useEffect` (lines 26–32) reads `kbz.status` and navigates on `linked` / `new_account`, but the early-return-based render means React Refresh / hot reload sometimes sees a different effect deps array, contributing to instability during dev.

## The fix

### File 1: `src/hooks/useOrders.ts` — make `useCustomerProfile` hook-stable

Find `useCustomerProfile` and ensure it always calls `useQuery` (no early `return undefined` before the hook). Pattern:

```ts
export function useCustomerProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["customer-profile", userId],
    queryFn: async () => { /* ... */ },
    enabled: !!userId,           // gate via enabled, NOT via early return
  });
}
```

If it currently does `if (!userId) return { data: null }` before `useQuery`, that's the crash source. Convert to the `enabled` pattern.

### File 2: `src/pages/PhoneEntry.tsx` — defensive hook ordering

Keep the file's logic, but make sure NO hook is conditional. Specifically:
- Confirm the two `useEffect` blocks at lines 19 and 26 always run with the same deps shape every render (they do — leave them).
- No further changes if Bug 1 is fixed.

### File 3: `src/hooks/useKbzAutoLogin.ts` — guard against crash-induced double runs

The `running.current` guard works only if the component stays mounted. After a hooks crash, React remounts `PhoneEntry`, `useKbzAutoLogin` re-runs from scratch with a fresh `running.current = false`, and `ranOnce.current = false` — but the previous in-flight `fetch` may still be alive in another closure with no listener. Add an `AbortController` so the orphaned fetch cleans up:

```ts
const acRef = useRef<AbortController | null>(null);
const runAutoLogin = useCallback(async () => {
  if (running.current) return;
  running.current = true;
  acRef.current?.abort();
  acRef.current = new AbortController();
  // pass signal to supabase.functions.invoke if supported, otherwise just track
  ...
}, []);
useEffect(() => () => acRef.current?.abort(), []);
```

This is defensive — the real fix is File 1.

## Why the advisor sees zero POSTs

Sequence on the device:
1. `PhoneEntry` mounts, `useKbzAutoLogin` calls `getAuthCode` ✅
2. User taps Allow, KBZ returns `authCode` ✅ (success log fires)
3. `supabase.functions.invoke("kbzpay-auto-login", ...)` is **awaited**
4. *Before* the request is actually issued, React schedules a re-render because `running.current` mutation + state changes → `PhoneEntry` re-renders → hook count mismatch in `useCustomerProfile` → **component unmounts mid-flight** → the pending `invoke` Promise resolves into a discarded closure → request never makes it onto the wire (or makes it as the weird OPTIONS-only 502 the advisor saw — that's the preflight from a torn-down fetch context).
5. New mount → fresh run → same crash → endless spinner.

Tester would see in console:
```
[KBZ-DIAG] getAuthCode SUCCESS: {"authCode":"..."}
[KBZ-DIAG] authCode received, length: 64
[KBZ-DIAG] Invoking kbzpay-auto-login edge function
   ← then either nothing, or "Rendered more hooks than during the previous render"
```

That matches the advisor's observation exactly: no real POST hits the function.

## Out of scope (do NOT touch)
- `src/lib/kbzpay-bridge.ts` — scopes, getAuthCode, openSettings all correct
- Any edge function — backend is fine
- DB schema, RLS, `verify_jwt`
- `WelcomePage`, `OrderConfigure`, payment, tracking flows
- The Authorization Card / Retry Card UI

## Acceptance criteria
1. No more `Rendered more hooks than during the previous render` in console.
2. After tester taps Allow on KBZ consent: console shows full `[KBZ-DIAG]` chain through `Edge function response status: ...`.
3. `kbzpay-auto-login` Edge Function logs show a real POST with version > 23.
4. Tester reaches `/welcome` (existing customer) or sees candidate selector (new link).

## Post-deploy checklist
1. Open Mini App, watch live console for hook errors → should be gone.
2. Verify POST to `kbzpay-auto-login` appears in Edge Function logs within 2s of tapping Allow.
3. Confirm response body contains `status: "linked" | "new_account" | "link_pending"`.
4. Re-toggle `verify_jwt = false` on `kbzpay-create-payment`.
5. Run full order flow.

