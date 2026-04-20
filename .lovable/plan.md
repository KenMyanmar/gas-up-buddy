

# Fix: Brand-Dependent Delivery Fee

## Problem
`create-customer-order` hardcodes delivery fee at 3,000 MMK for all refills. Should be:
- **3,000 MMK**: Easy Gas, Parami Gas (pre-filled delivery)
- **6,000 MMK**: Other Partners (pick up → refill → return trip)

## Change in `supabase/functions/create-customer-order/index.ts`

**Line ~135**: Replace:
```typescript
const deliveryFee = safeOrderType === "refill" ? 3000 : 0;
```

With:
```typescript
// Delivery fee: 3000 for Easy Gas & Parami (direct delivery), 6000 for Other Partners (round-trip refill)
const OTHER_PARTNERS_BRAND_ID = "62a6da96-d2e7-463b-9513-370e25cdf271";
const deliveryFee = safeOrderType === "refill"
  ? (brandId === OTHER_PARTNERS_BRAND_ID ? 6000 : 3000)
  : 0;
```

## Out of scope
- `order_type` enum mapping (already fixed)
- `status: "new"` (order_status column, different enum)
- Any kbzpay-* functions
- `verify_jwt` settings
- Debug console.logs

## Post-deploy verification
- Other Partners 12kg refill → expect 66,000 total (60,000 + 6,000)
- Easy Gas 5kg refill → expect 26,000 total (23,000 + 3,000)

