

# Frontend Hardening: Silent Fallback When `getAuthCode` Fails

## Context (alignment with Ken's analysis)
Tester's console shows native bridge is reachable (`getStatusBarHeight` works) but `getAppInfo` returns `{}` and `getAuthCode` fails. DB confirms zero auto-login attempts ever reached the backend → failure is 100% client-side, before the edge function call.

Two parallel tracks:
1. **Portal side (Ken's job, outside this repo):** verify ClientID/Secret, tester whitelist, KBZ Pay app version ≥ 5.8.0.
2. **Frontend side (this plan):** stop surfacing `getAuthCode` failures as blocking errors. Auto-login is an *enhancement*; when it fails, fall through silently to phone/OTP entry.

This plan covers track 2 only.

## Current behavior (read from `useKbzAutoLogin.ts` + `kbzpay-bridge.ts`)
- `useKbzAutoLogin` calls `getAuthCode()` → on throw, sets `status = "error"` and surfaces `error` string.
- Consumer page (`PhoneEntry.tsx`) likely renders `<KbzError />` blocking the phone form.
- Result: tester sees a hard error screen instead of being able to log in via phone/OTP.

I need to confirm the consumer rendering before finalizing the patch.

## Files to read before editing
- `src/lib/kbzpay-bridge.ts` — confirm `getAuthCode` rejection shape & timeout behavior
- `src/pages/PhoneEntry.tsx` — confirm how `status === "error"` is rendered today
- `src/components/KbzError.tsx` — confirm if it blocks the phone form

## Proposed changes (2 small edits, no backend, no SQL)

### Edit 1 — `src/hooks/useKbzAutoLogin.ts`
Add a new terminal status `"auto_login_unavailable"` distinct from `"error"`:
- When `getAuthCode()` itself throws (before any backend call), set `status = "auto_login_unavailable"` and log a `console.warn` (not error).
- Keep `"error"` reserved for backend failures (edge function returned non-2xx, session mint failed, etc.) — those are real bugs worth surfacing.
- Add a 5s timeout wrapper around `getAuthCode()` so a hung native bridge doesn't freeze the UI forever.

### Edit 2 — `src/pages/PhoneEntry.tsx`
- Treat `"not-in-kbz"` AND `"auto_login_unavailable"` identically: render the normal phone/OTP form, no error banner.
- Keep `<KbzError />` only for the genuine `"error"` status (backend-side failure).
- Optionally add a small dev-only console hint: `[KBZ] Auto-login unavailable, falling back to phone entry`.

### What stays untouched
- `kbzpay-bridge.ts` `isInKbzPay()` detection logic
- `kbzpay-auto-login` edge function (already correct, just never reached today)
- `kbzpay-link-customer` edge function
- All non-KBZ auth paths
- Memory rule: `kbzpay` (no underscore) naming
- `verify_jwt` settings
- Order/payment/webhook functions

## Files
| Action | File |
|--------|------|
| Edit | `src/hooks/useKbzAutoLogin.ts` (add timeout + new status) |
| Edit | `src/pages/PhoneEntry.tsx` (treat unavailable as not-in-kbz) |
| Read-only | `src/lib/kbzpay-bridge.ts`, `src/components/KbzError.tsx` (verify before edit) |

## Post-deploy verification
- Open Mini App in KBZ Pay where `getAuthCode` fails → tester sees the **phone entry form** (not an error screen) within ~5s.
- Open in normal browser → `not-in-kbz` path unchanged, phone form renders immediately.
- Open in KBZ Pay where `getAuthCode` succeeds → auto-login path unchanged, lands on candidate selector / home as before.
- Backend logs: `kbzpay-auto-login` invocation count stays at 0 for the failing tester (proves we didn't accidentally call it with a bad code) and increments normally for working sessions.

## Governance
- Frontend-only patch. No SQL, no DB writes, no edge function changes, no enum touches. Within Executor scope per TRIO v1.1.

