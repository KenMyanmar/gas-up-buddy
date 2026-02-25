# AnyGas Customer Mobile App — Lovable Project Instructions

## Project Identity

**Project Name:** AnyGas Customer App  
**Type:** Mobile-First App (React + Capacitor for App Store / Play Store)  
**Purpose:** Gas ordering app for end customers — the "Grab for Gas"  
**Users:** Residential & commercial LPG customers across Yangon  
**Version:** 1.0 — Pre-Development Blueprint  
**Date:** February 25, 2026  
**Classification:** Confidential — Development Team Only

---

## The Vision: Why This App Exists

AnyGas customers today call 8484 to order gas. That's our superpower — zero friction, works for everyone. This app does NOT replace the hotline. It gives digitally-ready customers a faster, more delightful channel while keeping 8484 as the universal fallback.

**The North Star:** A customer should be able to reorder gas in under 10 seconds — faster than opening their phone dialer and calling 8484.

**The Anti-Pattern:** Padesar (competitor) requires 5+ steps, cart-based checkout, manual location entry, and 2-3 minutes per order. We are the opposite of that.

**The Inspiration:** Grab's one-tap ride booking, Foodpanda's reorder flow, Gojek's multi-service home screen. Adapted for Myanmar's trust culture and mixed digital literacy.

---

## Business Context

AnyGas is Myanmar's first multi-brand LPG coordination platform. Since 2019, 12,000+ customers across 33 Yangon townships have used the 8484 hotline for gas delivery. The platform coordinates between customers and vetted delivery agents (independent gas shop owners).

**Customer Value Proposition:**
- Any brand, any size — one app (Parami, Easy Gas, World Gas, and more)
- Transparent pricing — see the price before you order, no negotiation
- Vetted delivery agents — Safety Score system, delivery proof, accountability
- 30-45 minute delivery — real ETA, real tracking
- Multiple payment options — Cash, KBZ Pay, Wave Money, CB Pay
- Corporate accountability — 8484 stands behind every order

**Why Customers Use 8484 Instead of Calling Shops Directly:**
1. **Trust** — vetted agents, recorded orders, dispute resolution
2. **Convenience** — one number/app for any brand, any township
3. **Accountability** — the platform owns the relationship, not the agent
4. **Quality assurance** — Safety Score incentivizes good service

---

## Target Users

### Primary: Existing 8484 Customers (12,000+)
- Already trust the brand
- Migration path: "Download the app, order even faster"
- 93.8% have a unique phone number (clean 1:1 auth)
- 6.2% share a phone with family/building (multi-profile needed)

### Secondary: New Digital-First Customers
- Younger demographics comfortable with apps
- Condo residents in Yangon's growing apartment buildings
- Commercial accounts (restaurants, hotels, offices)

### User Personas

**Ma Thin (Residential — Regular Reorder)**
- Orders 7kg refill every 3-4 weeks
- Same address, same size, same delivery type every time
- Wants: tap → confirm → done. Under 10 seconds.

**Ko Zaw (Condo Building Manager)**
- Orders for 3-5 units in a building
- Different names, different floors, same phone number
- Wants: select unit → pick size → order. Quick switching between delivery addresses.

**Daw Khin (First-Time App User)**
- Has been calling 8484 for years, just got a smartphone
- Low digital literacy, reads Myanmar script
- Wants: big buttons, clear Myanmar text, feels like calling 8484 but on screen

**U Kyaw (Restaurant Owner — Commercial)**
- Orders 20kg cylinders 2-3 times per week
- Needs scheduled/recurring deliveries
- Wants: set it and forget it, invoice history for accounting

---

## Technical Architecture

### Stack
- **Frontend:** React 18 + TypeScript + Vite
- **UI Components:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (SHARED with CRM Web App + Agent Mobile App)
- **State Management:** TanStack React Query
- **Auth Method:** Phone OTP (primary) + Email (secondary)
- **Native Wrapper:** Capacitor (for App Store + Play Store distribution)
- **Maps:** Google Maps API (delivery tracking + address selection)
- **Notifications:** Firebase Cloud Messaging (via Capacitor plugin)
- **Analytics:** Mixpanel or Amplitude (user behavior tracking)

### Critical: Shared Supabase Backend

⚠️ **This is the THIRD app on the same Supabase project (alongside CRM Web App and Agent Mobile App).**

- **DO:** Add new tables for customer-specific features
- **DO:** Add new RLS policies for customer access
- **DON'T:** Modify existing CRM or Agent tables (customers, orders, suppliers schema)
- **DON'T:** Delete or alter existing RLS policies
- **DON'T:** Modify shared functions (is_crm_user, is_internal_staff, has_role)

**Every database change MUST go through the TRIO Grand Plan process.**

### Auth Architecture

```
Phone OTP → auth.users → profiles (customer_id populated) → user_roles (role: 'customer')
                                      ↓
                              customers table (auth_user_id = auth.uid())
                                      ↓
                              One phone can link to multiple customer records
                              (building managers, family accounts)
```

**Key Design Decision:** One auth account can own multiple customer records (delivery addresses). 93.8% of users will have exactly one record. 6.2% will see a profile selector.

