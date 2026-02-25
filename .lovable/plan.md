

# Plan: Fix Phone Format Mismatch for Customer Linking

## Problem
Database stores phone as local format (`095119900`). Supabase Auth returns international format (`+9595119900`). Any query matching `customers.phone` against the Auth phone will return zero results — breaking linking for all 11,242 customers.

## Current State

After reviewing the codebase:

- **`OtpVerify.tsx`** (line 36): After OTP success, currently hardcoded to navigate to `/onboarding/link-new` with a TODO comment about calling a linking query. This is where the phone-based customer lookup needs to happen.
- **`LinkWelcomeBack.tsx`** and **`LinkSelectAddress.tsx`**: Both use hardcoded mock data — no real queries yet, but will need `toLocal()` when wired up.
- **`useOrders.ts` → `useCustomerProfile`**: Queries by `auth_user_id`, not phone. This is safe post-linking, no change needed.
- **`ProfilePage.tsx`**: Displays `customer?.phone` from the profile — display only, no query issue.

## Changes

### 1. Create `src/lib/phoneUtils.ts` — shared utility

```typescript
/** Convert international +959xxx to local 09xxx (database format) */
export const toLocal = (phone: string): string => {
  if (phone.startsWith('+959')) return '0' + phone.slice(4);
  if (phone.startsWith('+95')) return '0' + phone.slice(3);
  return phone;
};

/** Convert local 09xxx to international +959xxx (Supabase Auth format) */
export const toInternational = (phone: string): string => {
  if (phone.startsWith('09')) return '+95' + phone.slice(1);
  if (phone.startsWith('+95')) return phone;
  return phone;
};
```

Centralizes both conversions so every file imports from one place.

### 2. Update `src/pages/OtpVerify.tsx` — implement real linking query

After successful OTP verification, query `customers` table using `toLocal(phone)`:

- Query: `supabase.from('customers').select('*').eq('phone', toLocal(phone))`
- **0 matches** → navigate to `/onboarding/link-new` (new customer)
- **1 match** → navigate to `/onboarding/link-welcome` with customer data in route state
- **2+ matches** → navigate to `/onboarding/link-select` with candidates in route state

This replaces the current hardcoded `navigate("/onboarding/link-new")`.

### 3. Update `src/pages/LinkWelcomeBack.tsx` — use route state instead of mock

Read the customer data from `location.state` (passed by OtpVerify) instead of `mockLinkedCustomer`. Display real name, address, township.

### 4. Update `src/pages/LinkSelectAddress.tsx` — use route state instead of mock

Read the candidates array from `location.state` instead of `mockCandidates`. Display real customer records for multi-match selection.

### 5. Update `src/pages/PhoneEntry.tsx` — use shared utility

Replace inline conversion `"+95" + phone.slice(1)` with `toInternational(phone)` from the shared utility.

## File Summary

| File | Action |
|------|--------|
| `src/lib/phoneUtils.ts` | **New** — shared `toLocal()` and `toInternational()` |
| `src/pages/OtpVerify.tsx` | Add real customer linking query with `toLocal()` |
| `src/pages/LinkWelcomeBack.tsx` | Replace mock data with route state |
| `src/pages/LinkSelectAddress.tsx` | Replace mock data with route state |
| `src/pages/PhoneEntry.tsx` | Use shared `toInternational()` |

