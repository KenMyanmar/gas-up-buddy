# Grand Plan: <feature/fix name>

**Date:** YYYY-MM-DD
**Author:** <Architect | Operator | Cowork>
**Reviewers:** <other AIs + CEO>
**Risk class:** <P0 production / P1 customer-visible / P2 ops / P3 cleanup>
**Estimated execution time:** <minutes/hours>
**Estimated rollback time:** <minutes>

---

## 1. Problem statement

<What is broken or missing? Reference real failed orders, ADRs, or audit findings.>

## 2. Contract

### Current state (with SQL evidence)

```sql
SELECT ... ;
```

Expected result: <what plan assumes is true now>

### Target state

<What is true after deploy completes successfully>

### Invariants (must NEVER be violated, even mid-deploy)

<e.g., "No order may have payment_status='paid' AND status='cancelled' simultaneously">

## 3. Cross-app safety check

| App | Impact | Mitigation |
|---|---|---|
| CRM web app | <impact> | <mitigation> |
| Customer App | <impact> | <mitigation> |
| Agent App | <impact> | <mitigation> |

## 4. SQL blocks (numbered, copy-paste runnable)

### Block 1: <description>

```sql
-- Block 1
```

Verification:

```sql
SELECT ... ;
```

Expected: <specific>

### Block 2: <description>

<...>

## 5. Edge function / frontend changes

| File | Lines | Change summary |
|---|---|---|
| supabase/functions/<name>/index.ts | 100-150 | <what changes> |

## 6. Deployment sequence

1. Apply Block 1 SQL
2. Verify with: <SQL>
3. Deploy edge function <name> v<N+1>
4. Smoke test: <exact curl or click sequence>
5. Verify: <SQL evidence>

## 7. Verification gates

| Gate | Test | Expected | Required for |
|---|---|---|---|
| G1 | <SQL or curl> | <specific result> | Step N |
| G2 | <SQL or curl> | <specific result> | Step N+1 |

## 8. Rollback plan

### If Block N fails

```sql
-- Exact SQL to undo:
```

### If frontend deploy fails

<Revert PR commit <sha> from main>

## 9. Knowledge update required?

- [ ] No — change is self-contained
- [ ] Yes — update <file> to reflect <what>
- [ ] ADR required — ADR-NNN-<topic>.md

## 10. Acceptance criteria

- [ ] All SQL blocks executed successfully
- [ ] All gates passed
- [ ] All cross-app smoke tests passed
- [ ] Knowledge files updated
- [ ] Lock removed from docs/active-work.md
