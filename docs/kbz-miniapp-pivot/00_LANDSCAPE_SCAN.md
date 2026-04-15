# KBZ Mini App Pivot — Landscape Scan

**Date:** 2026-04-15 · **Author:** Lovable AI · **Status:** Investigation only — no code changes

---

## 1. EXECUTIVE SUMMARY

- **Pivot size: MEDIUM.** The app already has KBZ auto-login (`src/hooks/useKbzAutoLogin.ts`), JSSDK bridge (`src/lib/kbzpay-bridge.ts`), payment flow, and environment detection (`src/utils/kbzpay.ts`). The work is removing the public-web auth path and stripping non-mini-app assumptions.
- **Biggest risk:** Supabase Realtime websockets and `localStorage` persistence are unverified inside the KBZ Pay webview — both are load-bearing for order tracking and session management.
- **Dual `isInKbzPay()` implementations** exist (`src/lib/kbzpay-bridge.ts:11-26` AND `src/utils/kbzpay.ts:1-12`) — nearly identical logic, creating a maintenance hazard.
- **`tel:8484` links in 5 locations** will silently fail or behave unpredictably inside the KBZ Pay webview sandbox.
- **DB enum `kbz_pay` vs `kbzpay`** — both exist in the `payment_method` enum (`src/integrations/supabase/types.ts:4462`). The mini app uses `kbzpay`; `kbz_pay` is legacy CRM.

---

## 2. ROUTING & ENTRY POINTS

**Router mode:** `HashRouter` — `src/App.tsx:5,101`

| Route | File | Guard |
|---|---|---|
| `/` | `src/pages/Welcome.tsx` | `PublicOnlyRoute` (L65) |
| `/onboarding/phone` | `src/pages/PhoneEntry.tsx` | `PublicOnlyRoute` (L66) |
| `/onboarding/otp` | `src/pages/OtpVerify.tsx` | None (L68) |
| `/onboarding/link-welcome` | `src/pages/LinkWelcomeBack.tsx` | `AuthOnlyRoute` (L71) |
| `/onboarding/link-select` | `src/pages/LinkSelectAddress.tsx` | `AuthOnlyRoute` (L72) |
| `/onboarding/link-new` | `src/pages/LinkNewCustomer.tsx` | `AuthOnlyRoute` (L73) |
| `/onboarding/kbz-profile` | `src/pages/KbzProfileComplete.tsx` | `AuthOnlyRoute` (L74) |
| `/home` | `src/pages/HomePage.tsx` | `ProtectedRoute` (L77) |
| `/order/configure` | `src/pages/OrderConfigure.tsx` | `ProtectedRoute` (L78) |
| `/order/confirm` | `src/pages/OrderConfirm.tsx` | `ProtectedRoute` (L79) |
| `/order/success` | `src/pages/OrderSuccess.tsx` | `ProtectedRoute` (L80) |
| `/order/tracking/:orderId` | `src/pages/OrderTracking.tsx` | `ProtectedRoute` (L81) |
| `/orders` | `src/pages/OrdersPage.tsx` | `ProtectedRoute` (L82) |
| `/alerts` | `src/pages/AlertsPage.tsx` | `ProtectedRoute` (L83) |
| `/profile` | `src/pages/ProfilePage.tsx` | `ProtectedRoute` (L84) |
| `/profile/addresses` | `src/pages/ProfileAddresses.tsx` | `ProtectedRoute` (L85) |
| `/profile/faq` | `src/pages/ProfileFAQ.tsx` | `ProtectedRoute` (L86) |
| `/profile/terms` | `src/pages/ProfileTerms.tsx` | `ProtectedRoute` (L87) |
| `/profile/privacy` | `src/pages/ProfilePrivacy.tsx` | `ProtectedRoute` (L88) |
| `*` | `src/pages/NotFound.tsx` | None (L89) |

**Route guards:** `ProtectedRoute` (L35-43), `AuthOnlyRoute` (L46-51), `PublicOnlyRoute` (L54-59)

**Redirects:** `PublicOnlyRoute` → `/home` if logged in (L57). `ProtectedRoute` → `/` if no user (L40), → `/onboarding/link-new` if no customer (L41).

---

## 3. AUTH & SESSION

