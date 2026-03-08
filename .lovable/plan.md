

# Kitchen Warmth Theme — Complete Deployment Brief v2

## Assets Provided

| File | Purpose | Destination |
|------|---------|-------------|
| `user-uploads://Untitled_design.png` | AnyGas cat mascot — used on Welcome screen and Hero CTA | `src/assets/mascot.png` |
| `user-uploads://2.jpg` | App icon — used as favicon and PWA icon | `public/app-icon.jpg` |
| `user-uploads://13.png` | Alternate logo (phone circle) — available for future use | `src/assets/logo-alt.png` |

## Branding Files (8 changes)

| # | File | Change |
|---|------|--------|
| B1 | `public/favicon.ico` | Replace with `2.jpg` converted to favicon reference |
| B2 | `index.html` | Update `<title>` to "AnyGas 8484", update `<meta description>` to "Order LPG gas delivery in Myanmar — AnyGas 8484", update all `og:title`/`twitter:title` to "AnyGas 8484", update `og:description`/`twitter:description`, add favicon link to `2.jpg` |
| B3 | `index.html` | Add Google Fonts link for DM Sans + Outfit |
| B4-B8 | Future PWA | `manifest.json`, `logo192.png`, `logo512.png`, `apple-touch-icon.png` — not yet created, note for future PWA setup |

## Reference Prototype

The HTML mockup provided in the user's message serves as the pixel-accurate visual target. All color values, spacing, typography weights, border radii, and component patterns should match that prototype.

## Implementation — 6 Phases, 14+ Files

### Phase 1: CSS Foundation (3 files)

