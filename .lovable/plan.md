

# Implementation Plan: Supabase Integration for AnyGas Customer App

## Summary

Connect the app to Supabase, replace mock data with real database queries, build auth flow (with known phone-auth blocker), and create three post-OTP customer linking screens.

---

## Phase 1: Supabase Connection Setup

**Install** `@supabase/supabase-js` package.

**Create files:**

- `src/integrations/supabase/client.ts` — Supabase client initialized with project URL (`rtbkhrenswgzhuzltpgd.supabase.co`) and anon key. The anon key is a publishable key, safe to store in code.
- `src/integrations/supabase/types.ts` — TypeScript types for database tables: `brands`, `cylinder_types`, `townships`, `gas_prices`, `customers`, `orders`, `payments`, `customer_addresses`, `customer_preferences`, `order_ratings`, `refill_reminders`, `suppliers`, `delivery_proofs`.

---

## Phase 2: Auth Flow + Post-OTP Linking Screens

**Auth infrastructure (create):**
- `src/contexts/AuthContext.tsx` — AuthProvider wrapping the app, exposes `user`, `session`, `signOut`, `loading`. Uses `onAuthStateChange` listener set up before `getSession()`.
- `src/hooks/useAuth.ts` — convenience hook consuming AuthContext.

**Modify existing screens:**
- `src/pages/PhoneEntry.tsx` — call `supabase.auth.signInWithOtp({ phone })` on submit. Store phone in state/context for OTP screen. On error, show toast.
- `src/pages/OtpVerify.tsx` — call `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`. On success, navigate to linking flow instead of `/home`.

**Three new post-OTP linking screens (mock responses for now):**

1. `src/pages/LinkWelcomeBack.tsx` — "Welcome back, [name]!" with address. "That's me" button navigates to `/home`. "Not me" link falls through to new customer flow.

2. `src/pages/LinkSelectAddress.tsx` — "Which addresses are yours?" Card list with multi-select checkboxes. "Confirm" button (will call Edge Function with `selected_customer_ids` when live). Navigates to `/home`.

3. `src/pages/LinkNewCustomer.tsx` — "Welcome to AnyGas!" Name input, delivery address input, township dropdown (from real `townships` query), "Use Current Location" GPS button. "Start Ordering" button (will call Edge Function with `new_profile` payload when live). Navigates to `/home`.

**Routing updates in `App.tsx`:**
- Add routes: `/onboarding/link-welcome`, `/onboarding/link-select`, `/onboarding/link-new`
- Wrap authenticated routes with a guard component that redirects to `/` if no session
- Redirect onboarding routes to `/home` if already authenticated
- Wrap app in `<AuthProvider>`

**Known blocker:** Real phone OTP will fail because `profiles.email` is NOT NULL. Auth code will be correct but untestable via phone until CRM fix (GP-CUSTAPP-002). For testing: use manually created email+password user in Supabase Dashboard to validate Phases 3-5.

---

## Phase 3: Replace Mock Catalog Data with Real Queries

**Create query hooks (using TanStack Query):**
- `src/hooks/useBrands.ts` — `select * from brands`
- `src/hooks/useCylinderTypes.ts` — `select *, brands(*) from cylinder_types`
- `src/hooks/useGasPrices.ts` — `select * from gas_prices where effective_to is null`
- `src/hooks/useTownships.ts` — `select * from townships where is_active = true`

**Modify:**
- `src/pages/OrderConfigure.tsx` — Replace hardcoded `gasSizes` array with data joined from `cylinder_types` + `gas_prices`. Show loading skeleton while fetching. Delivery fee from `townships.base_delivery_fee` (NULL = 0 = free).
- `src/pages/LinkNewCustomer.tsx` — Township dropdown populated from real `townships` data.

---

## Phase 4: Customer Profile Integration

**Modify:**
- `src/pages/ProfilePage.tsx` — Fetch customer data from `customers` table using `auth.uid()` match on `auth_user_id`. Show real name, phone. Show order count from `orders` table.
- `src/pages/HomePage.tsx` — Replace `mockLastOrder` with query to `orders` table for authenticated user's most recent order. Show user's initial in header avatar. Location bar shows user's saved address from `customer_addresses`.
- Log Out button in Profile calls `supabase.auth.signOut()` and navigates to `/`.

---

## Phase 5: Orders History with Real Queries

**Create:**
- `src/hooks/useOrders.ts` — fetch from `orders` table filtered by customer, with status mapping.

**Modify:**
- `src/pages/OrdersPage.tsx` — Replace `mockOrders` with real query. Handle loading and empty states.

---

## What Stays Mock (Blocked)

- **Order placement** (`OrderConfirm.tsx` "Place Order") — remains mock `setTimeout` until Block 11 Edge Function is deployed
- **Post-OTP linking API calls** — UI is built but Edge Function calls are mocked until `link-customer-account` is deployed
- **Real phone OTP** — blocked until CRM fixes `profiles.email` NOT NULL constraint

---

## Files Created (10 new)

| File | Purpose |
|------|---------|
| `src/integrations/supabase/client.ts` | Supabase client |
| `src/integrations/supabase/types.ts` | DB type definitions |
| `src/contexts/AuthContext.tsx` | Auth state provider |
| `src/hooks/useAuth.ts` | Auth convenience hook |
| `src/hooks/useBrands.ts` | Brands query |
| `src/hooks/useCylinderTypes.ts` | Cylinder types query |
| `src/hooks/useGasPrices.ts` | Gas prices query |
| `src/hooks/useTownships.ts` | Townships query |
| `src/hooks/useOrders.ts` | Orders query |
| `src/pages/LinkWelcomeBack.tsx` | Post-OTP: single match |
| `src/pages/LinkSelectAddress.tsx` | Post-OTP: multi match |
| `src/pages/LinkNewCustomer.tsx` | Post-OTP: new customer |

## Files Modified (8)

| File | Changes |
|------|---------|
| `src/App.tsx` | AuthProvider wrapper, new routes, route guards |
| `src/main.tsx` | No change needed |
| `src/pages/PhoneEntry.tsx` | Real OTP send call |
| `src/pages/OtpVerify.tsx` | Real OTP verify, navigate to linking |
| `src/pages/OrderConfigure.tsx` | Real catalog data, loading states |
| `src/pages/HomePage.tsx` | Real last order, user data |
| `src/pages/OrdersPage.tsx` | Real orders query |
| `src/pages/ProfilePage.tsx` | Real customer data, signOut |