---

## App Architecture — Screen Map

```
┌─────────────────────────────────────────┐
│              ONBOARDING                 │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ Welcome │→│  Phone   │→│ OTP    │ │
│  │ Screen  │  │  Entry   │  │ Verify │ │
│  └─────────┘  └──────────┘  └────────┘ │
│                     ↓                   │
│  ┌──────────────────────────────────┐   │
│  │  Profile Linking                 │   │
│  │  (if phone matches existing     │   │
│  │   customer records)             │   │
│  │  → Single match: auto-link      │   │
│  │  → Multiple: show selector      │   │
│  │  → No match: create new profile │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│              MAIN APP                   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │         HOME SCREEN              │   │
│  │  • Hero: "ORDER GAS NOW"        │   │
│  │  • Smart defaults (last order)  │   │
│  │  • Order Again shortcut         │   │
│  │  • Active order banner          │   │
│  │  • My Orders                    │   │
│  │  • Promotions / Tips            │   │
│  └──────────────────────────────────┘   │
│         ↓              ↓          ↓     │
│  ┌───────────┐  ┌──────────┐  ┌──────┐ │
│  │  ORDER    │  │  ORDERS  │  │PROFILE│ │
│  │  FLOW     │  │  HISTORY │  │      │ │
│  └───────────┘  └──────────┘  └──────┘ │
│       ↓                                 │
│  ┌──────────────────────────────────┐   │
│  │       LIVE TRACKING              │   │
│  │  • Map with driver location      │   │
│  │  • ETA countdown                 │   │
│  │  • Driver profile + contact      │   │
│  │  • Order details                 │   │
│  │  • Cancel option                 │   │
│  └──────────────────────────────────┘   │
│       ↓                                 │
│  ┌──────────────────────────────────┐   │
│  │       POST-DELIVERY              │   │
│  │  • Rate your delivery            │   │
│  │  • Tip your driver (future)      │   │
│  │  • Report issue                  │   │
│  │  • Reorder shortcut              │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Screen-by-Screen Specification

### 1. Onboarding Flow

#### 1.1 Welcome Screen
**Purpose:** Brand trust + auth entry

**Elements:**
- AnyGas 8484 logo (large, centered) with flame icon
- Tagline: "Your trusted gas delivery partner in Myanmar" (Myanmar + English)
- "Continue with Phone" button (PRIMARY — green, large)
- "Continue with Email" button (secondary — outlined)
- Terms & Privacy links at bottom
- Subtle background: light green gradient (brand color)

**UX Notes:**
- No registration form. Phone number IS the account.
- Returning users who already have auth session skip this entirely
- Deep link support: if opened from SMS promo, pre-fill phone number

#### 1.2 Phone Entry Screen
**Purpose:** Capture phone number

**Elements:**
- "Enter your phone number" header
- Phone input with Myanmar country code (+95) pre-selected
- Format hint: "09xxxxxxxxx"
- "Send OTP" button (green, full width)
- Back arrow

**Validation:**
- Accept: 09xxxxxxxxx format (11 digits starting with 09)
- Accept: +959xxxxxxxxx format
- Normalize to 09xxxxxxxxx for storage
- Real-time validation as user types

**UX Notes:**
- Auto-focus on phone input (keyboard opens immediately)
- Numeric keyboard only
- "Send OTP" disabled until valid format detected

#### 1.3 OTP Verification Screen
**Purpose:** Verify phone ownership

**Elements:**
- "We sent a code to 09xxx xxx xxx" (masked display)
- 6-digit OTP input (individual boxes, auto-advance)
- Countdown timer: "Resend code in 0:59"
- "Resend Code" link (appears after timer expires)
- "Wrong number?" link → back to phone entry

**UX Notes:**
- Auto-submit when 6th digit entered (no "Verify" button needed)
- Haptic feedback on successful verification
- If OTP from SMS, auto-fill via SMS read permission (Android)

#### 1.4 Profile Linking Screen
**Purpose:** Connect auth account to existing customer record(s)

**Scenario A — Single match (93.8% of users):**
- Auto-link silently
- Show: "Welcome back, [Full Name]!" with address confirmation
- "This is me" button → proceed to Home
- "Not me" → manual profile creation

**Scenario B — Multiple matches (6.2% of users):**
- "We found multiple addresses for your number"
- Card list showing: Name + Address for each record
- "Select all that are yours" (multi-select checkboxes)
- "Confirm" button
- Later: user can set a "default" delivery address

**Scenario C — No match (new customer):**
- "Welcome to AnyGas!"
- Minimal form: Full Name + Address + Township (dropdown)
- "Use Current Location" for GPS capture
- "Start Ordering" button
- Record created in `customers` table with `auth_user_id`

### 2. Home Screen (The Money Screen)

This is the most important screen in the app. It must accomplish one thing: **get the customer to their next order in the fewest taps possible.**

#### Layout (Top to Bottom)

**Header Bar:**
- Left: AnyGas 8484 logo (small)
- Right: Profile avatar (tap → Profile screen)
- Below: Location bar showing "📍 [Township], Yangon" + "Change" link

**Hero Section — "ORDER GAS NOW" Button:**
- Massive green rounded button (at least 30% of screen height)
- Shows smart defaults: "[Size] kg · [Type] · [Price] MMK"
- Defaults derived from: last order > most common order > 7kg refill
- Single tap → goes directly to Order Confirmation (not configuration!)
- This is the "Grab slide-to-book" equivalent

**Order Again Card (if returning customer):**
- Green-bordered card
- "🔄 Order Again"
- "Last order: [size] kg · [date]"
- Tap → pre-filled Order Confirmation screen
- If multiple past orders, show the most recent

**Active Order Banner (if order in progress):**
- Animated card at top (replaces Hero when active)
- "🚚 Your order is on the way!"
- "Arriving in [X] min" with progress indicator
- Tap → Live Tracking screen
- This should be IMPOSSIBLE to miss

**Quick Actions Grid:**
- "📋 My Orders" → Order History
- "🛒 Shop Accessories" → Accessories catalog (future)
- "📞 Call 8484" → Direct dial (always accessible)
- "❓ Help" → FAQ / Support

**Promotions / Tips Section (scrollable cards):**
- "Refer a friend, get 1,000 Ks off"
- "Switch to Easy Gas — special price this month"
- Gas safety tips (builds trust)
- Seasonal promotions

#### Super App UX Principles Applied:

**1. Smart Defaults (Grab Pattern)**
The hero button pre-fills everything from the last order. 70%+ of gas orders are identical repeats (same size, same address, same type). The user shouldn't have to configure anything.

**2. One-Tap Reorder (Foodpanda Pattern)**
"Order Again" is not buried in a menu. It's the second most prominent element after the hero button.

**3. Active Order Prominence (Uber Pattern)**
When an order is live, the entire home screen transforms. The user cannot accidentally place a duplicate order.

**4. Fallback Access (Myanmar Pattern)**
"Call 8484" is always one tap away. If the user gets confused or frustrated, they can fall back to voice. This is critical for adoption.

### 3. Order Configuration Screen

**When this screen appears:** Only when the user taps "ORDER GAS NOW" for the first time (no history) or taps "Change Order" from the confirmation screen.

**Returning users with history skip this screen entirely** — they go straight to confirmation with smart defaults.

#### Layout

**Delivery Location Section:**
- Current address shown in card format
- "📍 [Address], [Township], Yangon"
- "Use Current Location" link (GPS capture)
- "Change Address" → address selector (if multiple addresses)
- Map preview showing pin on delivery location

**Gas Size Selector:**
- Grid of size buttons: 4kg, 7kg, 10kg, 12kg, 15kg, 20kg
- Last-ordered size pre-selected (highlighted in green)
- Each button shows price below size: "7kg — 36,400 Ks"
- Prices pulled from `current_gas_prices` view

**Delivery Type Selector:**
- Two large cards side by side:
  - "🔄 Refill My Cylinder" — "(Bring empty, return filled)" — highlighted if last order was refill
  - "🆕 New Cylinder" — "(Keep the cylinder)" — shows deposit price addition
- Visual icons, not radio buttons — bigger touch targets
- Clear Myanmar-language explanation text on each

**Quantity Selector (Multi-Cylinder):**
- Default: 1 cylinder
- +/- buttons for multi-cylinder orders
- Max: 5 cylinders per order
- Price updates dynamically: "2 × 36,400 = 72,800 MMK"

**Order Summary Footer (sticky at bottom):**
- "💰 Total: [amount] MMK"
- "🚚 Free Delivery" (or delivery fee if applicable)
- "⏱ Arrives in 30-45 min" (estimated)
- "CONFIRM ORDER" button (large, green, full width)

#### UX Notes:
- Price is ALWAYS visible — no hidden fees, no surprises
- Delivery time estimate shows before confirmation (trust builder)
- "Free Delivery" prominently displayed (competitive advantage vs shops)
- All selections have visual feedback (bouncy animation on tap)
- Myanmar text alongside English for all labels

### 4. Order Confirmation Screen (Pre-Submit)

**Purpose:** Final review before placing the order. This is the "are you sure?" moment.

#### Layout

**Order Summary Card:**
- Gas: "[Size] kg LP Gas"
- Type: "Refill My Cylinder" or "New Cylinder"
- Quantity: "× [N]"
- Delivery to: "[Address], [Township]"
- Price: "[Total] MMK"
- Delivery fee: "Free" or "[amount]"

**Payment Method Selector:**
- Last used method pre-selected
- Options: Cash on Delivery, KBZ Pay, Wave Money, CB Pay
- Each with recognizable logo
- "Cash on Delivery" as default for new users (lowest friction)

**Special Instructions (optional):**
- Expandable text field
- Placeholder: "Floor number, landmark, gate code..."
- Collapsed by default (don't add friction for most users)

**PLACE ORDER Button:**
- Full width, green, prominent
- Shows total: "PLACE ORDER — 36,400 MMK"
- Loading state with spinner when tapped
- Disabled after tap (prevent double-submit)

**Cancel / Back:**
- "← Edit Order" link at top

### 5. Live Order Tracking Screen

**Purpose:** Real-time visibility into delivery status. This is the screen that builds trust and separates AnyGas from every competitor.

#### Order Status Timeline (top):
```
● Order Placed          ✓ 2:30 PM
● Agent Assigned        ✓ 2:31 PM  
● Preparing Delivery    ● (current — animated pulse)
○ On the Way            
○ Delivered             
```
Each step shows time completed. Current step pulses.

#### Driver Profile Card:
- Agent photo (circular avatar)
- Name: "Ko Aung Aung"
- Rating: "★ 4.8"
- Delivery count: "234 deliveries"
- Two action buttons:
  - "📞 Call" → direct dial to agent phone
  - "💬 Chat" → in-app messaging (Phase 2, or open Viber/Messenger)

#### Live Map:
- Full-width map (Google Maps)
- Agent location pin (green motorcycle icon) — real-time updates
- Customer location pin (red home icon)
- Dotted route line between them
- "🕐 Arriving in [X] min" overlay on map
- Map auto-centers to show both pins

#### Order Details Card (below map):
- Gas size + type
- Total price
- Payment method
- Delivery address

#### Actions:
- "Cancel Order" (red text link at bottom)
  - Only available before "On the Way" status
  - Confirmation dialog: "Are you sure? Your order will be cancelled."
  - After "On the Way": "Contact 8484 to cancel" (prevents loss for agent)

#### Status-Specific Behaviors:

**"Order Placed":**
- Map shows customer location only
- "Finding your delivery agent..." with animated dots
- Estimated wait time: "Usually assigned within 2-3 minutes"

**"Agent Assigned":**
- Agent card appears with photo + info
- Map shows agent location (at their shop)
- Call/Chat buttons activate

**"Preparing Delivery":**
- Agent still at shop location
- "Your agent is preparing your cylinder"

**"On the Way":**
- Agent location updates in real-time (every 15 seconds)
- ETA countdown updates dynamically
- Route line shows path from agent to customer
- Push notification sent: "Your gas is on the way! ETA: [X] min"

**"Delivered":**
- Confetti animation (brief, celebratory)
- "Your gas has been delivered! 🎉"
- Transition to Post-Delivery screen
- Push notification: "Gas delivered! Rate your experience"

### 6. Post-Delivery Screen

**Purpose:** Capture feedback and drive reorder habit.

#### Layout:

**Delivery Complete Header:**
- "✓ Delivered at [time]"
- Checkmark animation

**Rating Section:**
- "How was your delivery?"
- 5-star rating (large, tappable stars)
- Optional: Quick feedback tags (tap to select)
  - "Fast delivery" / "Friendly agent" / "Safe handling" / "On time"
- Optional: Text feedback field
- "Submit Rating" button

**Reorder Shortcut:**
- "🔄 Order Again" — same configuration, one tap
- "Set Reminder" → schedule notification for next refill
  - "Remind me in: 2 weeks / 3 weeks / 1 month / Custom"
  - Push notification fires at chosen time: "Time for a gas refill? Order now 🔥"

**Report Issue (collapsed by default):**
- "Something wrong?" expandable section
- Issue categories: Wrong size / Damaged cylinder / Late delivery / Rude agent / Other
- Text description field
- "Submit Report" → creates support ticket visible in CRM

### 7. Order History Screen

**Purpose:** View past orders + quick reorder from any past order.

#### Layout:

**Filter Tabs:**
- All / Active / Completed / Cancelled

**Order Cards (list):**
Each card shows:
- Date + Time
- Gas size + type: "7 kg · Refill"
- Status badge (green: delivered, yellow: in progress, red: cancelled)
- Price: "36,400 MMK"
- Agent name (if assigned)
- "Reorder" button on each card

**Empty State:**
- "No orders yet"
- "Place your first order!" → hero button to Home

### 8. Profile Screen

**Purpose:** Account management, addresses, preferences.

#### Layout:

**Profile Header:**
- Avatar (initial-based or photo)
- Full name
- Phone number
- "Edit Profile" link

**Delivery Addresses Section:**
- List of linked addresses (from customer records)
- Each shows: Name + Address + Township
- Star icon on default address
- "Add New Address" button
- Swipe to edit/delete

**Payment Methods:**
- Saved payment methods
- "Add Payment Method" button
- Set default

**Preferences:**
- Default gas size
- Default delivery type
- Language: Myanmar / English toggle
- Notification preferences (on/off for order updates, promotions)

**Account Actions:**
- "📞 Call 8484" — always accessible
- "❓ Help & FAQ"
- "📜 Terms & Conditions"
- "🔒 Privacy Policy"
- "🚪 Log Out"

---

## Navigation Architecture

### Bottom Navigation Bar (3 tabs — keep it simple)

| Tab | Icon | Label | Screen |
|-----|------|-------|--------|
| Home | 🏠 | Home | Home Screen |
| Orders | 📋 | Orders | Order History |
| Profile | 👤 | Profile | Profile + Settings |

**Why 3 tabs, not 4-5:**
- Gas ordering is a focused, repeat-use action
- Fewer tabs = less cognitive load = faster muscle memory
- Grab started with 3 tabs, expanded later
- "Shop Accessories" lives inside Home as a card, not a tab

**Tab Behavior:**
- Home always resets to top on tap (like Instagram)
- Orders remembers scroll position
- Active order overrides Home tab with tracking view
- Badge on Orders tab when active order exists

---

## Super App UX Patterns — Deep Integration

### Pattern 1: Predictive Reorder Engine

**Concept:** The app learns when you need gas and reminds you before you run out.

**How it works:**
- Track days between orders for each customer
- After 3+ orders, calculate average refill interval
- Push notification at 80% of interval: "Running low on gas? Your usual 7kg refill is just one tap away"
- Deep link in notification → pre-filled Order Confirmation

**Database requirement:** Query `orders` table for customer's order history, calculate interval.

### Pattern 2: Social Proof & Trust Layer

**Concept:** Every touchpoint reinforces trust — the #1 reason customers choose 8484.

**Implementation:**
- Agent ratings visible before and during delivery
- "234 deliveries" count shown (experience indicator)
- "Verified Agent" badge on all AnyGas agents
- After delivery: "Join 12,000+ customers who trust 8484"
- Safety tips rotate on home screen (builds brand = safety association)

### Pattern 3: Frictionless Address Management

**Concept:** Addresses should feel like contacts in your phone — saved, labeled, one-tap selectable.

**Implementation:**
- Auto-detect location on first open (GPS permission request)
- Save addresses with labels: "Home", "Office", "Mom's House"
- Building managers: switch between units without re-entering
- Map pin fine-tuning: drag pin to exact delivery spot
- "Landmark" field: "Blue gate, 3rd floor" — sent to agent

### Pattern 4: Payment Intelligence

**Concept:** Payment should never be a reason to abandon an order.

**Implementation:**
- Cash on Delivery as default (Myanmar preference — trust-building)
- Save preferred digital payment method
- Show KBZ Pay / Wave Money logos prominently (familiarity)
- Future: In-app QR payment scanning
- Future: Auto-charge for recurring/scheduled orders

### Pattern 5: Progressive Disclosure

**Concept:** Show complexity only when needed. First-time users see the simplest flow; power users unlock advanced features.

**Level 1 (New User):**
- Big order button, one address, one gas size
- Cash on delivery only
- Basic tracking

**Level 2 (After 3 orders):**
- Smart defaults appear
- "Order Again" becomes prominent
- Payment method remembered
- Rating history visible

**Level 3 (After 10 orders — Power User):**
- Refill reminder notifications
- Multiple saved addresses
- Quick-switch between addresses
- Order scheduling (future)
- Referral program access

### Pattern 6: Myanmar-First Localization

**Concept:** This is not a translated app. It's a Myanmar app with English support.

**Implementation:**
- Myanmar script as PRIMARY language
- All button labels, status messages, error messages in Myanmar
- English available via toggle (for expat users)
- Number formatting: use comma separators for MMK (36,400 not 36400)
- Phone number display: 09-xxx-xxx-xxx format
- Township names in both Myanmar and English
- Time display: 12-hour with AM/PM (Myanmar preference)
- Date display: Day Month Year format
- Text expansion consideration: Myanmar text is ~30% longer than English in many UI strings

### Pattern 7: Offline Resilience

**Concept:** Myanmar internet is unreliable. The app must handle connectivity gracefully.

**Implementation:**
- Cache home screen data (last order, addresses, prices)
- "No internet" banner (not a full-screen blocker)
- Queue order placement during brief outages, submit when reconnected
- Cached gas prices with "last updated" timestamp
- Offline state shows: "📞 Call 8484 to order now" (fallback)
- Optimistic UI: show "Order Placed" immediately, sync in background

### Pattern 8: Emotional Design & Micro-Interactions

**Concept:** The app should feel alive, not static. Small delights build habit.

**Implementation:**
- Gentle bounce animation on "ORDER GAS NOW" button
- Confetti on successful delivery
- Pulse animation on active order status
- Haptic feedback on button taps (mobile)
- Smooth transitions between screens (no harsh cuts)
- Loading skeletons instead of spinners
- Pull-to-refresh on order list
- Subtle sound on order confirmation (optional, respects device mute)

---

## Brand Colors & Design System

```typescript
const colors = {
  // Primary
  primary: '#00A8E8',        // AnyGas Blue (headers, links)
  primaryDark: '#0077B6',    // Darker blue (pressed states)
  
  // Action
  action: '#16A34A',         // Green (CTA buttons, success)
  actionDark: '#15803D',     // Darker green (pressed states)
  actionLight: '#DCFCE7',    // Light green (backgrounds, highlights)
  
  // Accent
  accent: '#FF6B35',         // Orange (promotions, badges)
  
  // Status
  success: '#16A34A',
  warning: '#EAB308',
  error: '#DC2626',
  info: '#3B82F6',
  
  // Neutral
  background: '#F8FAFC',     // App background
  surface: '#FFFFFF',        // Card surfaces
  textPrimary: '#1E293B',   // Main text
  textSecondary: '#64748B', // Secondary text
  border: '#E2E8F0',        // Borders and dividers
  
  // Special
  mapOverlay: 'rgba(0, 0, 0, 0.6)', // Map UI overlay
};

