

# Fix BottomNav: Preserve nav on `/orders`

## Problem
The current condition `location.pathname.startsWith("/order")` also matches `/orders`, hiding the nav on the Orders list page.

## Change

### `src/components/BottomNav.tsx`
**Line 19**: Change `"/order"` to `"/order/"` so `/orders` keeps the nav visible.

```typescript
if (location.pathname === "/" || location.pathname.startsWith("/onboarding") || location.pathname.startsWith("/order/")) {
```

| File | Change |
|------|--------|
| `src/components/BottomNav.tsx` | `"/order"` → `"/order/"` in startsWith check |

