Yes — the uploaded `.md` file is better than the PDF and should be treated as the canonical source for this drift recovery.

Revised execution plan

Scope lock
- Only write files under `supabase/functions/`.
- Do not touch React/frontend code, `src/`, routing, UI, customer app intent model, or CRM frontend.
- Do not edit database schema, SQL, cron schedules, or Supabase config unless separately approved.
- Do not refactor, reformat, or improve the source while syncing.
- Do not delete legacy `supabase/functions/_shared/phone.ts`.

Canonical source
- Use `user-uploads://I_ll_pull_all_5_fresh_from_Supabase_right_now_to_guarantee_you_re_getting_the_current_deployed_source.md`.
- Ignore the PDF for copying source because long code blocks can be corrupted by PDF extraction.
- Extract the six fenced code blocks from the Markdown source exactly.

Files to sync
1. Overwrite:
   - `supabase/functions/kbzpay-auto-login/index.ts`
   - `supabase/functions/kbzpay-create-payment/index.ts`

2. Create:
   - `supabase/functions/kbzpay-auto-login/phone.ts`
   - `supabase/functions/kbzpay-query-order/index.ts`
   - `supabase/functions/create-order-intent/index.ts`
   - `supabase/functions/kbzpay-reconcile-cron/index.ts`

Critical implementation guardrails
- Preserve `kbzpay-auto-login/index.ts` import exactly as:
  ```ts
  import { normalizePhone } from "./phone.ts";
  ```
- Do not allow auto-import cleanup to change it back to `../_shared/phone.ts`.
- Preserve straight quotes, long strings, operators, em dashes in comments, and trailing newlines from the Markdown source.
- Leave `supabase/functions/_shared/phone.ts` untouched as legacy.

Verification before reporting
- Confirm all six intended files exist.
- Confirm the only written paths are the six listed `supabase/functions/*` files.
- Confirm no files under `src/` changed.
- Confirm `supabase/functions/_shared/phone.ts` is unchanged.
- Confirm `kbzpay-auto-login/index.ts` imports `./phone.ts`.
- If Markdown extraction is incomplete or any code block cannot be mapped cleanly to its file, stop and report the blocker instead of guessing.

Commit and report
- Use a single commit if commit access is available:
  `Sync deployed KBZ Pay functions to main (drift recovery)`

- Commit body:
  ```text
  Backend drift recovery — these 5 functions were deployed via
  Supabase API directly and were missing or stale in the repo.

  Sources pulled verbatim from production at versions v44/v36/v3/v1/v2.
  No code changes, only sync. Customer app frontend changes are NOT
  in this commit.
  ```

- Report back:
  - Commit SHA on main, if available.
  - The six file paths actually written.
  - Any function where the source differed unexpectedly or could not be copied cleanly.