Plan: update Supabase edge function config only

Scope
- Modify exactly one file: `supabase/config.toml`.
- Do not touch edge function source files.
- Do not touch frontend, RLS, schema, migrations, or any other config.

Implementation
- Replace the full contents of `supabase/config.toml` with the exact content provided.
- Preserve the existing section order.
- Change only `kbzpay-create-payment` from `verify_jwt = true` to `verify_jwt = false`.
- Add the three new explicit function config sections at the end:
  - `[functions.kbzpay-query-order]`
  - `[functions.create-order-intent]`
  - `[functions.kbzpay-reconcile-cron]`
- Each new section will contain only `verify_jwt = false`.

Verification
- Confirm `supabase/config.toml` matches the requested content.
- Confirm no files under `supabase/functions/` changed.
- Confirm no files under `src/` changed.
- Confirm the only changed file is `supabase/config.toml`.

Commit
- Use one commit with title:
  `Fix verify_jwt on create-payment + add config for new functions`
- Commit body:
  ```text
  Customer payment confirmed working with verify_jwt=true via user
  JWT, but original intent was false (per code comment).

  Also adds explicit config for 3 new edge functions to prevent
  future drift on auto-deploy.
  ```

Report back
- Commit SHA on main, if available.
- Confirmation that only `supabase/config.toml` changed.