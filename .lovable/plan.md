

# Fix Batch 4 — KBZ Pay Flow Wiring

## Root Cause

The frontend hardcodes `paymentMethod: isMiniApp ? "kbzpay" : "cash"` (line 67), ignoring the user's payment method selection (`payment` state). When Ken tested from a regular browser, `isMiniApp` was false, so it always sent `"cash"`. Additionally, the standard payment method list uses `id: "kbz"` but the backend expects `"kbzpay"`.

## Fixes (3 files)

### 1. `src/pages/OrderConfirm.tsx` — Use selected payment method

**Line 30**: Change payment method id from `"kbz"` to `"kbzpay"` so it matches the backend allowlist.

**Line 67**: Replace hardcoded `isMiniApp ? "kbzpay" : "cash"` with the `payment` state variable (which already defaults to `"kbzpay"` in mini app, `"cash"` otherwise).

**Lines 75-116**: Change KBZ Pay flow condition from `if (isMiniApp && result.order_id)` to `if (payment === "kbzpay" && result.order_id)` — so KBZ Pay flow triggers based on user selection, not environment detection.

### 2. `supabase/functions/create-customer-order/index.ts` — Relax constraint + return payment_method

**Lines 70-72**: Remove the constraint `if (paymentMethod === "kbzpay" && orderSource !== "kbzpay_miniapp")`. Keep the reverse constraint (kbzpay_miniapp must use kbzpay). This allows KBZ Pay testing from the regular customer app.

**Line 175-179**: Add `payment_method: paymentMethod` to the response body so the frontend has confirmation of what was stored.

### 3. `src/lib/kbzpay-bridge.ts` — No changes needed

The `startPay` function already has the correct callback signature from the previous fix. No changes required.

## Files Modified

1. **`src/pages/OrderConfirm.tsx`** — Fix payment method id, use `payment` state, branch on selection not environment
2. **`supabase/functions/create-customer-order/index.ts`** — Remove blocking constraint, return payment_method in response

## After Deploy

Ken can re-test: select KBZ Pay from the regular customer app, place order, and `kbzpay-create-payment` should be called. The `startPay` native call will only work inside the actual KBZ Pay app (where `window.ma` exists), but we'll at least verify the precreate API call succeeds and returns a `prepay_id`.

