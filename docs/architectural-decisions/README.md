# Architecture Decision Records (ADRs)

**Purpose:** Document architectural decisions so they survive AI memory loss, team changes, and time.

## Why

AnyGas is built by AI agents whose memory does not persist across sessions. Without ADRs, every decision must be re-litigated each time someone asks "why does this work this way?". ADRs make the answer permanent.

## Format

Use `_template.md`. Number sequentially: `ADR-001-...`. Never reuse a number.

## When to write

- AI agents disagree → **loser writes the ADR**
- A non-obvious technical choice is made
- A vendor constraint shapes our design
- A pattern is adopted from external advice
- A risk is accepted with mitigation rather than eliminated

## Status values

- **Proposed** — under discussion
- **Accepted** — decision made, in effect
- **Superseded by ADR-NNN** — replaced by newer decision
- **Deprecated** — no longer relevant but kept for history

## Index

| ADR | Title | Status | Date | Authors |
|---|---|---|---|---|
| ADR-001 | Webhook returns 200 on signature mismatch and missing merch_order_id | Accepted | 2026-05-03 | Architect, Operator |
| ADR-002 | Cron deploys require pg_net smoke test, not pg_cron status | Accepted | 2026-05-03 | Architect |
| ADR-003 | All payment state transitions go through transition_payment_status RPC | Accepted | 2026-05-03 | Architect, Operator, External Advisor |