**`src/index.css`**
- Add Google Fonts import: `DM Sans:wght@400;500;600;700;800;900` + `Outfit:wght@400;500;600;700;800;900`
- Update CSS variables:
  - `--background: 33 80% 97%` (#FEF8F0)
  - `--foreground: 22 76% 8%` (#1F1206)
  - `--muted-foreground: 30 16% 44%` (#8D7355)
  - `--border: 30 30% 88%` (#F0E4D4)
  - `--primary: 27 85% 49%` (#E07A12)
  - `--primary-dark: 27 88% 40%` (#C46A0A)
  - `--action: 27 85% 49%` (same as primary)
  - `--action-light: 33 100% 94%` (#FFF3E0)
- Add new variables: `--surface-warm`, `--bg-warm`, `--border-strong`, `--divider`
- Update body font to `'DM Sans', 'Padauk', sans-serif`
- Add utility classes: `.font-display` (Outfit), gradient utilities, shadow utilities, stagger animation keyframes, pulse-border animation

**`tailwind.config.ts`**
- Add color tokens: `surface-warm`, `bg-warm`, `border-strong`, `divider`
- Add `fontFamily`: `display: ['Outfit', ...]`, `body: ['DM Sans', ...]`
- Add shadow presets: `hero`, `action`
- Add `pulse-border` and `fade-in` keyframe/animation

**`src/components/ui/button.tsx`**
- Update `action` variant: add gradient background via Tailwind (`bg-gradient-to-r from-[#E07A12] to-[#F5A623]`), `shadow-[0_6px_20px_rgba(224,122,18,0.25)]`, `min-h-[52px]`, `font-extrabold`
- Update `hero` variant: same gradient, larger shadow, remove `animate-pulse-gentle`

### Phase 2: Welcome + Auth (3 files)

**`src/pages/Welcome.tsx`**
- Background: warm gradient `from-[#FFF9F0] to-[#FEF0DC]`
- Replace Flame icon with mascot image (`import mascot from "@/assets/mascot.png"`) — display as 110px rounded image
- Brand name uses `font-display` (Outfit), "8484" in primary color
- Add tagline: "Fast & reliable LPG delivery" + Myanmar text
- Add badge: "🍳 Keep your kitchen cooking!"
- Decorative low-opacity flame emojis at corners
- Button uses gradient action style

**`src/pages/PhoneEntry.tsx`**
- Add `font-display` to heading
- Split input into country code box (`+95`, 80px, warm bg) + phone input
- Add hint card below input: `💡 We'll send a 6-digit OTP code via SMS` with `bg-warm` background
- Warmer border colors

**`src/pages/OtpVerify.tsx`**
- OTP boxes: 50x60px, `font-display` for digits, rounded-[14px]
- Focus state: warm glow ring `shadow-[0_0_0_3px_rgba(224,122,18,0.15)]`, warm bg
- Filled state: primary border + warm bg
- Timer uses `font-display` for countdown number

### Phase 3: Home Page (1 file, largest change)

**`src/pages/HomePage.tsx`**
- **Replace orange header** with greeting layout: "Good morning 👋" / customer name in `font-display`, notification bell button (top right) with red dot
- **Delivery address bar**: Pin icon in warm bg square + address + chevron arrow
- **Active order banner**: Add pulse-border animation, icon in action-colored square, arrow
- **Hero CTA card**: Replace flat button with gradient hero card — diagonal stripe pattern overlay, "Order Gas Now" heading, "Keep your kitchen cooking!" subtext, frosted glass "Order Now →" pill button, mascot image or decorative emoji at top-right
- **Quick Actions**: 2x2 grid cards (Order Again, My Orders, Accessories, Call 8484) — each with emoji icon in warm bg square, title, description. Hover: primary border + shadow-md + translateY(-1px)
- **Promo card**: Gold gradient background
- **Tips section**: Cards with emoji icons

### Phase 4: Order Flow (3 files)

**`src/pages/OrderConfigure.tsx`**
- Back button: bordered rounded square (not bare icon)
- **Order type**: Segmented control tabs with warm bg container, active tab white bg + shadow
- **Brand selector**: Horizontal scroll chips with `rounded-full`, active = primary glow bg + primary border
- **Size cards**: Selected card gets checkmark badge (absolute positioned), `font-display` for weight number, price in primary color
- **Quantity stepper**: Row layout with bordered square buttons, `font-display` for value
- **Sticky footer**: Total in `font-display`, divider line uses `--divider`

**`src/pages/OrderConfirm.tsx`**
- Section titles with `font-display`
- Total value in `font-display` + primary color
- Dividers use `--divider` color
- Payment method cards: warmer borders

**`src/pages/OrderSuccess.tsx`**
- Green check circle: larger (80px), green tint bg (#E8F5E9)
- Heading in `font-display`
- Order number in `font-display`

### Phase 5: Orders History + Profile + Tracking (3 files)

**`src/pages/OrdersPage.tsx`**
- Tab pills: primary bg when active (matching prototype)
- Cards: Add order ID badge at top, cylinder emoji icon in warm bg square, price in `font-display` + primary color
- Card hover: shadow-md transition

**`src/pages/ProfilePage.tsx`**
- Centered layout: avatar with gradient-hero bg, `rounded-[24px]`
- Name in `font-display`
- Member badge pill: "🔥 Member since 2024" in primary-glow bg
- Section titles: uppercase, muted, letter-spacing
- Menu items: emoji in warm bg square, description text, chevron
- Callout card: "Need help? Call 8484"
- Logout button: bordered with destructive color

**`src/pages/OrderTracking.tsx`**
- Header: gradient hero bg instead of flat primary
- Status timeline: warm styling matching prototype
- Driver card: gradient avatar bg, rounded-[16px]
- Map area: rounded-[20px]

### Phase 6: Navigation + CallFallback (2 files)

**`src/components/BottomNav.tsx`**
- Replace underline indicator with small dot (4px circle) below label
- Active text stays primary color

**`src/components/CallFallback.tsx`**
- Use warm orange shadow: `shadow-[0_6px_20px_rgba(224,122,18,0.3)]`

### Phase 7: Branding Assets

- Copy `user-uploads://Untitled_design.png` → `src/assets/mascot.png`
- Copy `user-uploads://2.jpg` → `public/app-icon.jpg`
- Copy `user-uploads://13.png` → `src/assets/logo-alt.png`
- Update `index.html`: title, meta, favicon

## Visual QA Checklist (15 checkpoints)

| # | Screen | Checkpoint |
|---|--------|------------|
| 1 | Welcome | Mascot image visible, gradient background, Outfit font on brand name, "8484" in orange |
| 2 | Welcome | "Continue with Phone" button has gradient (not flat) with warm shadow |
| 3 | Phone Entry | Country code (+95) in separate warm-bg box, hint card visible below input |
| 4 | OTP | 6 boxes with warm focus glow, filled boxes show primary border |
| 5 | Home | Greeting header with customer name (no orange header bar), notification bell visible |
| 6 | Home | Hero CTA card has gradient background with pattern overlay, not a flat button |
| 7 | Home | Active order banner has pulsing border animation |
| 8 | Home | 2x2 quick actions grid with emoji icons in warm bg squares |
| 9 | Order Configure | Segmented tabs (not bare buttons), size cards show checkmark when selected |
| 10 | Order Confirm | Total amount in Outfit font + primary color |
| 11 | Order Success | Large green check circle (80px) with green tint bg |
| 12 | Order Tracking | Gradient hero header, driver avatar with gradient bg fallback |
| 13 | Orders List | Tab pills with primary active bg, order cards with emoji icons |
| 14 | Profile | Centered avatar with gradient bg, member badge pill, grouped menu items |
| 15 | Bottom Nav | Dot indicator (not underline) below active tab icon |

## Summary

- **14 code files** modified
- **3 asset files** copied into project
- **1 HTML file** (index.html) updated for branding
- **0 database changes**
- **0 new npm dependencies** (fonts via Google Fonts CDN)

