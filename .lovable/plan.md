

# Fix: order_type enum mismatch in create-customer-order

## Bug
Postgres enum `order_type` accepts `refill | new_setup | exchange | service_call`. Function forwards client's `"new"` verbatim → DB rejects with `22P02 invalid input value for enum order_type: "new"`. Every new-cylinder order returns 400.

## Two edits in `supabase/functions/create-customer-order/index.ts`

### Edit 1 — line ~72: map client → DB enum
Replace:
```ts
const validOrderTypes = ["refill", "new"];
const safeOrderType = validOrderTypes.includes(orderType) ? orderType : "refill";
```
With:
```ts
// DB enum: refill | new_setup | exchange | service_call
const orderTypeMap: Record<string, string> = {
  "refill": "refill",
  "new": "new_setup",
  "new_setup": "new_setup",
  "exchange": "exchange",
  "service_call": "service_call",
};
const safeOrderType = orderTypeMap[orderType] || "refill";
```

### Edit 2 — line ~103: update cylinder price condition
Replace `safeOrderType === "new"` with `safeOrderType === "new_setup"` in the `cylinderSubtotal` calculation.

## Out of scope (do NOT touch)
- `status: "new"` in the order insert (different column, `order_status` enum — leave it)
- Any kbzpay-* function
- `verify_jwt` settings / `supabase/config.toml`
- DB enum itself (values are correct)
- Existing debug `console.log`s (separate cleanup)

## Files
| Action | File |
|--------|------|
| Edit | `supabase/functions/create-customer-order/index.ts` (lines ~72 and ~103) |

## Post-deploy verification
- Auto-deploys via Lovable.
- Test from Customer App: place a 78,000 MMK 15kg new-cylinder order → expect 200, order row created with `order_type = 'new_setup'`.
- Test refill flow → expect 200, `order_type = 'refill'`, no cylinder_price added.
- Re-confirm `verify_jwt` OFF on `kbzpay-create-payment` if Lovable deploy reset it (manual dashboard step, outside this fix).

## Test matrix
| orderType sent | safeOrderType | cylinderSubtotal |
|---|---|---|
| `"new"` | `"new_setup"` | `cylinder_price × qty` |
| `"refill"` | `"refill"` | `0` |
| `"exchange"` | `"exchange"` | `0` |
| `undefined` / `"garbage"` | `"refill"` (default) | `0` |

