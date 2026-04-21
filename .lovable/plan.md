

# Option B — Dev-Only Desktop Sign-In On The Retry Card

## Goal

Make the Lovable desktop preview usable for UI development without a phone, by adding a small "Dev sign-in" panel under the retry card. Production builds are unaffected.

## Where it shows

`src/pages/PhoneEntry.tsx`, only when ALL of these are true:
- `import.meta.env.DEV === true` (Lovable preview / local dev only — never in Published build)
- `kbz.status === "retry_needed"` (KBZ bridge failed, retry card is rendering)

In production (`gas-up-buddy.lovable.app`, `miniapp.anygas.org`) the panel is tree-shaken / runtime-skipped.

## What it does

A small card under the existing "We couldn't sign you in" retry card:
- Phone input (prefilled `+959123456789`)
- Password input (prefilled `123456`)
- "Dev sign in" button

On click:
1. Convert phone via existing `toInternational` from `src/lib/phoneUtils.ts`
2. Derive the dev email the same way the existing test account uses (per `mem://constraints/auth-phone-blocker`)
3. Call `supabase.auth.signInWithPassword({ email, password })`
4. On success → existing `useEffect` in `PhoneEntry.tsx` (lines 19-30) sees `user` populate, fetches customer, navigates to `/welcome`
5. On error → toast with the error message; no nav

No new routes, no new guards, no changes to KBZ flow.

## Files touched

- `src/pages/PhoneEntry.tsx` — add the dev panel below the retry card, plus the sign-in handler

## Out of scope

- `src/lib/kbzpay-bridge.ts`, `src/hooks/useKbzAutoLogin.ts`, `index.html` — untouched
- Supabase client, edge functions, DB, RLS, migrations — untouched
- No change to `AuthContext`, `ProtectedRoute`, `AuthOnlyRoute`
- No new routes
- No production-visible UI

## Acceptance criteria

1. In Lovable preview: KBZ auto-login fails as today → retry card appears → a "Dev sign-in" panel appears below it, prefilled. Clicking signs in and navigates to `/welcome`.
2. In Published build at `gas-up-buddy.lovable.app` and `miniapp.anygas.org`: panel does NOT render. Retry card looks identical to today.
3. Real-phone KBZ flow unchanged: spinner → `/welcome`, no retry card flash (per the fix already shipped).

## Pre-flight check before coding

Confirm the dev test account exists and the email-derivation pattern in use (per `mem://constraints/auth-phone-blocker`). If the documented creds (`+959123456789` / `123456`) don't sign in, fall back to plain inputs (no prefill) so you can type any seeded account.

