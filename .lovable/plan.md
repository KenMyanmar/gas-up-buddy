

# Add `order_source: 'customer_app'` to Edge Function

## Change

### `supabase/functions/create-customer-order/index.ts`

**Line 142**: Add `order_source: "customer_app",` after `created_by: userId,`

```typescript
        status: "new",
        created_by: userId,
        order_source: "customer_app",
        delivery_instructions: deliveryInstructions || null,
```

One line addition. Redeploy after.

| File | Line | Change |
|------|------|--------|
| `supabase/functions/create-customer-order/index.ts` | 142 | Add `order_source: "customer_app",` |

