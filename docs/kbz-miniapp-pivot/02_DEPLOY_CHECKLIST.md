# KBZ Mini App Deploy Checklist

## After any redeploy of `kbzpay-create-payment`

Supabase sometimes flips `verify_jwt` back to `true` on redeploy. If this happens:
- Users will see `UNAUTHORIZED_UNSUPPORTED_TOKEN_ALGORITHM` errors
- Edge function invocation fails before reaching the signing code

### Fix

1. Supabase Dashboard → Edge Functions → `kbzpay-create-payment` → Settings
2. Toggle **Enforce JWT** OFF
3. Save

No redeploy needed. Setting takes effect immediately.

### Why

The function does its own JWT validation internally via `supabase.auth.getClaims(token)`, which correctly handles ES256-signed tokens. Supabase's platform-level JWT check only supports HS256.

### Long-term fix (if Lovable supports)

Add this to `supabase/config.toml`:

```toml
[functions.kbzpay-create-payment]
verify_jwt = false
```

If Lovable's deploy pipeline respects this file, the flag will stay off through redeploys.
