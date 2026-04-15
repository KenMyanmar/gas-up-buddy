

# KBZ Mini App Phase 1.5 + 1.6 — Final Implementation Plan

## Clarifications Confirmed

1. **Change 2 — Brand selector on OrderConfigure**: Yes, intentional. Brand selector stays on OrderConfigure for flexibility. Brand passed from HomePage via route state is **pre-selected**, but user can change it. Cylinder grid updates reactively.

2. **Change 4 — "My Orders" card**: Confirmed kept. Only "Order Again", "Accessories", and "Call 8484" cards are deleted.

3. **Change 5 — `isKBZPayMiniApp` removal scoped to OrderConfirm.tsx only**. `src/utils/kbzpay.ts` and all other consumers untouched.

---

## Implementation Order (6 changes, ~10 files)

### Change 1 — Brand picker with Refill/New Setup tabs
- `src/hooks/useBrands.ts`: Add `refill_delivery_fee`, `allow_new_setup` to interface + select. Order by `sort_order`.
- `src/pages/HomePage.tsx`: Add `deliveryType` state + tab toggle. Filter brands by `allow_new_setup` on New Setup tab. Brand card click → navigate `/order/configure` with `{ brandId, orderType }` in route state.

### Change 2 — Cylinder picker from brand_products
- Create `src/hooks/useBrandProducts.ts`: Query `brand_products` joined with `cylinder_types` + `gas_prices`, filtered by `brand_id`, `is_active`, `is_orderable`, `product_kind = 'cylinder'`.
- `src/pages/OrderConfigure.tsx`: Accept `brandId`/`orderType` from route state. Pre-select brand. Replace `useCylinderTypes()` + `useGasPrices()` with `useBrandProducts(activeBrandId)`. Brand selector remains for flexibility, filters New Setup tab by `allow_new_setup`.

### Change 3 — Banner carousel
- Create `src/components/HomeBannerCarousel.tsx`: CSS scroll-snap, 2:1 aspect, 5s auto-rotate, pause on touch (resume 3s after release), dot indicators, first image eager / rest lazy, tappable if `link_url` not null.
- Mount in `src/pages/HomePage.tsx` below "Our Brands" grid.

### Change 4 — Strip non-essential elements + tel: links
- **Delete** `src/components/CallFallback.tsx`
- `src/App.tsx`: Remove CallFallback import + mount
- `src/pages/HomePage.tsx`: Remove tel:8484 header button, remove "Order Again" / "Accessories" / "Call 8484" cards. Keep "My Orders" card.
- `src/pages/ProfilePage.tsx`: Replace `<a href="tel:8484">` with `<span>8484</span>`
- `src/pages/OrderTracking.tsx`: Replace tel:8484 link with `<span>`
- `src/components/BottomNav.tsx`: Delete `isKBZPayMiniApp()` early-return + import. BottomNav always renders.

### Change 5 — OrderConfirm KBZ Pay only
- `src/pages/OrderConfirm.tsx`: Remove payment method selector UI + `standardPaymentMethods` array. Hardcode `paymentMethod: "kbzpay"`, `orderSource: "kbzpay_miniapp"`. Remove `isKBZPayMiniApp`/`getOrderSource` imports (scoped to this file only). Rename CTA to "Pay with KBZ Pay — X MMK". Wire flow: create-customer-order → kbzpay-create-payment → startKbzPayment → navigate with `?state=processing|cancelled|failed`. Keep Special Instructions accordion. Keep `pollOrderUntilPaid` as fallback.

### Change 6 — Brand-aware delivery fee
- `src/pages/OrderConfigure.tsx`: `deliveryFee = orderType === "refill" ? selectedBrand.refill_delivery_fee : 0`. Show "Free" for 0, formatted MMK for 3000, formatted MMK + info tooltip for 6000 ("2-way delivery: we pick up your empty cylinder, refill at the factory, and deliver it back."). Pass `deliveryFee` in route state to OrderConfirm.
- `src/pages/OrderConfirm.tsx`: Display from route state. Same tooltip for 6000.

---

## Files Summary

| Action | File |
|--------|------|
| Edit | `src/hooks/useBrands.ts` |
| Create | `src/hooks/useBrandProducts.ts` |
| Create | `src/components/HomeBannerCarousel.tsx` |
| Edit | `src/pages/HomePage.tsx` |
| Edit | `src/pages/OrderConfigure.tsx` |
| Edit | `src/pages/OrderConfirm.tsx` |
| Edit | `src/pages/ProfilePage.tsx` |
| Edit | `src/pages/OrderTracking.tsx` |
| Edit | `src/components/BottomNav.tsx` |
| Edit | `src/App.tsx` |
| Delete | `src/components/CallFallback.tsx` |

## Post-implementation verification

Run and confirm zero matches for:
- `git grep "tel:8484"`
- `git grep "CallFallback"`
- `git grep "standardPaymentMethods"`

