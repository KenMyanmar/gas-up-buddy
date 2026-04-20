

# Replace "KBZ Pay Required" Blocker with Retry Card

KBZ-only Mini App. When `getAuthCode` fails, show a friendly retry card instead of a dead-end blocker. No phone/OTP, no environment-gate fallbacks.

## Files to edit

| Action | File | Change |
|---|---|---|
| Edit | `src/hooks/useKbzAutoLogin.ts` | Add `"retry_needed"` status. Map bridge/timeout failures to `"retry_needed"` (replacing `"auto_login_unavailable"`). Reserve `"error"` for true backend failures. Expose a `retry()` function that re-runs the full auto-login attempt without page reload. |
| Edit | `src/pages/PhoneEntry.tsx` | Remove all phone/OTP UI and any `KbzError` blocker rendering. Render only the KBZ states (spinner / candidate selector / retry card). |
| Edit | `src/components/KbzError.tsx` | Delete the `"outside-kbz"` entry from config map AND from `KbzErrorReason` union so the "KBZ Pay Required" screen cannot reappear. |

No edge function changes. No `/welcome` changes. No payment, schema, RLS, or `verify_jwt` changes.

## `useKbzAutoLogin` changes

Status union becomes:
```ts
"idle" | "authenticating" | "linked" | "new_account"
| "link_pending" | "linked_select" | "retry_needed" | "error"
```

- Keep existing 5s timeout around `getAuthCode`.
- Any bridge throw or timeout → `status = "retry_needed"` (console.warn, not error).
- `"error"` reserved for backend non-2xx after a valid authCode was obtained.
- New `retry()` function: resets to `"authenticating"` and re-invokes the same internal flow used on mount.
- Remove the now-unused `"auto_login_unavailable"` status and its handling.

## `PhoneEntry.tsx` rendering

```text
authenticating         → spinner + "Connecting to KBZ Pay..."
linked / new_account   → navigate("/welcome", { replace: true })
link_pending           → existing link UI
linked_select          → existing candidate selector
retry_needed | error   → Retry Card
```

Retry Card:
```
We couldn't sign you in

Please close this Mini App and open it again from KBZ Pay.

[ Try Again ]

Need help? Call 8484
```
- `Try Again` → `kbz.retry()`
- `Call 8484` → `<a href="tel:8484">` muted footer link
- No error codes, no raw Supabase messages

Remove all phone-input / OTP UI and any leftover `auto_login_unavailable` handling from this file.

## `KbzError.tsx` cleanup

- Remove `"outside-kbz"` from the config map.
- Remove `"outside-kbz"` from the `KbzErrorReason` union so TypeScript prevents accidental reintroduction.
- Other reasons (`payment-failed`, `session-lost`, `jssdk-missing`, etc.) remain for non-onboarding contexts.

## Out of scope (do NOT touch)
- Edge functions: `kbzpay-auto-login`, `kbzpay-link-customer`, `kbzpay-create-payment`, `kbzpay-webhook`, `create-customer-order`
- `/welcome` page
- Payment / order / tracking flows
- `verify_jwt` settings
- DB schema, RLS, enums, triggers
- The two flagged pending fixes (`order_type` enum mapping; Phase 2 auto-login `customer_phones` filter) — separate approved prompts, not bundled here

## Acceptance criteria
1. `/#/onboarding/phone` never renders "KBZ Pay Required".
2. Working auto-login → `/welcome` (State 1 existing, State 3 new) → unchanged downstream flow.
3. `getAuthCode` timeout/failure → friendly Retry Card with `Try Again` and `Call 8484`.
4. `Try Again` re-invokes `getAuthCode` without page reload.
5. No phone input, no OTP input, no environment-detection gate anywhere.

## Post-deploy checklist
1. Existing KBZ number → auto-login → `/welcome` State 1 → home.
2. New KBZ number → auto-login → `/welcome` State 3 → fill name/address → home.
3. Force timeout (airplane mode briefly) → Retry Card appears → `Try Again` re-runs.
4. `tel:8484` opens dialer.
5. Re-toggle `verify_jwt = false` on `kbzpay-create-payment` (Lovable deploys reset it).
6. Edge function logs: confirm at least one `kbzpay-auto-login` 200 after a successful test (proves backend was reached).
7. Full order flow end-to-end still works.

