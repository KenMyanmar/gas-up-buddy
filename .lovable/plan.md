## Investigation Summary

**The bug.** In `src/pages/OrderConfirm.tsx` (lines 115–134), the KBZ Pay `startPay` result is classified using **undocumented assumptions**:

```ts
const isSuccess        = codeStr === "1";
const isExplicitCancel = codeStr === "2";          // WRONG: KBZ spec says 2 = failure, not cancel
const isExplicitFail   = codeStr === "3" || codeStr === "-1"; // UNDOCUMENTED codes
const isUnknown        = ...;
```

Per the KBZ Pay H5 / Mini App spec, `startPay` only documents:
- `resultCode === "1"` → user finished the PIN flow (webhook is the source of truth for "paid")
- `resultCode === "2"` → KBZ-side failure

Everything else (`"3"`, `"-1"`, `null`, `undefined`, missing field, `InterruptedException`-driven results, etc.) is **undocumented** and must not be treated as a definitive payment failure.

**Real-world impact.** Order `…C03001B9` hit the failure screen after an `InterruptedException`. By elimination of code paths it must have returned `resultCode === "3"`, which we mapped to `"failed"` and showed the customer "Payment Failed" — but the underlying payment state was actually unknown (and could still settle via webhook). We've been telling customers their payment failed when we don't actually know.

**Other notes from the investigation.**
- `OrderSuccess.tsx` already supports `paymentStatus: "pending"` with a distinct screen variant — no changes needed there.
- `pollOrderUntilPaid` returns `"paid" | "failed" | "timeout"` with a 120s budget — this is left untouched per scope.
- The `catch` block (bridge throw) already routes to `"pending"` — correct, leave alone.
- `client-diag` already captures `resultCode`, `resultCodeType`, `paymentResultKeys`. We'll add `resultFlag` so future debugging can correlate KBZ's secondary signal with `resultCode`.
- Scope is locked to **one file**: `src/pages/OrderConfirm.tsx`. No edge function, schema, RLS, or other UI changes.

## Plan — Surgical change to `src/pages/OrderConfirm.tsx`

### 1. Replace the classification block (lines 115–119)

From:
```ts
const codeStr = rawCode == null ? null : String(rawCode);
const isSuccess        = codeStr === "1";
const isExplicitCancel = codeStr === "2"; // KBZ user-cancel
const isExplicitFail   = codeStr === "3" || codeStr === "-1";
const isUnknown        = rawCode == null || (!isSuccess && !isExplicitCancel && !isExplicitFail);
```

To:
```ts
const codeStr = rawCode == null ? null : String(rawCode);
// KBZ Pay H5 spec — only two documented result codes:
//   "1" => PIN flow success (webhook = source of truth)
//   "2" => KBZ-side payment failure
// Anything else ("3", "-1", null, undefined, etc.) is UNDOCUMENTED.
// We must not treat undocumented codes as definitive failure.
const isSuccess      = codeStr === "1";
const isExplicitFail = codeStr === "2";
const isUnknown      = !isSuccess && !isExplicitFail;
```

### 2. Remove the `if (isExplicitCancel)` block (lines 121–127) entirely

We have zero production evidence of resultCode `2` arriving today, and per spec it's not a separate cancel signal. Removing the cancelled-navigation branch is safe. (`OrderSuccess` keeps its existing `"cancelled"` rendering for any historical state, but no new code path will produce it from this page.)

### 3. Keep the `if (isExplicitFail)` block (lines 128–134) as-is

It's now triggered only by `codeStr === "2"`, matching the KBZ spec.

### 4. Unknown codes fall through to existing poll

The existing `pollOrderUntilPaid → paymentStatus` mapping at lines 137–148 already does the right thing:
- poll → `"paid"` ⇒ `paymentStatus: "paid"`
- poll → `"failed"` ⇒ `paymentStatus: "failed"` (webhook-confirmed failure, trusted)
- poll → `"timeout"` ⇒ `paymentStatus: "pending"`

No changes needed in that block beyond removing the now-unused `isExplicitCancel` reference (already handled by step 1).

### 5. Extend the `client-diag` `startpay-result` payload

Inside the existing telemetry call (lines 102–114), add one field:
```ts
resultFlag: (paymentResult as any)?.resultFlag ?? null,
```
Everything else in that payload stays byte-identical.

### 6. Leave untouched

- `catch (payError)` block — bridge errors stay `"pending"`.
- `pollOrderUntilPaid` timing/behavior.
- `OrderTracking.tsx`, `OrdersPage.tsx`, `OrderSuccess.tsx`, `HomePage.tsx`, `kbzpay-bridge.ts`, all edge functions.

## Acceptance Checks

| Scenario | Before | After |
|---|---|---|
| `resultCode "1"` + webhook in 120s | paid | paid (unchanged) |
| `resultCode "1"` + webhook timeout | pending | pending (unchanged) |
| `resultCode "2"` | cancelled (wrong) | **failed** (per spec) |
| `resultCode "3"` | failed (lie) | **poll → pending/paid/failed** |
| `resultCode "-1"` | failed (lie) | **poll → pending/paid/failed** |
| `resultCode null/undefined` | pending via unknown→poll | pending via unknown→poll (unchanged) |
| `startPay` throws (InterruptedException at bridge layer) | pending (catch) | pending (catch) (unchanged) |
| client-diag `startpay-result` payload | no `resultFlag` | includes `resultFlag` |

## Known UX Trade-off (not a blocker)

Real failures arriving with undocumented codes will now spend up to 120s on the "Processing…" spinner before landing on the pending screen. This is intentional — better than lying about a failure. A follow-up PR can add a shorter unknown-result poll budget; out of scope here.

## Files Changed

- `src/pages/OrderConfirm.tsx` (one file, ~10 lines net)

No other files. No edge functions. No DB.
