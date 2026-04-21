

# Disable Navigator LockManager in Supabase Client (KBZ WebView Fix)

## Root cause

KBZ Pay's WebView doesn't fully support the Navigator LockManager API that `@supabase/gotrue-js` uses by default to serialize auth operations. When `setSession` is called inside the WebView, the lock acquisition hangs/throws → session never persists → frontend never receives the `SIGNED_IN` event → `user` stays null → spinner forever.

Backend is perfect (v25). Frontend loop is fixed. The session token from the edge function reaches `supabase.auth.setSession()` and dies inside the lock.

## File to edit

`src/integrations/supabase/client.ts`

## Change

Add a no-op `lock` to the `auth` config. Keep existing `storage`, `persistSession`, `autoRefreshToken`. Add `detectSessionInUrl: false` (Mini App never uses URL-based auth callbacks; HashRouter would confuse the detector).

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rtbkhrenswgzhuzltpgd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGci...QmsK"; // unchanged

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // No-op lock: bypass Navigator LockManager which hangs in KBZ WebView.
    // Safe here because the Mini App is single-tab and we never run parallel auth ops.
    lock: (_name, _acquireTimeout, fn) => fn(),
  },
});
```

## Why this is safe

- Navigator locks exist to prevent two tabs from racing on token refresh. The Mini App is a single WebView — no concurrent tabs.
- `setSession`, `getSession`, and `refreshSession` are already serialized by our own `running.current` ref + `globalRanOnce` guard.
- Desktop browsers will still work — the no-op lock is just synchronous.

## Out of scope
- Edge functions (perfect at v25)
- `useKbzAutoLogin` (already correct — diagnostics will now actually log SUCCESS)
- `PhoneEntry.tsx` (navigation gate already correct)
- `WelcomePage` route guard
- DB / RLS / migrations

## Acceptance criteria
1. `[KBZ-DIAG] setSession SUCCESS, user id: …` appears in console (previously hung silently).
2. `onAuthStateChange` fires `SIGNED_IN` within ~200ms of `setSession`.
3. `useAuth()` returns `user` populated → `PhoneEntry` navigates to `/welcome`.
4. No `Acquiring an exclusive Navigator LockManager lock` error in DevTools.
5. Existing customer (`79e0bf1e…`) lands on `/welcome` and stays.

## Post-deploy checklist
1. **Publish → Update** in Lovable. Wait 60s.
2. Hard-refresh `miniapp.anygas.org` on desktop with DevTools Console open. Confirm no LockManager error and full `[KBZ-DIAG]` chain completes.
3. Open in real KBZ Mini App → 1 POST → land on `/welcome`.
4. Re-toggle `verify_jwt = false` on `kbzpay-create-payment` (Lovable resets this).
5. Full order flow end-to-end.

