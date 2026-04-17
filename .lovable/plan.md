

# Update kbzpay-auto-login: Two-Call VPS Proxy Exchange

## Host mapping (corrected)
- **UAT**: `https://uat-miniapp.kbzpay.com`
- **PROD**: `https://appcube.easy-run.kbzpay.com` ← corrected per docs
- Driven by `KBZPAY_ENV` env var (same pattern as `kbzpay-create-payment`).

## Replace single proxy call (lines ~158–192) with two sequential calls

### Call 1 — getAccessToken
```
POST {KBZPAY_VPS_PROXY_URL}
Headers:
  Content-Type: application/json
  X-Proxy-Secret: {KBZPAY_VPS_PROXY_SECRET}
  X-Target-Url: {host}/miniprogram/open/getAccessToken
Body: { authCode }
```
→ Extract `accessToken` (check both top-level and nested `Response.accessToken`).

### Call 2 — getUserInfo
```
POST {KBZPAY_VPS_PROXY_URL}
Headers: same, with
  X-Target-Url: {host}/miniprogram/open/getUserInfo
Body: { authCode, accessToken }
```
→ Extract `phone` (fallback `msisdn`).

## Env var unification
- Drop env-suffixed `KBZPAY_${env}_VPS_PROXY_URL` / `KBZPAY_${env}_PROXY_SECRET`.
- Use `KBZPAY_VPS_PROXY_URL` / `KBZPAY_VPS_PROXY_SECRET` (matches `kbzpay-create-payment`).
- Keep `KBZPAY_ENV` for host selection only.

## Error handling
- 15s `AbortController` timeout per call.
- Non-OK or missing field → return `502 "Failed to verify KBZ Pay account"`, log status + truncated body with distinct tag (`getAccessToken` vs `getUserInfo`).
- Never log: `accessToken`, `authCode`, `X-Proxy-Secret`, full bodies.

## Downstream unchanged
Phone normalization, customer lookup, candidate building, session minting (lines 194+) untouched.

## Files
| Action | File |
|--------|------|
| Edit | `supabase/functions/kbzpay-auto-login/index.ts` (lines ~158–192) |

## Post-deploy verification
- Confirm `KBZPAY_VPS_PROXY_URL` + `KBZPAY_VPS_PROXY_SECRET` set (already used by create-payment).
- `verify_jwt` on `kbzpay-auto-login` stays OFF (pre-auth function).
- Trigger auto-login in KBZ Pay preview → check logs for clean two-call sequence.

