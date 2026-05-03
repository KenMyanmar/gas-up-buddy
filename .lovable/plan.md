## Plan: Commit Grand Plan v1.2 to the repo (docs only)

Per TRIO v1.2, Lovable's role here is the GitHub write channel — not SQL execution. The schema/RPC blocks in this plan must be executed by **Cowork** against Supabase, not by me. What I can (and should) do now is land the plan as a versioned markdown document so Architect's final approval and CEO sign-off have a canonical, reviewable artifact in the repo.

### What I will do

1. **Create** `docs/grand-plans/2026-05-03-payment-state-machine-v1.2.md`
   - Verbatim copy of the Grand Plan v1.2 you pasted (problem statement, corrected writer map, live data table, two-branch RPC contracts, state-machine diagram, transition table, SQL Blocks 1–3, edge-function migration sequence, testing plan, rollback, success criteria, out-of-scope).
   - Frontmatter aligned to `_template.md`: Date 2026-05-03, Author Cowork, Reviewers Architect + Operator, Approver CEO, **Status: DRAFT — awaiting Architect final approval, then CEO sign-off**, Risk class P0, Rollback time ~2 min per block.
   - Includes the v1.1 → v1.2 changelog table and the SQL evidence for Issues 3 and 4.

2. **Update** `docs/grand-plans/README.md` index table — replace the `(none yet …)` row with:
   | Plan | Date | Status | Owner |
   |---|---|---|---|
   | [Payment State Machine v1.2](./2026-05-03-payment-state-machine-v1.2.md) | 2026-05-03 | Draft | Cowork |

3. **Update** `docs/active-work.md` — add a lock entry noting Cowork holds the SQL write lock for `payment_events`, `is_valid_payment_transition`, `transition_payment_status`, and the four KBZ edge functions (`kbzpay-create-payment`, `kbzpay-webhook`, `kbzpay-query-order`, `kbzpay-reconcile-cron`) for the duration of this plan's execution. Lovable will not touch those edge functions until Cowork releases the lock.

### What I will NOT do (out of scope for Lovable per TRIO v1.2)

- Run Blocks 1–3 SQL (DDL is Cowork-only).
- Modify or redeploy `kbzpay-create-payment`, `kbzpay-webhook`, `kbzpay-query-order`, `kbzpay-reconcile-cron` (edge function deploys are Cowork-only).
- Backfill or mutate any rows in `orders` / `payments` / `payment_events`.
- Touch `src/integrations/supabase/types.ts` (read-only; the new RPC will appear there only after Cowork ships the migration and types regenerate).

### Frontend follow-ups (flagged, NOT executed in this plan)

These are noted in §9 of the Grand Plan as "may need one-line draft filter". I will hold these for a separate, smaller plan **after** Cowork deploys Block 1–3 and the new `kbzpay-create-payment`:

- `src/hooks/useOrders.ts` — confirm the customer Orders list filters out `status='draft'` (orders that never reached the OPEN branch should not appear as "active" to customers).
- `src/pages/OrderTracking.tsx` / `src/pages/OrderSuccess.tsx` — confirm banner copy still maps correctly when `payment_status` lands on `expired` vs `failed` vs `abandoned` (the RPC normalises these but UI strings should be sanity-checked once events start flowing).

I will not edit those files in this turn — they depend on the RPC being live.

### Verification after I commit

- `docs/grand-plans/2026-05-03-payment-state-machine-v1.2.md` opens and renders.
- README index links resolve.
- `docs/active-work.md` shows the Cowork lock so Operator/Architect don't race.
- No code files changed; no migrations queued; types.ts untouched.

### Hand-off note for Cowork (will be in the doc's footer)

> Lovable has landed this plan as draft. SQL Blocks 1–3 and the four edge-function migrations are **Cowork's** to execute, in the order specified in §4. Lovable will pick up the optional `useOrders` draft-filter and tracking-banner sanity check **only after** Cowork confirms `payment_events` is populating and the new `kbzpay-create-payment` is live.
