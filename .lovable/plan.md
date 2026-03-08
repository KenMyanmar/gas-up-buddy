

# Sprint: Critical Fix + KBZ Pay Mini App Preparation

## 7 files to change (0 backend files touched)

### Fix 1 (CRITICAL): `src/pages/LinkWelcomeBack.tsx`
- Import `supabase` client, `useToast`, `useState`, `Loader2`
- Add `loading` state
- Replace inline `onClick={() => navigate("/home")}` with async `handleConfirm` that:
  1. Calls `supabase.functions.invoke('link-customer-account', { body: { action: 'link', customer_id: customer.id } })`
  2. On success → `navigate('/home')`
  3. On error → destructive toast
- Show `Loader2` spinner on button while loading

### KBZ Prep 1: `vite.config.ts`
- Add `base: "./"` to the config object (line 7, inside the returned object)

### KBZ Prep 2: `src/utils/kbzpay.ts` (NEW)
- `isKBZPayMiniApp()` — checks `?miniapp=1` URL param (persists to localStorage), falls back to `localStorage`, then `window.ma`
- `getOrderSource()` — returns `'kbzpay'` or `'customer_app'`
- Exact implementation as specified in user prompt

### KBZ Prep 3: `src/pages/PhoneEntry.tsx`
- Import `isKBZPayMiniApp`
- Add `isMiniApp` state + `useEffect` with 2-second timeout to fall back to normal form
- If `isMiniApp && !timedOut`: show "Connecting via KBZ Pay..." with spinner + TODO comment
- Otherwise: show existing phone form unchanged

### KBZ Prep 4: `src/pages/OrderConfirm.tsx`
Two changes:
- **Payment UI**: Import `isKBZPayMiniApp`. If true, replace the `paymentMethods` list with a single "Pay with KBZ Pay" button (blue `#0066CC`, white text) + TODO comment. Auto-set `payment` to `'kbzpay'`. If false, show all 4 methods as-is.
- **orderSource**: Import `getOrderSource`. Add `orderSource: getOrderSource()` to the Edge Function body (line 63 area).

### KBZ Prep 5: `src/components/BottomNav.tsx`
- Import `isKBZPayMiniApp`
- Add early return `if (isKBZPayMiniApp()) return null;` before the existing pathname checks

### KBZ Prep 6: `index.html`
- Add JSSDK placeholder comment in `<head>` (after line 9):
  ```html
  <!-- KBZ Pay Mini App JSSDK — uncomment when js-sdk.min.js is available -->
  <!-- <script src="./js-sdk.min.js"></script> -->
  ```

### No changes to
- Any `supabase/functions/` files
- Any database queries
- Existing payment logic for non-KBZ mode

### Testing
- With `?miniapp=1` → KBZ loading screen on login, "Pay with KBZ Pay" only on confirm
- Without parameter → everything unchanged

