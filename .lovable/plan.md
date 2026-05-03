## Plan: Grand Plan v1.3.4 (docs-only)

Pure documentation update. No code, SQL, edge function, or publish changes.

### 1. File rename

Rename `docs/grand-plans/2026-05-03-payment-state-machine-v1.3.3.md` → `docs/grand-plans/2026-05-03-payment-state-machine-v1.3.4.md`.

### 2. Edits inside the new v1.3.4 file

**Header (line 3):** `Version: 1.3.3` → `Version: 1.3.4`. Status line unchanged.

**New top changelog block** (inserted above the existing v1.3.2→v1.3.3 table):

> **Changelog from v1.3.3 (F15 semantics correction):**
>
> | Finding | Severity | Fix |
> |---|---|---|
> | F15 semantics inversion: v1.3.3 Phase 3 force-expired any `pending` order older than 6h that Phase 2 had NOT verified against KBZ this run. That is the opposite of safe behaviour — an order Phase 2 could not reach (KBZ down, timeout, network error) is exactly the order we are LEAST sure about, and we must not cancel it. | HIGH | §4 F15 Phase 3 rewritten: only orders Phase 2 successfully verified this run are eligible for force-expire. Orders not verified this run are skipped and counted via `skippedUnchecked` for observability. |

**§4 F15 section (lines 533-588):** keep the heading, replace prose + both pseudocode blocks.

- Two invariants:
  1. Phase 2 marks `checkedOrderIds` only after a confirmed KBZ result (unchanged from v1.3.3 — F16b still applies).
  2. Phase 3 force-expires ONLY orders Phase 2 successfully verified this run. If `checkedOrderIds.has(old.id)` is false, skip and count via `skippedUnchecked`; the next cron tick will retry.
- Why this matters: a pending order older than 6h whose KBZ status we could not check this run might still be `paid` upstream. Flipping it to `expired/cancelled` based on age alone would risk losing real customer payments if the validator is ever relaxed or KBZ catches up between cron ticks. Requiring a successful KBZ verification this run before force-expire makes the operation safe-by-construction. The `skippedUnchecked` counter surfaces persistent KBZ outages in cron logs.
- Phase 2 pseudocode: keep v1.3.3 block as-is.
- Phase 3 pseudocode: replace with the exact snippet provided by the user (declares `sixHoursAgo` and `skippedUnchecked`, queries `oldPending`, uses `if (!checkedOrderIds.has(old.id))` to push `action: 'skipped_unchecked'` and `continue`, then calls `transition_payment_status` with `p_reason: 'Phase 3: force-expire pending >6h after successful KBZ verification this run'`, pushes `action: 'expired'`, and emits a `console.warn` summary when `skippedUnchecked > 0`).

**Footer (line 849):** replace with exactly:

> End of Grand Plan v1.3.4. 20 total findings: 17 addressed in plan, 3 deferred to Phase 2.1. Awaiting Architect+Operator final line-level review and CEO sign-off.

No other changes anywhere in the file.

### 3. `docs/grand-plans/README.md`

- Replace the v1.3.3 row with:
  ```
  | [Payment State Machine v1.3.4](./2026-05-03-payment-state-machine-v1.3.4.md) | 2026-05-03 | Draft (awaiting Architect+Operator final + CEO sign-off) | Cowork |
  ```
- Update the v1.2 row's status to `Superseded by v1.3.4`.

### 4. `docs/active-work.md`

- Line 5: `Grand Plan v1.3.3 commit` → `Grand Plan v1.3.4 commit`
- Line 14: `Phase 2.0 v1.3.3` → `Phase 2.0 v1.3.4`
- Line 15: `Standby for v1.3.3 final review` → `Standby for v1.3.4 final review`
- Line 16: `Landed Grand Plan v1.3.3 doc` → `Landed Grand Plan v1.3.4 doc`
- Line 54: `Phase 2.0 v1.3.3` → `Phase 2.0 v1.3.4`
- Append to "Recently shipped":
  `| 2026-05-03 | Grand Plan v1.3.4 committed (F15 semantics correction — only force-expire orders verified by KBZ this run) | Lovable |`

### Commit message

`docs: Grand Plan v1.3.4 — F15 semantics correction (only force-expire orders verified by KBZ this run)`
