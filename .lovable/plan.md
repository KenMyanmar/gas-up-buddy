## Plan: Sync deployed `catalog-list` v6 into repo

### Goal
Make the repository match the already-deployed production `catalog-list` edge function (v6, deployed at 19:16 UTC) so that future Lovable redeploys do not revert it.

### Changes

1. **Create `supabase/functions/catalog-list/index.ts`**
   - Write the exact v6 source provided by the user — byte-identical, no formatting changes, no logic edits.
   - Key verification lines preserved:
     - `image_url,` in the `brand_products` select
     - `image_url: row.image_url || row.cylinder_types?.image_url || null` in the shaped product response

2. **Append to `supabase/config.toml`**
   - Add block:
     ```toml
     [functions.catalog-list]
     verify_jwt = false
     ```

### Out of scope
- No function body changes
- No manual redeploy (Lovable pipeline will auto-deploy on next push)
- No caller (`useBrandProducts.ts`) edits
- No tests or refactors

### Verification
- `index.ts` on disk matches pasted source exactly
- `config.toml` contains the new `[functions.catalog-list]` block
- Only these two files are modified in the commit