const typography = {
  // Myanmar script requires slightly larger sizes for readability
  heroButton: '24px / bold',
  heading: '20px / semibold',
  body: '16px / regular',       // Minimum for mobile readability
  bodyMm: '17px / regular',     // Myanmar script slightly larger
  caption: '14px / regular',
  price: '20px / bold',         // Prices always prominent
  
  // Font stack: Padauk for Myanmar, system fonts for English
  fontFamily: "'Padauk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};
```

### Design Principles

1. **Green = Action** — Every CTA button is green (#16A34A). Users learn: green means "do this."
2. **White Cards on Gray** — Content lives in white cards on #F8FAFC background. Clean separation.
3. **Generous Touch Targets** — Minimum 48x48px for all interactive elements (above Apple's 44px minimum).
4. **Price Is Always Visible** — Total price shown on every screen where ordering is possible.
5. **No Scroll Required for Core Action** — Hero button + order summary visible without scrolling on standard screen sizes.

---

## Mobile-First Design Guidelines

### Touch & Gesture
- Minimum touch target: 48x48px
- Button padding: py-4 px-6 minimum
- Swipe gestures: left-to-right for back, pull-down to refresh
- Bottom sheet modals for all secondary actions (not centered popups)
- No hover states — design for tap only

### Typography (Myanmar-Specific)
- Body text: 16px minimum (17px for Myanmar script)
- Myanmar font: Padauk (most reliable cross-device rendering)
- Line height: 1.6 for Myanmar text (complex script needs more vertical space)
- Never truncate Myanmar text with ellipsis mid-character

### Performance
- First contentful paint: under 2 seconds on 3G
- Time to interactive: under 4 seconds
- Image compression: all assets under 100KB
- Lazy load below-fold content
- Skeleton screens during data fetch
- Cache pricing data with 5-minute stale time

### Safe Areas
- Top: account for notch/dynamic island
- Bottom: account for home indicator + bottom nav bar
- Side: 16px minimum horizontal padding

---

## Database Integration — What This App Reads & Writes

### Tables This App READS (via RLS policies)

| Table | What Customer Sees | RLS Scope |
|-------|-------------------|-----------|
| customers | Own record(s) | auth_user_id = auth.uid() |
| orders | Own orders | customer_id IN (own customer IDs) |
| payments | Own payment records | via order_id → customer scope |
| brands | All active brands | Public read |
| townships | All townships | Public read |
| cylinder_types | All sizes + prices | Public read |
| current_gas_prices | Current pricing | Public read |
| suppliers | Assigned agent profile (name, photo, rating) | Via order.supplier_id |
| delivery_proofs | Own delivery photos | Via order scope |

### Tables This App WRITES (via RLS policies or Edge Functions)

| Table | What Customer Creates | Method |
|-------|----------------------|--------|
| orders | New order placement | Edge Function (service role) |
| order_ratings | Post-delivery ratings | Direct INSERT (customer RLS) |
| customer_preferences | Saved defaults | Direct INSERT/UPDATE |
| customer_addresses | Saved delivery addresses | Direct INSERT/UPDATE |

### New Customer-Specific Tables (to be created via Grand Plan)

#### customer_addresses
```
id UUID PK
customer_id UUID FK → customers.id
auth_user_id UUID FK → auth.users.id
label TEXT ('home', 'office', 'custom')
address TEXT NOT NULL
township_id UUID FK → townships.id
gps_lat NUMERIC
gps_lng NUMERIC
landmark TEXT
is_default BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

#### order_ratings
```
id UUID PK
order_id UUID FK → orders.id UNIQUE
customer_id UUID FK → customers.id
supplier_id UUID FK → suppliers.id
rating INTEGER (1-5) NOT NULL
tags TEXT[] (fast_delivery, friendly, safe_handling, on_time)
comment TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
```

#### customer_preferences
```
id UUID PK
auth_user_id UUID FK → auth.users.id UNIQUE
default_customer_id UUID FK → customers.id
default_cylinder_size TEXT
default_delivery_type TEXT
default_payment_method TEXT
language TEXT DEFAULT 'my' ('my', 'en')
notifications_enabled BOOLEAN DEFAULT true
promo_notifications BOOLEAN DEFAULT true
refill_reminder_enabled BOOLEAN DEFAULT false
refill_reminder_days INTEGER
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

#### refill_reminders (future)
```
id UUID PK
auth_user_id UUID FK → auth.users.id
customer_id UUID FK → customers.id
reminder_date DATE NOT NULL
status TEXT ('pending', 'sent', 'ordered', 'dismissed')
created_at TIMESTAMPTZ DEFAULT NOW()
```

---

## Order Placement Architecture

### Why Edge Function, Not Direct INSERT

Customer app should NOT directly INSERT into the `orders` table because:
1. Order creation requires pricing validation (prevent client-side price manipulation)
2. Order creation triggers agent assignment logic (CRM workflow)
3. Order creation must verify township coverage (not all townships have agents)
4. Pricing must be snapshot-at-creation (not client-provided)

### Recommended: `create-customer-order` Edge Function

```
Client sends:
{
  customer_id: UUID,
  cylinder_type_id: UUID,
  quantity: INTEGER,
  delivery_type: 'refill' | 'new_setup',
  delivery_address_id: UUID (or inline address),
  payment_method: 'cash' | 'kbz_pay' | 'wave' | 'cb_pay',
  special_instructions: TEXT (optional)
}

Edge Function does:
1. Verify auth (customer owns this customer_id)
2. Lookup current price from gas_prices
3. Calculate total (price × quantity + delivery fee)
4. INSERT into orders (with snapshot pricing)
5. INSERT into order_items (if applicable)
6. Trigger agent assignment (or queue for CRM)
7. Return order confirmation with ETA estimate
```

---

## Real-Time Features

### Supabase Realtime Subscriptions

**Order Status Updates:**
```javascript
// Subscribe to changes on customer's active orders
supabase
  .channel('my-orders')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `customer_id=eq.${customerId}`
  }, (payload) => {
    // Update UI: status change, agent assignment, etc.
  })
  .subscribe();
