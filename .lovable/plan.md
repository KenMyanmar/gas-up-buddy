

# Fix: startPay callback signature + webhook empty-value filtering

## Two changes, two files

### 1. `src/lib/kbzpay-bridge.ts` — Move callbacks out of params object

**Current (broken):** `success` and `fail` callbacks are inside the params object passed as the second argument. KBZ JSSDK never invokes them — promise never resolves.

**Fix:** Pass callbacks as separate 3rd and 4th arguments to `callNativeAPI`:

```typescript
ma.callNativeAPI("startPay", {
  prepayId: params.prepayId,
  orderInfo: params.orderInfo,
  sign: params.sign,
  signType: params.signType,
  useMiniResultFlag: true,
}, (res: any) => {
  clearTimeout(timer);
  resolve(res);
}, (err: any) => {
  clearTimeout(timer);
  reject(new Error(err?.errorMessage || "startPay failed"));
});
```

Lines 66-80 replaced.

### 2. `supabase/functions/kbzpay-webhook/index.ts` — Filter empty values from signature

**Current:** Line 74 includes all non-sign keys, even if the value is empty string, null, or undefined. KBZ spec excludes empty params from signature computation.

**Fix:** Add empty-value filter before joining:

```typescript
const sorted = Object.keys(copy)
  .filter((k) => copy[k] !== "" && copy[k] !== null && copy[k] !== undefined)
  .sort();
```

Line 73-74 replaced. Redeploy webhook after.

