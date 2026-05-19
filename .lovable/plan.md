## Patch C1 — Fix OrderTracking stepper to use verified state contract

**Scope:** Single file — `src/pages/OrderTracking.tsx`. Frontend-only. No backend, no realtime, no schema, no copy changes to the 4 step labels.

### Why
Production data confirms `order.status = 'confirmed'` is never written (0/6,604 orders). The current stepper keys off `order.status` alone, so step 2 ("Accepted") is unreachable and the UI jumps from step 1 directly to steps 1+2+3 when the agent accepts. The verified contract uses three DB signals:

| Step | Lights when | Signal |
|---|---|---|
| 1. Placed | KBZ Pay paid | `payment_status === 'paid'` |
| 2. Accepted | CRM assigns supplier | `supplier_id != null` |
| 3. On the Way | Agent taps Accept | `status === 'in_progress'` |
| 4. Delivered | Agent uploads proof | `status === 'delivered'` |

The existing realtime subscription on `orders` already fires on `payment_status` / `supplier_id` / `status` UPDATE — no changes needed there.

### Changes (5 touchpoints, all in OrderTracking.tsx)

1. **Add helper** above the `OrderTracking` component:
   ```ts
   function getCurrentStepIndex(o: Pick<OrderData,'status'|'payment_status'|'supplier_id'>): number {
     if (o.status === 'delivered')    return 3;
     if (o.status === 'in_progress')  return 2;
     if (o.supplier_id)               return 1;
     if (o.payment_status === 'paid') return 0;
     return -1;
   }
   ```

2. **Step index** (line 185): replace `statusSteps.findIndex(...)` with `getCurrentStepIndex(order)`. Update the `statusSteps` array entry `key: "confirmed"` → `key: "assigned"` (cosmetic; key no longer drives logic). Labels untouched.

3. **Status badge** (line 239): priority order — delivered → in_progress → supplier_id → default "Placed".

4. **isActive flag** (line 187): `!!order.supplier_id && order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'failed'`. Drives agent card visibility from the moment a supplier is assigned.

5. **Map overlay label** (line 364): in_progress → "🕐 On the way"; else if `supplier_id` → "🔧 Preparing"; else → "📍 Agent location".

6. **Help footer** (line 186): simplify to `order.status === "new"` (drops dead `'confirmed'` clause).

### Out of scope (do not touch)
- Realtime channel subscriptions
- `handleCheckPayment` and the three payment-status banners
- Agent location / map subscription
- Any edge function, table, RPC, or RLS
- The 4 step labels ("Placed", "Accepted", "On the Way", "Delivered")

### Test checklist (post-publish, Cowork)
- T1 paid → step 1 alone, badge "Placed"
- T2 supplier assigned → step 2 alone, badge "Accepted" *(headline fix)*
- T3 in_progress → steps 1+2+3, badge "On the Way", agent card + map appear
- T4 delivered → all 4 steps, badge "Delivered"
- T5 existing order e7ff8967 retroactively lights step 2 after refresh
