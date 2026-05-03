## Plan: Add TRIO System v1 Documentation (9 markdown files)

Pure documentation addition. No code changes, no imports, no config touched.

### Files to create (exact paths, exact content from prompt)

1. `docs/roles.md` — Role definitions (Architect, Operator, Cowork, Lovable, CEO)
2. `docs/active-work.md` — Coordination lock table
3. `docs/grand-plans/README.md` — Grand Plan process overview
4. `docs/grand-plans/_template.md` — Grand Plan template
5. `docs/architectural-decisions/README.md` — ADR index
6. `docs/architectural-decisions/_template.md` — ADR template
7. `docs/architectural-decisions/ADR-001-webhook-200-on-bad-signature.md`
8. `docs/architectural-decisions/ADR-002-cron-deploy-needs-pgnet-smoke-test.md`
9. `docs/architectural-decisions/ADR-003-state-transitions-via-rpc.md`

### Constraints
- Verbatim content as supplied in the prompt.
- No other files modified. No code, config, or src/ changes.
- New directories `docs/grand-plans/` and `docs/architectural-decisions/` will be created implicitly.

### Confirmation step
After writing, list the 9 created file paths back to the user.
