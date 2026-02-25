

# Plan: Fix 401 — Ensure Session Before Edge Function Call

## Problem
After `verifyOtp` succeeds, the Supabase client session may not be immediately available. The subsequent `supabase.functions.invoke('link-customer-account')` fires before the JWT is attached, resulting in a 401 from the Edge Function.

## Change

**File:** `src/pages/OtpVerify.tsx` (lines 34-36)

After the successful `verifyOtp` call and before invoking the Edge Function, add a session check with a retry:

```typescript
// After: if (error) throw error;

// Wait for session to be established
let { data: { session } } = await supabase.auth.getSession();

if (!session) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const { data: retry } = await supabase.auth.getSession();
  if (!retry.session) {
    toast({ title: "Auth error", description: "Session not established. Please try again.", variant: "destructive" });
    setVerifying(false);
    return;
  }
}

// Now call the Edge Function — session token will be attached automatically
const response = await supabase.functions.invoke('link-customer-account');
```

This replaces the current direct call at line 36 with a guarded version that ensures the JWT exists before the request.

## File Summary

| File | Action |
|------|--------|
| `src/pages/OtpVerify.tsx` | Add session check + retry before Edge Function call |

