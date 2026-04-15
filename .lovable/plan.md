
# Fix Batch 5 — VPS Proxy Wiring

## Change

Replace the direct KBZ API call (lines 125-195) with a proxy-routed call using the `KBZPAY_VPS_PROXY_URL` and `KBZPAY_VPS_PROXY_SECRET` secrets.

### `supabase/functions/kbzpay-create-payment/index.ts`

**Lines 125-129**: Replace the `PRECREATE_URL` block with proxy secret loading + validation:
```typescript
const VPS_PROXY_URL = Deno.env.get("KBZPAY_VPS_PROXY_URL");
const VPS_PROXY_SECRET = Deno.env.get("KBZPAY_VPS_PROXY_SECRET");

if (!VPS_PROXY_URL || !VPS_PROXY_SECRET) {
  console.error("VPS proxy not configured");
  return json({ error: "Payment service not configured" }, 503);
}

const targetUrl =
  env === "UAT"
    ? "http://api-uat.kbzpay.com/payment/gateway/uat/precreate"
    : "https://api.kbzpay.com/payment/gateway/precreate";
```

**Lines 190-195**: Replace `fetch(PRECREATE_URL, ...)` with proxy fetch:
```typescript
const precreateRes = await fetch(VPS_PROXY_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Proxy-Secret": VPS_PROXY_SECRET,
    "X-Target-Url": targetUrl,
  },
  body: JSON.stringify(requestBody),
  signal: controller.signal,
});
```

No other changes — signing, response parsing, DB writes all stay the same. Redeploy after edit.

## Files Modified
1. `supabase/functions/kbzpay-create-payment/index.ts` — proxy wiring
