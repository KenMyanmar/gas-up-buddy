# ADR-001: Webhook returns 200 on signature mismatch and missing merch_order_id

**Status:** Accepted
**Date:** 2026-05-03
**Authors:** Architect (drafted after losing severity dispute), Operator (raised)
**Reviewers:** CEO

---

## Context

During the May 3, 2026 KBZ Pay TRIO audit, two webhook behaviors in `kbzpay-webhook` v33 were flagged:

1. **W1:** Signature verification failure returned HTTP 400 (`kbzRetry`)
2. **W2:** Missing `merch_order_id` in payload returned HTTP 400 (`kbzRetry`)

Operator (Codex) classified both as **P0 retry storm** risk. Architect (Oldman) initially counter-argued P1, reasoning "deterministic failures don't cause retry storms because each retry produces the same failure."

Architect was wrong. **Deterministic failure + KBZ's aggressive retry = amplification, not stability.** A single malformed callback becomes dozens of failed retries hammering our endpoint.

KBZ's documentation and industry-standard webhook patterns (Stripe, Adyen) require returning 200 even on payload validation failures, with the actual issue logged out-of-band.

Operator's P0 classification was correct. Architect lost the dispute and (per disagreement protocol) wrote this ADR.

## Decision

The webhook returns HTTP 200 (`kbzSuccess`) for all payloads that pass parsing, regardless of whether the signature verifies or required fields are present. Suspicious payloads are logged to `activity_logs` with action types `kbzpay.webhook.signature_mismatch` and `kbzpay.webhook.missing_merch_order_id` for monitoring.

Returning 400 (`kbzRetry`) is reserved for transient, recoverable errors only — currently `payment_not_found` race conditions. (Note: per ADR-003, this remaining 400 case will also be removed once reconcile-cron is proven via G1/G2 gates.)

## Consequences

### Positive
- KBZ retry storms eliminated for payload-level errors
- Suspicious payload patterns become queryable via `activity_logs`
- Aligns with industry-standard patterns
- Vendor contract honored

### Negative
- Lose KBZ's automatic retry as backstop for genuine signature mismatches
- Real signature drift requires monitoring/alerting on `activity_logs`
- Misconfigured KBZ keys would silently fail (must be caught by alerts)

### Neutral / future-watch
- Volume of `kbzpay.webhook.signature_mismatch` rows should be near-zero in production. Non-zero indicates KBZ-side change or attacker probing — both deserve investigation.
- KBZ environment changes (UAT → PROD) or APP_KEY rotation will spike signature mismatches. ADR should be referenced in runbook.

## Alternatives considered

### Alternative A: Keep HTTP 400 for sig mismatch (Architect's initial position)
Rejected. Deterministic failure + aggressive retry = amplification.

### Alternative B: Return 200 only for sig mismatch, keep 400 for missing merch_order_id
Rejected. Same retry-storm logic applies to all payload-level errors.

### Alternative C: Conditional 400 based on retry-count header from KBZ
Rejected. KBZ does not expose retry count in headers.

## Implementation references

- `supabase/functions/kbzpay-webhook/index.ts` v34, lines ~120-180 (W1/W2 fixes)
- `safeLogActivity()` helper in same file (W4 fix, applied alongside)
- Deployed: 2026-05-03 (Operator)

## Revisit conditions

- KBZ publishes new webhook spec contradicting industry pattern
- Signature mismatch volume in production exceeds 0.1% of webhooks
- Migration to PROD KBZ environment

## Cross-reference

- Supersedes: none
- Related: ADR-003 (state transitions), pending ADR on W3