```

**Agent Location Updates (for live tracking):**
- Agent app broadcasts GPS every 15 seconds to `agent_locations` table
- Customer app subscribes to updates for their active order's agent
- Map pin moves in real-time

---

## Push Notification Strategy

| Trigger | Message | Priority |
|---------|---------|----------|
| Order confirmed | "Your gas order is confirmed! Agent arriving in ~[X] min" | High |
| Agent assigned | "Ko [Name] is preparing your delivery" | High |
| Agent on the way | "Your gas is on the way! 🚚 Arriving in [X] min" | High |
| Delivered | "Gas delivered! ✓ Rate your experience" | High |
| Order cancelled | "Your order has been cancelled. [reason]" | High |
| Refill reminder | "Time for a gas refill? Your usual [size]kg is one tap away 🔥" | Medium |
| Promotion | "[Brand] special: save [X] Ks this week!" | Low |
| Price change | "Good news! [Size]kg gas price dropped to [price] Ks" | Low |

---

## Error Messages (Myanmar + English)

| Scenario | Myanmar | English |
|----------|---------|---------|
| No internet | အင်တာနက် ချိတ်ဆက်မှု မရှိပါ | No internet connection |
| OTP expired | ကုဒ် သက်တမ်းကုန်သွားပါပြီ | Code expired. Request a new code |
| OTP invalid | ကုဒ် မှားနေပါသည် | Invalid code. Please check and try again |
| No agents available | ယခုအချိန် ဝန်ဆောင်မှုပေးနိုင်သည့် ကိုယ်စားလှယ် မရှိပါ | No agents available right now. Try again shortly |
| Order failed | မှာယူမှု မအောင်မြင်ပါ | Order could not be placed. Please try again |
| GPS unavailable | GPS ဖွင့်ပေးပါ | Please enable GPS in settings |
| Phone not registered | ဤဖုန်းနံပါတ်ဖြင့် အကောင့်မရှိပါ | No account found for this number |
| Network error | ချိတ်ဆက်မှု ပြဿနာရှိနေပါသည် | Connection error. Please try again |
| Fallback | 8484 ကိုဖုန်းဆက်၍ မှာယူနိုင်ပါသည် | Call 8484 to order by phone |

---

## Security Checklist

- [ ] Phone OTP verified before any data access
- [ ] RLS policies restrict to customer's own data only
- [ ] No customer can see other customers' data
- [ ] Agent personal details (phone, address) NOT exposed to customer (only name, photo, rating)
- [ ] Prices are server-validated (not client-submitted)
- [ ] Order creation goes through Edge Function (service role)
- [ ] GPS data only captured with explicit consent
- [ ] Session timeout after 30 days of inactivity
- [ ] No sensitive data in local storage (use secure storage for auth tokens)
- [ ] Rate limiting on order placement (max 5 orders per hour)
- [ ] HTTPS only for all API calls

---

## Testing Checklist

### Authentication
- [ ] Login with valid customer phone → success
- [ ] Login with non-customer phone → new account creation flow
- [ ] Login with multi-record phone → profile selector appears
- [ ] OTP expiry handling (60 seconds)
- [ ] Logout clears all local data
- [ ] Session persistence across app restarts

### Ordering
- [ ] Smart defaults show last order details
- [ ] Price matches `current_gas_prices` table
- [ ] Order confirmation shows correct total
- [ ] Delivery type correctly maps to order_type
- [ ] Multi-cylinder orders calculate correctly
- [ ] Payment method saves and pre-selects
- [ ] Special instructions pass through to order
- [ ] Cannot place order if no agents in township

### Tracking
- [ ] Status timeline updates in real-time
- [ ] Agent card appears on assignment
- [ ] Map shows agent location during delivery
- [ ] ETA updates as agent moves
- [ ] Call button dials agent phone
- [ ] Cancel works before "On the Way"
- [ ] Cancel disabled after "On the Way"

### Post-Delivery
- [ ] Rating submission works (1-5 stars)
- [ ] Tags save correctly
- [ ] Reorder from delivered order works
- [ ] Refill reminder scheduling works

### Data Isolation
- [ ] Customer cannot see other customers' orders
- [ ] Customer cannot see other customers' data
- [ ] Agent phone number NOT visible to customer
- [ ] Agent sees only orders assigned to them (unchanged)
- [ ] CRM staff access unchanged

### Offline
- [ ] App loads with cached data when offline
- [ ] "No internet" banner shows (not full-screen block)
- [ ] "Call 8484" always accessible offline
- [ ] Reconnection syncs pending actions

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. Lovable project setup with React + TypeScript + Vite
2. Connect Supabase project (shared backend)
3. Implement Phone OTP authentication
4. Build profile linking flow (single match + multi-match)
5. Create customer-specific tables (Grand Plan required first)
6. Implement customer RLS policies

### Phase 2: Core Ordering (Week 3-4)
1. Home screen with hero button
2. Order configuration screen
3. Order confirmation + placement (Edge Function)
4. Smart defaults from order history
5. Order history screen
6. Basic order status view (polling, not real-time yet)

### Phase 3: Live Tracking (Week 5-6)
1. Supabase Realtime subscriptions for order status
2. Agent profile display on assignment
3. Live map with agent location
4. ETA calculation and display
5. Call agent functionality
6. Cancel order flow

### Phase 4: Polish & Delight (Week 7-8)
1. Post-delivery rating flow
2. Myanmar localization (full pass)
3. Offline handling
4. Animations and micro-interactions
5. Push notifications (requires Capacitor)
6. Profile and address management

### Phase 5: Capacitor Wrap + Store (Week 9-10)
1. Capacitor integration
2. iOS build + App Store submission
3. Android build + Play Store submission
4. Deep link configuration
5. Push notification infrastructure (FCM)

### Phase 6: Enhancement (Future)
1. Refill reminder engine
2. Scheduled/recurring orders
3. In-app chat with agent
4. Referral program
5. Accessories shopping
6. Multi-language support
7. In-app payment (KBZ Pay SDK)

---

## Integration with CRM and Agent App

### What CRM Creates (Customer App Reads)
- Customer records (existing 12,000+)
- Orders (status updates as CRM processes)
- Agent assignment to orders
- Brand catalog + pricing
- Township data

### What Customer App Creates (CRM Can Read)
- New customer records (via profile creation)
- Orders (via Edge Function → enters CRM workflow)
- Order ratings (visible in CRM dashboard)
- Customer addresses (visible in CRM customer profile)

### What Agent App Creates (Customer App Reads)
- Order status updates (confirmed → dispatched → delivered)
- Delivery proofs (photos + GPS)
- Agent location updates (for live tracking)

### Cross-App Real-Time Flow
```
Customer places order
    → CRM assigns agent
        → Agent accepts (status: confirmed)
            → Customer sees "Agent Assigned" + profile
                → Agent departs (status: dispatched)
                    → Customer sees live tracking
                        → Agent delivers (status: delivered, proof uploaded)
                            → Customer sees "Delivered" + rating prompt