**Path 1 — Phone OTP (public web):**
1. `src/pages/PhoneEntry.tsx:38` — `supabase.auth.signInWithOtp({ phone })`
2. `src/pages/OtpVerify.tsx:32` — `supabase.auth.verifyOtp({ phone, token, type: "sms" })`
3. Post-verify customer lookup/linking: `OtpVerify.tsx:47-71`

**Path 2 — KBZ auto-login (mini app):**
1. `src/hooks/useKbzAutoLogin.ts:48` — `isInKbzPay()` check
2. `src/hooks/useKbzAutoLogin.ts:56` — `getAuthCode()` via JSSDK
3. `src/hooks/useKbzAutoLogin.ts:58` — calls `kbzpay-auto-login` edge function
4. `src/hooks/useKbzAutoLogin.ts:66-69` — `supabase.auth.setSession()` with returned tokens
5. Candidate selection: `src/hooks/useKbzAutoLogin.ts:85-120` → calls `kbzpay-link-customer` edge function

**Session storage:** `localStorage` via Supabase client — `src/integrations/supabase/client.ts:13`

**Token refresh:** Supabase SDK `autoRefreshToken: true` — `src/integrations/supabase/client.ts:15`

**Auth state listener:** `src/contexts/AuthContext.tsx:24-28` — `onAuthStateChange`

---

## 4. EDGE FUNCTIONS INVENTORY

| Function | Role | Caller |
|---|---|---|
| `kbzpay-auto-login` | Exchanges KBZ authCode for Supabase session; returns candidates | Customer app (mini app path) |
| `kbzpay-link-customer` | Links selected candidate to auth user; returns session | Customer app (mini app path) |
| `kbzpay-create-payment` | Creates KBZ Pay MINIAPP precreate order, returns `prepay_id` | Customer app (order confirm) |
| `kbzpay-webhook` | Receives KBZ Pay payment callbacks, updates order status | KBZ Pay server (webhook) |
| `create-customer-order` | Creates order + order items in DB | Customer app (order confirm) |

**Note:** `OtpVerify.tsx:59` calls `link-customer-account` edge function — but no corresponding file exists in `supabase/functions/`. This may be deployed separately or is a dead code path.

---

## 5. DB TABLES AND KEY ENUMS

**Customer flow tables:** `customers`, `customer_addresses`, `customer_phones`, `customer_preferences`, `orders`, `order_items`, `payments`, `order_ratings`, `refill_reminders`

**Enum: `payment_method`** (`src/integrations/supabase/types.ts:4462,4615`):
`kbz_pay` | `wave` | `cb_pay` | `cash` | `kbzpay`

- `kbzpay` — used by mini app payment flow
- `kbz_pay` — legacy CRM value (0 orders currently use it in customer app code, but present in DB enum)

**Enum: `order_status`** (types.ts:4453-4460):
`new` | `confirmed` | `in_progress` | `dispatched` | `delivered` | `completed` | `cancelled` | `failed`

**Enum: `order_type`** (types.ts:4461):
`refill` | `new_setup` | `exchange` | `service_call`

**`order_source`** — text field, not enum. Values: `kbzpay_miniapp` (`src/utils/kbzpay.ts:15`), `customer_app` (`src/utils/kbzpay.ts:15`)

---

## 6. THIRD-PARTY INTEGRATIONS

**KBZ JSSDK:** `public/js-sdk.min.js` loaded in `index.html:11`. Bridge at `src/lib/kbzpay-bridge.ts`. APIs used: `getAuthCode` (L36-48), `callNativeAPI("startPay")` (L66-78).

**Leaflet/OSM:** `src/pages/OrderTracking.tsx:3-4` — `react-leaflet` + `leaflet`. Tile CDN: `https://{s}.tile.openstreetmap.org` (L261). Marker icons from `unpkg.com` (L13-15) and `raw.githubusercontent.com` (L19,25).

**No push notifications, FCM, service worker, or PWA manifest found.**

**No `navigator.share`, `mailto:`, Play Store, or App Store links found.**

**External `tel:` links (5 occurrences):**
1. `src/pages/HomePage.tsx:52` — header "Call 8484" button
2. `src/pages/HomePage.tsx:130` — quick-action card `href: "tel:8484"`
3. `src/pages/ProfilePage.tsx:34` — support item `href: "tel:8484"`
4. `src/pages/ProfilePage.tsx:111` — help callout text "Call **8484**" (not a link, display only)
5. `src/components/CallFallback.tsx:5` — floating FAB `href="tel:8484"`, mounted at `src/App.tsx:92`
6. `src/pages/OrderTracking.tsx:234` — agent contact button `href="tel:8484"`

