# Grand Plans

**Purpose:** Every backend change to AnyGas requires a Grand Plan before implementation.

## Why

AnyGas runs a shared Supabase backend serving 3 apps. One uncoordinated change can break two of them. Grand Plans force the change author to think through cross-app safety, rollback, and verification before code is written.

## Required for changes that touch:
- Database schema (new tables, columns, types, constraints)
- RLS policies
- Payment state, order state, customer auth
- Webhook contracts
- Cron jobs or scheduled tasks
- Edge functions touching `payments`, `orders`, `auth.users`

For changes < 20 lines that don't touch the above, a brief PR description is sufficient.

## Format

Use `_template.md`. Number plans by date: `YYYY-MM-DD-short-name.md`.

## Lifecycle

1. **Draft** — author writes plan
2. **Reviewed** — Architect + Operator add comments, request SQL evidence
3. **Approved** — CEO approves
4. **Executing** — author runs blocks one at a time, posts results
5. **Complete** — smoke tests pass, plan moved to `complete/` subdirectory
6. **Reverted** — if rollback executed, plan moved to `reverted/` with reason

## Index

| Plan | Date | Status | Owner |
|---|---|---|---|
| [Payment State Machine v1.2](./2026-05-03-payment-state-machine-v1.2.md) | 2026-05-03 | Draft (awaiting Architect final + CEO sign-off) | Cowork |
