# Active Work — Coordination Lock

**Purpose:** Prevent concurrent writes by Architect, Operator, Cowork, and Lovable. Read before starting work. Update before pushing.

**Last updated:** 2026-05-03 by Lovable (Grand Plan v1.3.3 commit)

---

## Currently working

| Actor | Task | ETA | Files locked |
|---|---|---|---|
| Architect | TRIO docs scaffolding | 2026-05-03 | `docs/*` |
| Cowork | Phase 2.0 v1.3.3 — pending Architect+Operator final approval, then CEO sign-off, then SQL Blocks 0–3 execution + redeploy 4 KBZ edge functions | 2026-05-05 | `payment_events`, `is_valid_payment_transition`, `transition_payment_status`, `supabase/functions/kbzpay-create-payment`, `supabase/functions/kbzpay-webhook`, `supabase/functions/kbzpay-query-order`, `supabase/functions/kbzpay-reconcile-cron` |
| Operator (Codex) | Standby for v1.3.3 final review | - | none |
| Lovable | Landed Grand Plan v1.3.3 doc; idle pending Cowork deploy | - | none |

---

## Locks

| Path pattern | Owner | Until | Reason |
|---|---|---|---|
| `docs/*` | Architect | 2026-05-03 EOD | TRIO scaffolding |
| `supabase/functions/kbzpay-create-payment` | Cowork | 2026-05-05 | Phase 2.0 v1.2 RPC OPEN-branch migration |
| `supabase/functions/kbzpay-webhook` | Cowork | 2026-05-05 | Phase 2.0 v1.2 RPC TRANSITION-branch migration |
| `supabase/functions/kbzpay-query-order` | Cowork | 2026-05-05 | Phase 2.0 v1.2 RPC TRANSITION-branch migration |
| `supabase/functions/kbzpay-reconcile-cron` | Cowork | 2026-05-05 | Phase 2.0 v1.2 RPC TRANSITION-branch migration |
| `supabase/migrations/*` | Cowork | 2026-05-05 | Phase 2.0 v1.2 Blocks 1–3 (payment_events table, validator fn, RPC) |
| `src/hooks/useOrders.ts`, `src/pages/OrderTracking.tsx`, `src/pages/OrderSuccess.tsx` | Lovable (queued) | after Cowork ships | Optional draft-filter + banner sanity check, only after `payment_events` populates |

---

## Recently shipped (last 48h)

| Date (UTC) | What | Owner |
|---|---|---|
| 2026-05-03 | Frontend 4-file payment status fix (commit `a80b6bf`) | Lovable + Operator |
| 2026-05-03 | webhook v34 (W1+W2+W4 fixes) | Operator |
| 2026-05-03 | reconcile-cron v8 (R1-R4 fixes + JWT auth fix) | Operator |
| 2026-05-03 | cron Job#4 scheduled (⚠️ vault secret 401 — needs CEO fix) | Operator |
| 2026-05-03 | Grand Plan v1.2 committed as draft (`docs/grand-plans/2026-05-03-payment-state-machine-v1.2.md`) | Lovable |
| 2026-05-03 | Grand Plan v1.3.1 committed (F12/F13 fixes), then superseded | Lovable |
| 2026-05-03 | Grand Plan v1.3.2 committed (F14/F15 cron guards), then superseded | Lovable |
| 2026-05-03 | Grand Plan v1.3.3 committed (F16-F18 pseudocode corrections) | Lovable |

---

## Pending review

| What | Owner | Blocked by |
|---|---|---|
| W3 deploy | Operator | Vault secret fix (Ken) |
| Phase 2.0 v1.3.3 | Architect+Operator final approval → CEO sign-off → Cowork executes | Architect+Operator review |
| OrderConfirm.tsx softening | Lovable | CEO timing decision |

---

## How to use this file

1. Before work: read this file, check locks
2. Starting work: add row to "Currently working"
3. Finishing work: move to "Recently shipped," remove locks
4. Every commit: update this file in same PR

CEO can override any lock. Architect can override Operator/Cowork locks for emergency rollback.