---

## 7. APP-STORE / PUBLIC-WEB ASSUMPTIONS STILL PRESENT

- **Welcome splash page** with "Continue with Phone" button — `src/pages/Welcome.tsx:44`
- **Phone OTP auth flow** — `src/pages/PhoneEntry.tsx:33-51`, `src/pages/OtpVerify.tsx:25-81`
- **OG/Twitter meta tags** — `index.html:13-22` (irrelevant inside webview)
- **SEO meta description** — `index.html:7`
- **Floating call FAB** — `src/components/CallFallback.tsx:3-10`, always mounted at `src/App.tsx:92`
- **BottomNav** already hides itself in mini app — `src/components/BottomNav.tsx:18` (`isKBZPayMiniApp()` → return null)
- **`PublicOnlyRoute` guard** — `src/App.tsx:54-59` — only serves Welcome + PhoneEntry routes

---

## 8. BUNDLE & BUILD

**Build tool:** Vite 5 — `vite.config.ts`

**Code splitting:** React lazy loading not used. All pages eagerly imported in `src/App.tsx:11-30`.

**Production bundle size:** Not measured (would need `vite build` run). Leaflet is the largest dependency.

**Notable:** Leaflet CSS imported at runtime in `OrderTracking.tsx:5` — only needed on one page but bundled for all.

---

## 9. REALTIME / WEBSOCKETS

**Supabase Realtime channels (2):**
1. `src/pages/OrderTracking.tsx:99-103` — channel `agent-loc-{agentId}`, listens for `INSERT` on `agent_locations` table, filtered by `agent_id`
2. `src/pages/OrderTracking.tsx:109-121` — channel `order-st-{orderId}`, listens for `UPDATE` on `orders` table, filtered by `id`

**Polling loops (1):**
- `src/lib/kbzpay-bridge.ts:83-99` — `pollOrderUntilPaid()`: polls `orders.payment_status` every 2 seconds, 120s timeout

**React Query polling (1):**
- `src/pages/HomePage.tsx:33` — `refetchInterval: 30000` (30s) for active order status

---

## 10. WHAT I CAN'T VERIFY

These require on-device testing inside the KBZ Pay Super App:

1. **Supabase Realtime websockets** — Whether long-lived WSS connections work reliably inside the KBZ Pay webview. If blocked, order tracking (`OrderTracking.tsx:99,109`) will silently fail to update.
2. **`localStorage` persistence** — Whether `localStorage` survives across mini app sessions (cold close → reopen). If not, Supabase session (`client.ts:13`) and the `anygas_miniapp` flag (`kbzpay-bridge.ts:17`) will be lost.
3. **Leaflet/OSM tile loading** — Whether `tile.openstreetmap.org`, `unpkg.com`, and `raw.githubusercontent.com` are whitelisted in the KBZ Pay webview. If blocked, the tracking map is blank.
4. **`getAuthCode` callback reliability** — Whether the JSSDK `getAuthCode` (`kbzpay-bridge.ts:36-48`) fires reliably across all KBZ Pay app versions in production.
5. **`window.open` / external navigation** — Whether links or programmatic navigation outside the mini app are silently blocked by the KBZ Pay sandbox.
6. **Content Security Policy restrictions** — Whether the KBZ Pay webview enforces CSP headers that would block Supabase edge function calls (`rtbkhrenswgzhuzltpgd.supabase.co`), the JSSDK (`js-sdk.min.js`), or Leaflet tile CDNs. This is a known failure mode in some super-app webviews.
7. **`navigator.geolocation`** — Whether the webview grants location permission (`OrderTracking.tsx:127`) or silently denies it.

---

## 11. DELETE LIST

