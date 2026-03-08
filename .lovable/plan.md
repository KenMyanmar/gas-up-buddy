

# Fix: Cylinder prices and commercial sizes on OrderConfigure

## Problem
1. Commercial cylinders (48kg, 50kg) visible — `useCylinderTypes` has no size filter
2. Prices show "— K" when no brand selected — no `price_per_kg` available yet

## Root cause
The `useCylinderTypes` hook fetches all active cylinders without filtering `size_kg <= 20`. The price display depends on a brand being selected first, but no brand is auto-selected when there's more than one.

## Changes

### `src/hooks/useCylinderTypes.ts`
- Add `.lte('size_kg', 20)` to the query to exclude commercial sizes (48kg, 50kg)

### `src/pages/OrderConfigure.tsx`
- When no brand is selected and price is unavailable, show nothing or a placeholder instead of "— K"
- Auto-select the first brand if none selected (already done for single-brand, but the price display still shows "—" before any interaction when multiple brands exist)
- Update the price display line (line 139): instead of `"—"`, show nothing or hide the price line until a brand is picked

**No structural changes needed** — the two-query model (gasPrices for brand pricing, cylinderTypes for sizes) is already correct. The price calculation `size_kg × price_per_kg` on line 49 is correct. Just need the size filter and better empty-state handling.