```

---

## Capacitor Configuration (For App Store Distribution)

### Why Capacitor
- Wraps the React web app into native iOS/Android containers
- Same codebase — Lovable iterates on web, Capacitor builds native
- Access to native APIs: push notifications, GPS background, camera, biometrics
- App Store and Play Store listing = discoverability + trust

### Key Plugins
- `@capacitor/push-notifications` — FCM for Android, APNs for iOS
- `@capacitor/geolocation` — GPS access with background mode
- `@capacitor/haptics` — Haptic feedback on interactions
- `@capacitor/splash-screen` — Branded loading screen
- `@capacitor/status-bar` — Style native status bar
- `@capacitor/app` — Deep links, app state management
- `@capacitor/keyboard` — Keyboard behavior management

### App Store Requirements
- App icon: 1024x1024px (iOS), 512x512px (Android)
- Screenshots: 5+ per device size
- Privacy policy URL (required for both stores)
- Terms of service URL
- App description in Myanmar + English

---

## What This Document Does NOT Cover

The following are explicitly out of scope for the Customer App team:

1. **CRM backend logic** — Agent assignment, pricing management, customer import
2. **Agent App changes** — Agent-side GPS broadcasting, delivery proof flow
3. **Database schema changes** — All handled via TRIO Grand Plan process
4. **Payment gateway integration** — KBZ Pay/Wave API integration is future phase
5. **SMS gateway** — Notification delivery via SMS is a separate infrastructure project

---

## Document References

- **AnyGas_TRIO_EXECUTION_RULE_v1_0.md** — Mandatory execution framework
- **AnyGas_Platform_Technical_Report_v1_1.md** — Current system architecture
- **CRM_WEB_APP_INSTRUCTIONS.md** — CRM technical specification
- **AGENT_MOBILE_APP_INSTRUCTIONS_v1_1.md** — Agent App specification
- **SOP_Order_Creation_Management_v1_0.docx** — Order workflow procedures
- **Padesar_vs_8484_Competitive_Analysis_v2.docx** — Competitive positioning