| Item | Location | Status |
|---|---|---|
| `Welcome.tsx` | `src/pages/Welcome.tsx` (route at `App.tsx:65`) | ✅ Safe to delete |
| `OtpVerify.tsx` | `src/pages/OtpVerify.tsx` (route at `App.tsx:68`) | ⚠️ Needs cleanup — remove route + `link-customer-account` call (L59) |
| Phone OTP path in `PhoneEntry.tsx` | `src/pages/PhoneEntry.tsx:33-51,132-167` | ⚠️ Needs refactor — file also hosts KBZ auto-login UI; remove manual phone form, keep KBZ flow |
| `CallFallback.tsx` | `src/components/CallFallback.tsx` (mounted at `App.tsx:92`) | ✅ Safe to delete |
| `tel:8484` link (header) | `src/pages/HomePage.tsx:52-54` | ✅ Safe to delete |
| `tel:8484` link (quick action) | `src/pages/HomePage.tsx:130` | ✅ Safe to delete |
| `tel:8484` link (profile support) | `src/pages/ProfilePage.tsx:34` | ✅ Safe to delete |
| `tel:8484` link (tracking agent) | `src/pages/OrderTracking.tsx:234` | ✅ Safe to delete |
| OG/Twitter meta tags | `index.html:13-22` | ✅ Safe to delete |
| SEO meta description | `index.html:7` | ✅ Safe to delete |
| `PublicOnlyRoute` guard | `src/App.tsx:54-59` | ⚠️ Needs cleanup — remove after Welcome + PhoneEntry routes are removed |
| `BottomNav.tsx` | `src/components/BottomNav.tsx` (mounted at `App.tsx:91`) | ⚠️ Already returns null in mini app (L18) — safe to delete if pivot is mini-app-only |
| Duplicate `isInKbzPay()` | `src/lib/kbzpay-bridge.ts:11-26` vs `src/utils/kbzpay.ts:1-12` | ⚠️ Consolidate — two nearly identical implementations |
| `kbz_pay` DB enum value | `payment_method` enum in DB (types.ts:4462) | 🚫 Blocked — CRM may still use it. **Verify:** grep the CRM codebase for `kbz_pay` occurrences; if zero hits, drop the enum value via migration; if any, document the owner before changing. |
| `phone` state in AuthContext | `src/contexts/AuthContext.tsx:20` | ⚠️ Only used for OTP flow — can remove after OTP path is deleted |

---

## 12. SURPRISE / RISK CALLOUTS

1. **Ghost edge function call.** `OtpVerify.tsx:59` invokes `link-customer-account` — but no file exists at `supabase/functions/link-customer-account/`. Either it's deployed outside this repo or it's dead code that would 404. Needs verification before deleting `OtpVerify.tsx`.

2. **Duplicate platform detection.** `isInKbzPay()` in `src/lib/kbzpay-bridge.ts:11` and `isKBZPayMiniApp()` in `src/utils/kbzpay.ts:1` do the same thing with slightly different names. `BottomNav.tsx` uses one, `PhoneEntry.tsx` uses the other. If they ever diverge, behavior will be inconsistent.

3. **Hardcoded Yangon fallback coordinates.** `OrderTracking.tsx:133` falls back to `[16.8661, 96.1951]` (downtown Yangon) if geolocation fails and no customer GPS is stored. This could show a misleading map for non-Yangon customers.

4. **No error boundary.** If the KBZ JSSDK fails to load (`js-sdk.min.js` 404 or CSP block), the auto-login flow throws at `kbzpay-bridge.ts:33` and the user sees the error state fallback to the manual phone form — which we're about to delete. Need a KBZ-specific error screen.

5. **`confirm()` dialog.** `OrderTracking.tsx:143` uses `window.confirm()` for cancel confirmation — this may not render in the KBZ Pay webview, potentially auto-confirming or silently failing.

---

## NOTABLE FINDINGS

- **BottomNav already KBZ-aware** (`BottomNav.tsx:18`) — returns `null` when `isKBZPayMiniApp()` is true. This means KBZ mini app users currently have no persistent navigation. The pivot needs to decide: rely on KBZ Pay's built-in nav, or add a mini-app-specific nav.

- **`AuthContext.phone` is OTP-only.** The `phone` + `setPhone` state in `AuthContext.tsx:10-11,20` is only used by the OTP flow (`PhoneEntry.tsx:14`, `OtpVerify.tsx:11`). In the KBZ path, phone comes from the auto-login edge function. This state can be removed with the OTP path.

- **Order source tracking is ready.** `src/utils/kbzpay.ts:14-16` already returns `kbzpay_miniapp` vs `customer_app` — the pivot just needs to hard-code `kbzpay_miniapp` and remove the branch.
