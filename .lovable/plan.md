

## Plan: Acknowledge v33 Live — Hold For Tester Log Evidence Before Any Further Action

### Status

v33 of `kbzpay-auto-login` is deployed by Ken with the exact parser shape you specified. All guardrails (one file, two parsers, masked logs, `verify_jwt=false`, no frontend/DB/auth changes, structured `failure_code` tags) are confirmed in his deployment summary. Nothing for me to build right now.

### What Happens Next (no code action this turn)

The plan is **wait for tester evidence**, then branch. Per `mem://constraints/kbz-debug-protocol`: no proposed fix without a log line proving the failure mode.

### Branching Plan Once Tester Retries Inside Real KBZ Pay App

**Step 1 — Pull `kbzpay-auto-login` logs at the test timestamp** using the analytics query / edge function logs tool, filtered to v33.

**Step 2 — Match against this decision table:**

| Log evidence | Interpretation | Next action |
|---|---|---|
| `getAccessToken success` line present + `getUserInfo success` line present + flow returns `linked` / `new_account` / `link_pending` | Full fix confirmed. KBZ Mini App login restored. | Open Phase 3 (defensive `mintSession` retry) and Phase 4 (`8a2e68a4` row normalization) as separate plans per the postmortem. |
| `getAccessToken success` + `getUserInfo` fails with `KBZ_NO_PHONE` | Token parser works; phone is at an unknown nested path. The new `parsedContent_user_keys` + `parsedContent_user_Response_keys` log lines will name the exact shape in one read. | Open a one-line follow-up plan to add the missing path; no other code touched. |
| `getAccessToken` still fails — `responseCode: 0`, `content` present, but parser misses it | Parser bug or content shape unexpected (object vs string at top level). | Re-inspect the masked content shape from logs; one-line fix. |
| `getAccessToken` fails with `responseCode != 0` | KBZ actually rejecting (different failure mode than before). | Map `responseCode` to the four-cause table from earlier plan; route to correct owner (us / KBZ PMO / KBZ ops). |
| No invocation logs at test time | Request never reached Supabase — KBZ Pay container or network issue. | Escalate to KBZ side with timestamp; not our code. |

**Step 3 — Post raw findings back to chat.** No fix proposed in the same turn unless the evidence is unambiguous and the change is one-line.

### Out Of Scope (do not act this turn)

- No code changes — v33 is the change; awaiting evidence.
- No DB writes — `8a2e68a4` row normalization stays Phase 4 hygiene, post-verification.
- No `mintSession` retry change — Phase 3, post-verification.
- No `kbzpay-create-payment` or `kbzpay-webhook` parser changes — those endpoints have not produced log evidence of the same shape; do not touch without proof.
- No `verify_jwt` toggling.
- No frontend changes — `useKbzAutoLogin` already surfaces `failure_code`.

### Required Information From PM / Tester

To pull the right log window:

1. **Approximate UTC timestamp** of the tester's retry (±5 min).
2. **What screen they saw** at the end of the attempt (signed in successfully / red retry card / spinner stuck / KBZ-side error).
3. **Phone number used** for the test (so the log query can filter to that user).

### Acceptance

- Tester retry confirmed inside real KBZ Pay app.
- Logs pulled against confirmed timestamp; v33 invocation present.
- Decision-table branch selected based on actual log lines.
- Either: success confirmed and Phase 3 / Phase 4 plans queued, OR a one-line follow-up fix is opened against the exact shape revealed in the new diagnostic log.
- No speculative fixes, no DB writes, no scope creep — the protocol holds.

### Why This Is The Correct Next Move

v33 is exactly the evidence-gathering instrument the postmortem called for. Acting on it before the tester runs it would burn the instrument's value. Discipline now → one clean read → mapped fix. This is the loop the new debug protocol exists to enforce.

