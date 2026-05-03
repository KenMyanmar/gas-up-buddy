# Active Work — Coordination Lock

**Purpose:** Prevent concurrent writes by Architect, Operator, Cowork, and Lovable. Read before starting work. Update before pushing.

**Last updated:** 2026-05-03 by Architect

---

## Currently working

| Actor | Task | ETA | Files locked |
|---|---|---|---|
| Architect | TRIO docs scaffolding | 2026-05-03 | `docs/*` |
| Cowork | Phase 2.0 v1.1 Grand Plan revision | 2026-05-04 | `docs/grand-plans/2026-05-04-payment-state-machine.md` (planned) |
| Operator (Codex) | Standby for v1.1 review | - | none |
| Lovable | Idle | - | none |

---

## Locks

| Path pattern | Owner | Until | Reason |
|---|---|---|---|
| `docs/*` | Architect | 2026-05-03 EOD | TRIO scaffolding |
| `supabase/functions/kbzpay-*` | none | - | Free to edit (Phase 1 complete) |
| `supabase/migrations/*` | Cowork | 2026-05-04 | Phase 2.0 prep |

---

## Recently shipped (last 48h)

| Date (UTC) | What | Owner |
|---|---|---|
| 2026-05-03 | Frontend 4-file payment status fix (commit `a80b6bf`) | Lovable + Operator |
| 2026-05-03 | webhook v34 (W1+W2+W4 fixes) | Operator |
| 2026-05-03 | reconcile-cron v7 (R4+R1+R2+R3 fixes) | Operator |
| 2026-05-03 | cron Job#4 scheduled (⚠️ vault secret 401 — needs CEO fix) | Operator |

---

## Pending review

| What | Owner | Blocked by |
|---|---|---|
| W3 deploy | Operator | Vault secret fix (Ken) |
| Phase 2.0 v1.1 | Cowork drafts, Architect+Operator review | Cowork revision |
| OrderConfirm.tsx softening | Lovable | CEO timing decision |

---

## How to use this file

1. Before work: read this file, check locks
2. Starting work: add row to "Currently working"
3. Finishing work: move to "Recently shipped," remove locks
4. Every commit: update this file in same PR

CEO can override any lock. Architect can override Operator/Cowork locks for emergency rollback.
