

# Fix: `toLocal()` in Client Code

The Edge Function is fixed. The same broken `toLocal()` exists in `src/lib/phoneUtils.ts` (line 3):

```
Current:  if (phone.startsWith('+959')) return '0' + phone.slice(4);   // "05119900" ← WRONG
Fixed:    if (phone.startsWith('+959')) return '09' + phone.slice(4);  // "095119900" ← CORRECT
```

## Change

**File:** `src/lib/phoneUtils.ts` (line 3)

Replace `'0' + phone.slice(4)` with `'09' + phone.slice(4)`.

This affects any client-side code that converts international phone numbers back to local format (e.g., `useCustomerProfile` in `useOrders.ts` which queries `customers` by phone).

| File | Change |
|------|--------|
| `src/lib/phoneUtils.ts` line 3 | `'0' + phone.slice(4)` → `'09' + phone.slice(4)` |

