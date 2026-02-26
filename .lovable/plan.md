

# Add Delivery Fee: 3,000 MMK for Refill Orders

Three surgical fixes to add a 3,000 MMK delivery fee for refill orders across the stack.

## Changes

### 1. Edge Function — `supabase/functions/create-customer-order/index.ts`
**Line 109**: Change `const deliveryFee = 0;` to `const deliveryFee = safeOrderType === "refill" ? 3000 : 0;`

This is the critical server-side fix. The Edge Function will be auto-redeployed.

### 2. Frontend — `src/pages/OrderConfigure.tsx`

**Line 61**: Update `total` calculation to include delivery fee:
```typescript
const deliveryFee = deliveryType === "refill" ? 3000 : 0;
const total = unitPrice * quantity + deliveryFee;
```

**Line 218**: Show delivery fee conditionally instead of hardcoded "Free":
```typescript
<span className="font-semibold text-action">
  {deliveryFee > 0 ? `${deliveryFee.toLocaleString()} MMK` : "Free"}
</span>
```

**Line 238**: Pass computed `deliveryFee` instead of `0`:
```typescript
deliveryFee: deliveryFee,
```

### 3. Frontend — `src/pages/OrderConfirm.tsx`

**Line 148**: Show delivery fee conditionally:
```typescript
<span className={orderState.deliveryFee > 0 ? "text-foreground" : "font-semibold text-action"}>
  {orderState.deliveryFee > 0 ? `${orderState.deliveryFee.toLocaleString()} MMK` : "Free"}
</span>
```

## File Summary

| File | Line(s) | Change |
|------|---------|--------|
| `supabase/functions/create-customer-order/index.ts` | 109 | `deliveryFee = safeOrderType === "refill" ? 3000 : 0` |
| `src/pages/OrderConfigure.tsx` | 61, 218, 238 | Compute & display delivery fee, pass in state |
| `src/pages/OrderConfirm.tsx` | 148 | Conditional delivery fee display |

