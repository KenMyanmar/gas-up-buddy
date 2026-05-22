# Remove Log Out button (temporary)

## 1. All logout entry points (search results)

Searched `src/` for `signOut`, `handleLogOut`, `LogOut`, "Log Out", "Logout", "Sign Out":

| File | Component | What it is |
|---|---|---|
| `src/contexts/AuthContext.tsx` (L8, 40–41, 47) | `AuthProvider` | Defines `signOut()` that calls `supabase.auth.signOut()` and exposes it via context. Infrastructure, not UI. |
| `src/pages/ProfilePage.tsx` L1 | import | `LogOut` icon imported from lucide-react. UI-only. |
| `src/pages/ProfilePage.tsx` L8 | `ProfilePage` | Destructures `signOut` from `useAuth()`. |
| `src/pages/ProfilePage.tsx` L17–20 | `handleLogOut` | Calls `signOut()` then `navigate("/")`. |
| `src/pages/ProfilePage.tsx` L135–142 | JSX `{/* Logout */}` block | The visible "Log Out" button with `LogOut` icon. **This is the only user-facing logout control in the app.** |

## 2. Programmatic vs user-facing

- **User-facing (to remove):** the Profile page Log Out button — `ProfilePage.tsx` lines 135–142, plus its handler (`handleLogOut`, L17–20) and its `signOut` destructure (L8) and `LogOut` import (L1).
- **Programmatic `signOut()` calls:** **none.** `signOut` is defined in `AuthContext` but is not invoked anywhere else (no auth-error handler, no route guard, no session-expiry path). `ProfilePage` is the sole consumer.
- **Other `supabase.auth.signOut()` direct calls:** none outside `AuthContext`.

## 3. Dependency check

- No tests reference `signOut`, `handleLogOut`, `LogOut`, or the Log Out text (only matches were `src/data/privacyContent.ts` which mentions auto-login in copy, unrelated).
- No route or conditional renders depend on the button existing.
- `BottomNav` Profile tab still navigates to `/profile`; the page renders fine without the button.

## 4. Auto-login interaction

`useKbzAutoLogin` (mounted in `PhoneEntry` at `/onboarding/phone`) runs once per app session via a module-level guard. On a fresh launch with no Supabase session it calls KBZ `getAuthCode()` → edge function `kbzpay-auto-login` → `supabase.auth.setSession(...)`. So if a session were cleared, the next cold launch inside the KBZ Mini App would re-authenticate automatically.

Since we are **removing the only way for the user to clear their session**, this interaction is moot for end users — no one can strand themselves. The auto-login path is unchanged.

## 5. Proposed change (exact minimal edit)

**File:** `src/pages/ProfilePage.tsx` only.

- Delete JSX block L135–142 (the `{/* Logout */}` button).
- Delete handler `handleLogOut` (L17–20).
- Change destructure on L8 from `const { user, signOut } = useAuth();` to `const { user } = useAuth();` (safe — `signOut` is not used programmatically anywhere else).
- Change import on L1 from `import { ChevronRight, LogOut, Flame } from "lucide-react";` to `import { ChevronRight, Flame } from "lucide-react";` (`LogOut` is the icon used only inside the deleted button; `Flame` and `ChevronRight` stay — both used elsewhere on the page).
- `navigate` from `react-router-dom` stays (used by `accountItems`/`supportItems` actions).

Leave `AuthContext.signOut` intact — it remains available for future re-enable and for any future programmatic use.

## 6. Scope & safety

- Frontend-only. One file modified: **`src/pages/ProfilePage.tsx`**.
- No changes to `supabase/functions/**`, no schema changes, no edge-function changes, no auth-context changes, no routing changes.
- TRIO: pure UI removal, no Grand Plan required.

## 7. Reversibility

To restore later, re-add to `src/pages/ProfilePage.tsx`:

1. Import: add `LogOut` back to the lucide-react import.
2. Hook: change `const { user } = useAuth();` back to `const { user, signOut } = useAuth();`.
3. Handler: re-add
   ```ts
   const handleLogOut = async () => {
     await signOut();
     navigate("/");
   };
   ```
4. JSX (after the Support section, last child of the `px-5 pt-5 space-y-5` container):
   ```tsx
   {/* Logout */}
   <button
     onClick={handleLogOut}
     className="flex w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-border-strong bg-card py-3.5 text-sm font-bold text-destructive transition-all hover:bg-destructive/5"
   >
     <LogOut className="h-4 w-4" />
     Log Out
   </button>
   ```

After implementation: Publish → Update, wait ~60s, force-close KBZ Pay and reopen to clear WebView cache.
