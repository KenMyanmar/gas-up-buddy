
# Fix: CONFIRM ORDER Button Hidden Behind Bottom Nav

## Problem
`OrderConfigure.tsx` has a sticky footer with `fixed bottom-0`. The `BottomNav` component also uses `fixed bottom-0 z-50`. The BottomNav is visible on `/order/configure` (it only hides for `/` and `/onboarding*`), so they overlap — the nav covers the button.

## Solution
Two options considered:
1. **Hide BottomNav on order flow pages** — cleanest UX; the order flow already has its own back button and is a focused task. Grab/Gojek hide the tab bar during checkout.
2. **Push footer above nav** — adds `bottom-[4.5rem]` to the footer and increases `pb-` on the container.

**Recommendation: Option 1** — Hide BottomNav on all order flow routes (`/order/*`). This is standard for checkout flows and avoids layout hacks. The user already has a back arrow to exit.

## Changes

### `src/components/BottomNav.tsx`
**Line 19**: Extend the hide condition to include order flow routes:
```typescript
if (location.pathname === "/" || location.pathname.startsWith("/onboarding") || location.pathname.startsWith("/order")) {
  return null;
}
```

This hides the nav on `/order/configure`, `/order/confirm`, and `/order/success` — all three screens in the checkout flow.

No other files need changes. The existing `pb-32` on `OrderConfigure` and the `fixed bottom-0` footer already work correctly when the BottomNav isn't competing for space.

| File | Change |
|------|--------|
| `src/components/BottomNav.tsx` | Hide nav on `/order/*` routes |
