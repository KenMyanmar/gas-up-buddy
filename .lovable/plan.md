

# Profile Page — Functionality Audit & Fix Plan

## Current Reality
Only 2 of 8 menu items work (Call 8484 + Log Out). The profile header data (name, phone, order count) correctly pulls from Supabase. Everything else is a dead-end button.

## Recommended Approach: Make Items Useful for Demo

Given this is for an investor demo, I recommend a pragmatic split:

### Items to Wire Up Now (no new backend needed)
1. **Delivery Addresses** — Navigate to a simple page showing the customer's current township + address from the existing `customers` table. No multi-address support needed yet.
2. **Call 8484** — Already works.
3. **Help & FAQ** — Create a static page with common questions (hardcoded content).
4. **Terms & Conditions** — Create a static page with placeholder legal text.
5. **Privacy Policy** — Create a static page with placeholder text.

### Items to Mark as "Coming Soon" (need backend tables)
6. **Payment Methods** — No `payment_methods` table exists. Show a toast: "Coming soon!"
7. **Preferences** — No settings table. Show a toast: "Coming soon!"

### Implementation (5 files)

**`src/pages/ProfilePage.tsx`**
- Add `onClick` handlers: navigate to `/profile/addresses`, `/profile/faq`, `/profile/terms`, `/profile/privacy`
- Payment Methods + Preferences: show toast "Coming soon"

**`src/pages/ProfileAddresses.tsx`** (new)
- Simple page showing current address + township from customer record
- Back button to `/profile`

**`src/pages/ProfileFAQ.tsx`** (new)
- Accordion with 5-6 common questions (ordering, delivery, payment, contact)

**`src/pages/ProfileTerms.tsx`** (new)
- Static legal placeholder text

**`src/pages/ProfilePrivacy.tsx`** (new)
- Static privacy placeholder text

**`src/App.tsx`**
- Add 4 new routes under `/profile/*`

### Changes: 6 files (1 modified, 4 new pages, 1 route update). No database changes.

