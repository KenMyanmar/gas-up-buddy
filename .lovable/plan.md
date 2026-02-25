

# Diagnosis: Two Real Issues Found

## Issue 1: Race Condition — PublicOnlyRoute Hijacks OtpVerify Navigation

**Root cause:** `OtpVerify` is wrapped in `PublicOnlyRoute` (App.tsx line 47). The moment `verifyOtp()` succeeds, the auth state updates synchronously via `onAuthStateChange`. `PublicOnlyRoute` sees `user` is now truthy and immediately redirects to `/home` — before the Edge Function call on line 49 of OtpVerify even executes.

**Sequence:**
```text
1. verifyOtp() succeeds
2. Auth state fires → user becomes truthy
3. PublicOnlyRoute redirects to /home (BEFORE Edge Function call)
4. HomePage renders → useCustomerProfile fires → 500 (RLS error)
5. Edge Function response arrives late → navigate('/onboarding/link-new') fires
6. User lands on link-new but HomePage already errored
```

**Fix:** Move `OtpVerify` out of `PublicOnlyRoute`. It needs auth to complete (for the Edge Function call), so it should either be unguarded or use a custom guard that allows the linking flow to finish.

### Change: `src/App.tsx`

Move the OTP route out of `PublicOnlyRoute`:

```tsx
{/* OTP verify — needs to stay mounted after auth succeeds to complete linking */}
<Route path="/onboarding/otp" element={<OtpVerify />} />
```

This way, after `verifyOtp` succeeds, the component stays mounted, the session check runs, the Edge Function is called, and only then does the app navigate to the correct destination.

## Issue 2: RLS Infinite Recursion on `orders` Table

The error message is `"infinite recursion detected in policy for relation \"orders\""` — triggered when querying the `customers` table. This means:

- The `customers` table has an RLS policy that subqueries `orders`
- The `orders` table has an RLS policy that subqueries `customers`
- This creates an infinite loop

This breaks `useCustomerProfile` which is called by HomePage, OrdersPage, and ProfilePage. **This is a database-side fix** — the RLS policies need to be rewritten using security definer functions to break the circular reference.

### Database Fix (Supabase SQL Editor)

Run this to inspect the current policies:
```sql
SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies
WHERE tablename IN ('customers', 'orders');
```

The fix pattern (once you see which policies are circular):
```sql
-- Create a security definer function to break the recursion
CREATE OR REPLACE FUNCTION public.get_customer_id_for_user(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM customers WHERE auth_user_id = user_id LIMIT 1;
$$;

-- Then update the orders policy to use the function instead of subquerying customers
-- (exact policy depends on what pg_policies shows)
```

## File Summary

| File | Action | Fixable Here? |
|------|--------|---------------|
| `src/App.tsx` (line 47) | Move OTP route out of `PublicOnlyRoute` | Yes |
| RLS policies on `orders` + `customers` | Break circular reference with security definer function | No — Supabase SQL Editor |

## Priority

Fix #1 (App.tsx route guard) is the **critical client-side fix** and can be shipped now. Fix #2 (RLS recursion) must be done in the Supabase dashboard but will block HomePage/OrdersPage/ProfilePage from loading until resolved.

