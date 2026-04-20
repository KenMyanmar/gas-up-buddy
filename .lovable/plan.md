

# Single Smart Welcome Page (`/welcome`)

This is the same plan you approved before, refined to match the latest prompt (no `landmark` field — only `full_name`, `township`, `address`).

## Goal
Add one adaptive page that runs after every successful login (KBZ auto-login OR phone/OTP). It inspects the customer profile and renders one of three states. Replace direct post-login `navigate("/home")` with `navigate("/welcome")`.

## States
- **State 1 — Returning + complete** (`full_name`, `address`, `township` all filled): confirmation card → `Yes, this is correct` (→ `/home`) or `Update my details` (→ inline form).
- **State 2 — Returning + incomplete**: pre-filled editable form.
- **State 3 — New customer** (all profile fields empty): empty welcome form, friendlier copy.

All states share: same Supabase update, hardcoded 36-township dropdown, secondary-phones manager, `Call 8484` footer.

## Files

| Action | File | Purpose |
|---|---|---|
| Create | `src/pages/WelcomePage.tsx` | The 3-state adaptive page |
| Create | `src/lib/yangonTownships.ts` | Hardcoded 36-township constant |
| Edit | `src/App.tsx` | Add `/welcome` route under `AuthOnlyRoute` |
| Edit | `src/pages/PhoneEntry.tsx` | Post-login redirects → `/welcome` (returning user, `kbz.status === "linked"`, and `kbz.status === "new_account"`) |
| Edit | `src/pages/LinkNewCustomer.tsx` | Post-register redirect → `/welcome` |
| Edit | `src/pages/KbzProfileComplete.tsx` | Post-submit redirect → `/welcome` (kept for backward routing safety) |

No DB changes. No edge function changes. No `verify_jwt` changes. RLS policies (`customers_update_own_profile`, `customer_phones` insert/delete) already deployed per prompt.

## WelcomePage logic

```text
useAuth() → user
useQuery(['customer_profile', user.id]) → customer (id, full_name, address, township)
useQuery(['customer_phones', customer.id]) → phones (id, phone, label, is_primary, verified)

state derivation:
  loading → spinner + "Loading your profile..."
  fetch error → "Something went wrong. Please try again." + Retry + Call 8484
  full_name && address && township && !editing → STATE_1
  else → STATE_2 / STATE_3 (same form, different copy based on whether any fields exist)

mutations (rely on already-deployed RLS):
  updateProfile: supabase.from('customers').update({ full_name, township, address }).eq('id', customer.id)
  addPhone:    supabase.from('customer_phones').insert({ customer_id, phone, label: 'secondary' })
  deletePhone: supabase.from('customer_phones').delete().eq('id', phoneId)

post-save / Yes-confirm → navigate("/home")
```

## Routing

```tsx
<Route path="/welcome" element={<AuthOnlyRoute><WelcomePage /></AuthOnlyRoute>} />
```
Must use `AuthOnlyRoute` (not `ProtectedRoute`) — `ProtectedRoute` redirects to `/onboarding/link-new` when no customer profile exists, but Welcome must run *before* that gate for partially-set-up new customers.

## UX details
- Township: searchable select (reuse existing `Command`/`cmdk` primitive in `components/ui/command.tsx`).
- Phone validation: starts with `09`, 9–11 digits total. Max 3 secondary phones (4 total).
- Insert error `23505` → toast "This phone number is already registered". Other insert errors → "Failed to add phone number". Delete errors → "Cannot remove this phone number".
- Primary phone: ✅ badge, no delete button. Unverified secondary phones: "unverified" pill.
- `Call 8484` rendered as muted, centered footer link (`<a href="tel:8484">`) on every state.
- Never surface raw Supabase error messages.

## Out of scope (do NOT touch)
Edge functions (`kbzpay-*`, `link-customer-account`, `create-customer-order`), DB schema/RLS/enums/triggers, `types.ts`, login UI flow (only post-success redirect changes), payment/order/tracking flows, `verify_jwt` settings, `customers.phone`, `customers.status`, brand/cylinder/pricing data.

## Post-deploy checklist
1. KBZ Mini App auto-login → `/welcome` shows correct state.
2. Phone/OTP login → `/welcome` shows correct state.
3. State 1 → `Yes` → `/home`. `Update` → form pre-filled, save → `/home`.
4. State 2 (e.g. missing township) → form pre-filled, save → `/home`.
5. State 3 (new auto-login customer) → empty form, save → `/home`.
6. Add secondary phone → appears with "unverified" pill. Delete it → gone. Primary cannot be deleted.
7. `tel:8484` opens dialer on device.
8. **Manual:** re-toggle `verify_jwt = false` on `kbzpay-create-payment` in Supabase Dashboard (Lovable deploys reset it).
9. Full order flow end-to-end still works.

