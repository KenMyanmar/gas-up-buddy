

# Fix Batch 7 (Change #1 only) — Add `callback_info` field

## What

Add `callback_info: "KBZMINICallBack"` to the `bizContent` object in `supabase/functions/kbzpay-create-payment/index.ts` (after line 178). This is the missing field causing AUTHENTICATION_FAIL.

## What stays unchanged

All debug logging (`// TEMPORARY DEBUG — REMOVE` lines) and the stale comment remain in place so Ken can verify the fix with full diagnostics. A separate cleanup deploy will follow once Ken confirms a successful `prepay_id` response.

## File Modified

`supabase/functions/kbzpay-create-payment/index.ts` — line 178, add one field to `bizContent`:

```typescript
timeout_express: "15m",
callback_info: "KBZMINICallBack",  // Required by KBZ Pay MINIAPP precreate
```

## After Deploy

Ken places a test KBZ Pay order. Edge function logs will show the full signature input (now including `callback_info`) and the KBZ response. If `prepay_id` is returned, we proceed with debug log cleanup in a second deploy.

