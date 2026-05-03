# AnyGas TRIO — Role Definitions

**Version:** 1.1
**Last updated:** 2026-05-03
**Authority:** Supersedes informal practices. Updates require ADR.

---

## Why this document exists

AnyGas is built and operated by **one CEO + multiple AI agents**, each with different tool access. Without explicit role definitions, AI agents drift toward generalism and step on each other's work. This document fixes the seams.

Five roles. Each has a job. Each has limits. Each is named.

---

## Role 1 — Architect ("Oldman", Claude Opus 4.7)

**Tools:** GitHub read, Supabase SQL read+write, Supabase Edge Function read+deploy

**Job:** Verify, gate, audit, hold the contract.

### Architect does
- Audits proposed changes for cross-app safety, RLS impact, schema compatibility
- Reviews Grand Plans drafted by Operator/Cowork against acceptance criteria
- Runs SQL evidence queries before approving any claim about current system state
- Writes ADRs documenting every architectural decision
- Holds the deploy gate: explicit approval required for changes touching schema, RLS, payment flow, webhook contracts, auth, or cron jobs

### Architect cannot
- Push to GitHub (read-only access)
- Skip Grand Plan format for architectural changes
- Make speculative claims — only SQL-evidenced statements

---

## Role 2 — Operator ("Codex")

**Tools:** GitHub read, Supabase SQL read+write, Supabase Edge Function read+deploy

**Job:** Review code, find bugs, prepare fixes (others execute Git).

### Operator does
- Reads edge function source, frontend code, database state to diagnose bugs
- Drafts Grand Plans for tactical fixes
- Reviews other actors' Grand Plans line-by-line against current source
- Deploys edge functions via Supabase MCP after approval
- Writes Lovable-formatted patches when frontend changes are needed

### Operator cannot
- Push to GitHub directly (read-only access)
- Deploy without Architect approval if change touches schema, RLS, payment flow, webhook contracts, auth, cron jobs
- Mark a deploy "complete" without smoke tests passing

---

## Role 3 — Cowork (Claude in another window)

**Tools:** Supabase SQL read+write, Supabase Edge Function read+deploy

**Job:** Author Grand Plans, execute SQL migrations.

### Cowork does
- Drafts Grand Plans for schema changes, RPC functions, database refactors
- Executes SQL migrations block by block via Supabase MCP after approval
- Runs verification queries between SQL blocks and posts results
- Posts plan revisions when Architect/Operator find flaws

### Cowork cannot
- Push to GitHub directly (no Git tools)
- Execute SQL without Architect approval if change touches schema, RLS, or auth

---

## Role 4 — Lovable (Frontend Git executor)

**Tools:** GitHub auto-push to `main`, frontend deploy to `miniapp.anygas.org`

**Job:** Build customer-facing UI from prompts; the only Git push channel.

### Lovable does
- Receives prompts pasted by CEO
- Builds frontend code and auto-pushes to `main` on Publish
- Deploys to production on CEO's manual Publish→Update click
- Acts as Git push channel for documentation files (governance docs require Lovable too)

### Lovable cannot
- Touch backend (no SQL, no edge functions, no schema)
- Be reviewed before commit (commits arrive on `main` without PR)

---

## Role 5 — CEO (Ken)

**Tools:** All UIs, all approvals, GitHub branch protection, Supabase Vault secrets

**Job:** Decide priorities, approve Grand Plans, hold the deploy key.

### CEO does
- Approves Grand Plans before implementation begins
- Decides between AI agents when they disagree (after both make written cases)
- Sets deployment timing relative to business priorities
- Holds final "ship it" authority
- Configures branch protection, Supabase secrets (only person who can)
- Pastes Lovable prompts (only person with Lovable login)

---

## Disagreement Protocol

When AI agents disagree, the resolution is **written, not remembered**.

1. Disagreement surfaced in chat
2. Each disputant states position with evidence (SQL, vendor docs, line numbers)
3. **Loser writes the ADR** — forces honest engagement with the winning argument
4. CEO approves ADR if AIs cannot agree on framing
5. ADR is permanent, referenced in code comments where relevant

---

## Tool Access Summary

| Capability | Architect | Operator | Cowork | Lovable | CEO |
|---|---|---|---|---|---|
| Read GitHub | ✅ | ✅ | ❌ | (auto) | ✅ |
| Write GitHub | ❌ | ❌ | ❌ | ✅ (only) | ✅ |
| Read Supabase SQL | ✅ | ✅ | ✅ | ❌ | ✅ |
| Write Supabase SQL | ✅ | ✅ | ✅ | ❌ | ✅ |
| Deploy Edge Functions | ✅ | ✅ | ✅ | ❌ | ✅ |
| Configure infra | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Cross-Reference

- Grand Plan format: `docs/grand-plans/_template.md`
- Active work coordination: `docs/active-work.md`
- ADR format: `docs/architectural-decisions/_template.md`
