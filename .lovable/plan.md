## Fix PhoneEntry stale-session race (P0)

### Problem
PhoneEntry's navigation effect redirects to `/welcome` as soon as `customerFetched && !customer`, even while `useKbzAutoLogin` is still resolving. For orphan auth sessions (existing customer with `auth_user_id = NULL`), this fires before the `link_pending` candidate picker can render, so the user lands on WelcomePage with an error instead of seeing "Welcome back / That's me".

### Change 1 — Gate the navigation effect on KBZ status
File: `src/pages/PhoneEntry.tsx` (lines 48–60)

Replace the effect so it blocks navigation while KBZ owns the screen (`idle`, `authenticating`, `link_pending`, `linked_select`). Only navigate to `/welcome` when KBZ is in a terminal state. Add `__perf` breadcrumbs for blocked vs allowed navigation (per task spec). Include `kbz.status` in deps.

### Change 2 — Harden single-candidate UI
File: `src/pages/PhoneEntry.tsx` (lines 94–160)

- Compute `displayName = candidate?.name?.trim() || "your account"` and `firstName = displayName.split(/\s+/)[0] || "there"`. Stop calling `candidate.name.split` directly.
- Render `candidate.address_masked || "Address on file"`.
- Render `candidate.total_orders ?? 0`.
- `formatDate` already returns `null` on missing input; also guard against `isNaN(d.getTime())` so invalid dates render nothing. Keep the `member_since &&` wrapper so nothing renders when null/invalid.

### Out of scope
- No backend / edge function changes.
- No changes to `useKbzAutoLogin`, `linked` / `new_account` handling, or `kbzpay-link-customer` contract.
- Multi-candidate `CandidateCard` and other branches untouched.

### Verification
1. Orphan auth session + `link_pending` (1 candidate) → stays on PhoneEntry, shows "Welcome back, {firstName}!".
2. Tap "That's me" → one `kbzpay-link-customer` call, session set, navigates to `/welcome`.
3. Normal `linked` path still navigates to `/welcome` after KBZ resolves.
4. `__perf` logs show `phone-entry-nav-blocked` during KBZ-owned states.

After approval: apply patch, then user clicks Publish → Update and waits 60s.
