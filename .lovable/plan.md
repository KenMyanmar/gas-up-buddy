

# Fix: Stop Calling Edge Function for Customer Linking Check

## Root Cause

In `src/pages/OtpVerify.tsx` (line 49), after OTP verification succeeds, the code calls:
```typescript
const response = await supabase.functions.invoke('link-customer-account');
```
**without a request body**. The Edge Function returns `400 "Missing request body"`. Since `response.data` is then null/undefined, none of the status checks match (`already_linked`, `single`, `multiple`), so it falls through to `navigate('/onboarding/link-new')` every time.

This means every successful login dumps the user into onboarding, even if they already have a linked customer record.

## Fix: 2 Files

### 1. `src/pages/OtpVerify.tsx` — Replace Edge Function call with direct DB query

After OTP verification succeeds, instead of calling the Edge Function, query the `customers` table directly (the `useCustomerProfile` pattern already exists in `useOrders.ts`):

```typescript
// Lines 48-60: Replace the Edge Function call block with:

// Check if customer is already linked by querying DB directly
const { data: existingCustomers } = await supabase
  .from('customers')
  .select('id, full_name, address, township')
  .eq('auth_user_id', session?.user?.id ?? (await supabase.auth.getSession()).data.session?.user?.id)

if (existingCustomers && existingCustomers.length === 1) {
  // Already linked to exactly one customer → go home
  navigate('/home');
} else if (existingCustomers && existingCustomers.length > 1) {
  // Multiple customer records → let user pick
  navigate('/onboarding/link-select', { state: { candidates: existingCustomers } });
} else {
  // No linked customer → check if phone matches any unlinked customers
  // Call Edge Function WITH proper body for initial phone-based matching
  const response = await supabase.functions.invoke('link-customer-account', {
    body: { action: 'check_phone' }
  });
  const result = response.data;

  if (result?.status === 'single') {
    navigate('/onboarding/link-welcome', { state: { customer: result.customer } });
  } else if (result?.status === 'multiple') {
    navigate('/onboarding/link-select', { state: { candidates: result.candidates } });
  } else {
    // No match at all → new customer registration
    navigate('/onboarding/link-new');
  }
}
```

The key change: the **first check** is a direct DB query (no Edge Function). The Edge Function is only called if the user has no linked customer and we need to do phone-based matching against unlinked records.

### 2. `src/App.tsx` — Add customer-linked check to ProtectedRoute

The current `ProtectedRoute` only checks `user` exists. An authenticated user with no linked customer still gets through to `/home` where data is empty. Add a linking check:

```typescript
// Replace ProtectedRoute (lines 27-32) with:
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: customer, isLoading: customerLoading } = useCustomerProfile(user?.id);
  
  if (loading || customerLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  // If authenticated but no linked customer, send to onboarding
  if (!customer) return <Navigate to="/onboarding/link-new" replace />;
  return <>{children}</>;
};
```

This requires importing `useCustomerProfile` at the top of App.tsx:
```typescript
import { useCustomerProfile } from "@/hooks/useOrders";
```

**Important exception**: The onboarding linking routes (`/onboarding/link-welcome`, `/onboarding/link-select`, `/onboarding/link-new`) must NOT use this enhanced `ProtectedRoute` or they'll create an infinite redirect loop. They need a simpler guard that only checks authentication:

```typescript
// Add a new route guard for onboarding pages
const AuthOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};
```

Then update routes:
```typescript
{/* Post-OTP linking — auth required but NO customer-linked check */}
<Route path="/onboarding/link-welcome" element={<AuthOnlyRoute><LinkWelcomeBack /></AuthOnlyRoute>} />
<Route path="/onboarding/link-select" element={<AuthOnlyRoute><LinkSelectAddress /></AuthOnlyRoute>} />
<Route path="/onboarding/link-new" element={<AuthOnlyRoute><LinkNewCustomer /></AuthOnlyRoute>} />
```

## Summary

| File | Change |
|------|--------|
| `src/pages/OtpVerify.tsx` | Replace Edge Function call with direct `customers` table query; only call EF with body for phone matching |
| `src/App.tsx` | Split route guards: `ProtectedRoute` checks customer linking, new `AuthOnlyRoute` for onboarding pages |

## What This Fixes

- Authenticated users with linked customers go straight to `/home` (no onboarding loop)
- Authenticated users WITHOUT linked customers get redirected to onboarding from any protected page
- Edge Function is never called without a body
- Edge Function is only called once during initial OTP verification when phone-based matching is needed

