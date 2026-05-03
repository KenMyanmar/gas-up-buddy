# ADR-002: Cron deploys require pg_net smoke test, not pg_cron status

**Status:** Accepted
**Date:** 2026-05-03
**Authors:** Architect
**Reviewers:** Operator, CEO

---

## Context

On 2026-05-03, Operator scheduled `kbzpay-reconcile-sweep` (Job #4, `*/15 * * * *`). First run reported `cron.job_run_details.status='succeeded'`, `duration=0.04s`. Operator and Architect initially interpreted as success.

Architect then queried `net._http_response` and discovered the actual HTTP response was **status 401 Unauthorized**. Investigation revealed the vault secret `service_role_key` contained the placeholder string starting with `"YOUR"` (26 chars) instead of a real ~200-char service role JWT.

**`cron.job_run_details.status='succeeded'` only confirms `net.http_post` returned a row. It does NOT confirm the HTTP request reached the edge function or returned 2xx.** This Supabase quirk nearly caused us to ship the W3 webhook change (depends on cron as safety net) on top of a non-functional cron.

## Decision

Every cron job that calls an edge function MUST be validated by querying `net._http_response` for the actual HTTP status code, not by `cron.job_run_details.status`. This validation is a required smoke test in any Grand Plan that schedules or modifies a cron job.

The smoke test must confirm `status_code = 200` (or expected non-2xx) within one full cron cycle of deployment.

## Consequences

### Positive
- Authentication misconfigurations caught before downstream features depend on cron
- Standardized smoke test for any pg_cron + edge function pairing
- Prevents "silent success" anti-pattern

### Negative
- Adds 5-15 minutes to cron deploy verification (must wait for one cycle)
- Requires reviewers to remember the distinction

### Neutral / future-watch
- If Supabase changes pg_cron to surface actual HTTP status, this ADR can be revisited
- For non-HTTP cron jobs (cleanup DELETEs), this ADR doesn't apply — verify by querying affected tables

## Alternatives considered

### Alternative A: Trust `cron.job_run_details.status='succeeded'`
Rejected. As demonstrated, that status only means `net.http_post` returned a row.

### Alternative B: Heartbeat table on every edge function invocation
Deferred. Adds complexity. Revisit if >5 cron-driven edge functions.

### Alternative C: Edge function logs as source of truth
Partially adopted. Edge function logs checked alongside `net._http_response` to confirm function's own return status. But `net._http_response` is the gateway-level truth.

## Implementation references

Required smoke test pattern:
```sql
SELECT id, status_code, error_msg, created
FROM net._http_response
WHERE created > NOW() - INTERVAL '<cycle + 1 minute>'
ORDER BY created DESC LIMIT 5;
-- Expected: status_code = 200
```

## Revisit conditions

- Supabase publishes pg_cron update surfacing actual HTTP response code
- Cron jobs running more frequently than every minute

## Cross-reference

- Related: ADR-001 (depends on cron working as safety net)
- Bug history: vault secret 401 issue, 2026-05-03
