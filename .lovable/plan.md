

# Priority 1: Order Placement — Configure → Confirm → Success

## Current State

- **OrderConfigure** calculates real prices from `cylinder_types` + `gas_prices` but doesn't pass data to OrderConfirm
- **OrderConfirm** is entirely hardcoded (shows "7 kg LP Gas", "36,400 MMK") and uses a `setTimeout` mock
- No Edge Function exists — no `supabase/functions/` directory at all
- No Order Success screen
- Delivery address is hardcoded ("No. 42, Pyay Road") instead of reading from the customer record

## What Gets Built

### 1. Pass order data from Configure → Confirm via React Router state

**`src/pages/OrderConfigure.tsx`** — on "CONFIRM ORDER" click, navigate with state:
```typescript
navigate("/order/confirm", {
  state: {
    cylinderType: selectedSize.display_name,    // e.g. "10kg"
    sizeKg: selectedSize.size_kg,
    brandId: activeBrandId,
    brandName: selectedBrandPrice.brands?.name,
    orderType: deliveryType,                     // "refill" | "new"
    quantity,
    unitPrice,
    gasSubtotal: unitPrice * quantity,
    cylinderSubtotal: deliveryType === "new" ? selectedSize.cylinder_price * quantity : 0,
    deliveryFee: 0,
    totalAmount: total,
    gasPricePerKg: selectedBrandPrice.price_per_kg,
  }
});
```

Also: replace hardcoded delivery address with customer's actual address (from `useCustomerProfile`).

### 2. Rewrite OrderConfirm to use real data + call Edge Function

**`src/pages/OrderConfirm.tsx`** — read `useLocation().state`, display real summary, call Edge Function on confirm:
- Read order config from router state; redirect back if missing
- Read customer profile for address/township/phone
- Show real values: size, brand, type, quantity, price breakdown, address
- On "PLACE ORDER": call `supabase.functions.invoke('create-customer-order', { body: {...} })`
- On success: navigate to `/order/success` with order ID
- On error: show toast, re-enable button

### 3. Create `create-customer-order` Edge Function

**`supabase/functions/create-customer-order/index.ts`**

Required orders columns (NOT NULL, no default): `township`, `address`, `quantity`, `customer_phone`

The Edge Function will:
1. Authenticate via `getClaims()` — get `user_id` from JWT
2. Look up customer record by `auth_user_id`
3. Validate required fields from request body
4. **Server-side price verification**: query `gas_prices` + `cylinder_types` to recalculate total, reject if client total doesn't match
5. Insert into `orders` with:
   - `customer_id`, `customer_phone`, `township`, `address` (from customer record)
   - `cylinder_type`, `brand_id`, `order_type`, `quantity` (from request)
   - `gas_price_per_kg`, `gas_subtotal`, `cylinder_subtotal`, `delivery_fee`, `total_amount` (server-calculated)
   - `status: 'new'`, `created_by: user_id`
6. Return `{ order_id, total_amount }`

**`supabase/config.toml`** — add:
```toml
[functions.create-customer-order]
verify_jwt = false
```

### 4. Create Order Success screen

**`src/pages/OrderSuccess.tsx`** — new file:
- Reads order ID from router state
- Shows: checkmark animation, "Order Placed!", order number (truncated UUID), "Estimated delivery: 30-45 min"
- Two buttons: "Track Order" (→ future order detail, for now → /orders) and "Back to Home" (→ /home)

### 5. Add route

**`src/App.tsx`** — add:
```typescript
<Route path="/order/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
```

### 6. Wire customer address into OrderConfigure

Replace hardcoded "Hlaing Township" / "No. 42, Pyay Road" with actual `customer.township` and `customer.address` from `useCustomerProfile`.

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/OrderConfigure.tsx` | Edit | Pass real data via navigate state; use customer address |
| `src/pages/OrderConfirm.tsx` | Rewrite | Real data display + Edge Function call |
| `src/pages/OrderSuccess.tsx` | Create | Success screen with order ID |
| `supabase/functions/create-customer-order/index.ts` | Create | Server-side order creation with price verification |
| `supabase/config.toml` | Edit | Add `verify_jwt = false` for new function |
| `src/App.tsx` | Edit | Add `/order/success` route |

## Orders Table Insert — Required Fields Map

```text
Field               Source              Example
─────────────────── ─────────────────── ────────────────
customer_id         DB lookup           uuid
customer_phone      DB lookup           "959511990"
township            DB lookup           "Hlaing"
address             DB lookup           "No. 42, Pyay Road"
cylinder_type       Client request      "10kg"
brand_id            Client request      uuid
order_type          Client request      "refill"
quantity            Client request      1
gas_price_per_kg    Server verified     5200
gas_subtotal        Server calculated   52000
cylinder_subtotal   Server calculated   0
delivery_fee        Server calculated   0
total_amount        Server calculated   52000
status              Hardcoded           "new"
created_by          JWT claims          uuid
```

## Risk Notes

- Payment is cash-only for now (payment method selection is UI-only, no integration needed)
- Delivery fee is hardcoded to 0 for launch (township-based fees are a future feature)
- The Edge Function uses a service-role-less approach: inserts as the authenticated user, relying on an RLS policy that allows customers to insert their own orders (need to verify this policy exists or note it)

