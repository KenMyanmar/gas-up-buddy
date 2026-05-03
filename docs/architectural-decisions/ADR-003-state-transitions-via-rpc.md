# ADR-003: All payment state transitions go through `transition_payment_status` RPC

**Status:** Accepted (architecture direction); Implementation pending Phase 2.0 v1.1 plan revision
**Date:** 2026-05-03
**Authors:** Architect, Operator, External Advisor, CEO
**Reviewers:** All

---

## Context

The May 3, 2026 KBZ Pay TRIO audit identified 21 distinct issues across 5 KBZ-facing edge functions. Reconciliation revealed all 21 stem from a single architectural problem: **5 different functions hold direct write authority over `orders.payment_status` and `payments.status`, with no coordination, no transition validation, and no immutable audit trail.**

Writers identified:
1. `create-order-intent` — INSERTs `orders` (draft state)
2. `kbzpay-create-payment` — UPDATEs `orders` (draft→pending), INSERT/UPDATE `payments`
3. `kbzpay-webhook` — UPDATEs `orders` (pending→paid/failed), UPDATE `payments`
4. `kbzpay-query-order` — UPDATEs `orders` (any→paid/failed/expired), UPDATE `payments`
5. `kbzpay-reconcile-cron` — UPDATEs `orders` (cancelled), UPDATE `payments`

Plus indirectly: CRM web app, Agent app, manual SQL by AI agents/CEO. Eight writers total.

Observed consequences: race conditions (CP3), atomicity violations (W5), invalid transitions possible (R4), lost audit trail (no `updated_at` touched), state lies (UI vs DB drift).

CEO observed: *"many edge functions writing front end at the same time and nonaligned which cause kbzpay confuse."* This was the architectural insight.

External advisor confirmed against industry patterns from Stripe, Adyen, Shopify Payments, Square. Pattern is universal across mature payment systems.

## Decision

All mutations to `orders.payment_status`, `orders.status` (when payment-related), `payments.status`, and `payments.paid_at` MUST go through Postgres function(s) that:

1. Acquire row lock (`SELECT FOR UPDATE`)
2. Load current state
3. Validate transition against explicit allowlist (illegal transitions throw)
4. Update `orders` and `payments` atomically in one transaction
5. INSERT immutable row into `payment_events` (audit ledger)
6. Return new state as JSON

No edge function, frontend, or human operator may directly UPDATE the listed columns.

`payment_events` table is **append-only**. No UPDATE or DELETE permitted except by migration role.

**Implementation Note:** Initial Cowork v1 Grand Plan (2026-05-03) was reviewed by Operator and Architect; 9 findings identified requiring v1.1 revision before implementation. Specifically: (1) split into `open_payment_attempt` + `transition_payment_attempt`, (2) preserve `provider_ref = merch_order_id` semantics, (3) include `payments.status` in transition logic, (4) add `payment_attempts` table or attempt_no on `payment_events`, (5) DB-level `updated_at` trigger, (6) explicit scope on `orders.status`. Final implementation in Phase 2.0 v1.1.

## Consequences

### Positive
- **Race conditions impossible** — row lock serializes concurrent writes
- **Invalid transitions impossible** — illegal targets throw at DB level (R4-class bugs cannot recur)
- **Atomicity guaranteed** — one transaction (W5 solved by design)
- **Auditability complete** — `SELECT * FROM payment_events WHERE order_id = X` is the truth
- **Single source of truth** — Stripe/Adyen-grade pattern
- **Future writers automatically inherit safety**

### Negative
- **Migration cost** — 5 edge functions must be patched, plus CRM and Agent apps
- **Backfill required** for existing orders to populate `payment_events` retroactively
- **Single point of failure** if RPC poorly written (mitigated by extensive Grand Plan review)

### Neutral / future-watch
- Transition rule allowlist may need extensions (refunds, chargebacks). Each requires ADR.
- Performance: row lock on every transition. At expected volume, no concern. Revisit at >100 tx/sec.

## Alternatives considered

### Alternative A: Fix 21 bugs case-by-case
Rejected. Symptoms not root causes.

### Alternative B: Application-layer state machine in TypeScript
Rejected. Edge functions are isolated Deno runtimes; sharing in-memory state is impractical.

### Alternative C: Full event sourcing with CQRS
Deferred. Overkill for current scale. Chosen solution is "light event sourcing" — events table is the log, current state is a projection.

### Alternative D: Temporal.io or external orchestration engine
Deferred. Excellent fit for multi-provider payments or saga flows. Not justified for single-provider (KBZ) currently.

## Implementation references

- Phase 2.0 v1.1 Grand Plan (in progress): `docs/grand-plans/2026-05-04-payment-state-machine.md`
- External advisory: "distributed state mutation" pattern (Stripe, Adyen, Shopify Payments)
- Today's audit: 21 issues
- Affected: kbzpay-create-payment, kbzpay-webhook, kbzpay-query-order, kbzpay-reconcile-cron, create-order-intent

## Revisit conditions

- Customer volume exceeds 100 transactions/second
- Multi-provider payments added (Wave Money, CB Pay)
- Refund/chargeback support added
- Major Postgres migration

## Cross-reference

- Supersedes: none (founding payments architecture decision)
- Related: ADR-001 (webhook 200), ADR-002 (cron pg_net smoke test)
