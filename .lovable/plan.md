

# Fix Batch 6 — Signature Debug Logging

## Changes to `supabase/functions/kbzpay-create-payment/index.ts`

### 1. Replace `signParams` function (lines 36-43)

Add debug logging for the sign input string, sorted keys, app key metadata, and computed signature. All lines tagged with `// TEMPORARY DEBUG — REMOVE`.

```typescript
async function signParams(
  params: Record<string, string>,
  appKey: string,
): Promise<string> {
  const sorted = Object.keys(params).sort();
  const qs = sorted.map((k) => `${k}=${params[k]}`).join("&");
  const signInput = qs + "&key=" + appKey;
  // TEMPORARY DEBUG — REMOVE after signature bug is resolved
  console.log("🔐 SIGN INPUT:", signInput);
  console.log("🔐 PARAMS KEYS (sorted):", sorted.join(","));
  console.log("🔐 APP KEY LENGTH:", appKey.length);
  console.log("🔐 APP KEY FIRST 4:", appKey.slice(0, 4));
  console.log("🔐 APP KEY LAST 4:", appKey.slice(-4));
  const sig = await sha256Hex(signInput);
  console.log("🔐 COMPUTED SIGN:", sig);
  return sig;
}
```

### 2. Before the `fetch(VPS_PROXY_URL, ...)` call (insert before line 198)

```typescript
// TEMPORARY DEBUG — REMOVE after signature bug is resolved
console.log("📤 REQUEST BODY TO KBZ:", JSON.stringify(requestBody, null, 2));
console.log("📤 TARGET URL:", targetUrl);
```

### After deploy

Ken places one test order. Logs will show the exact sign input string for analysis. **All debug lines must be removed once the signature issue is identified.**

## Files Modified
1. `supabase/functions/kbzpay-create-payment/index.ts` — temporary debug logging

