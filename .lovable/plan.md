

# Fix Profile Page: Show Customer Data + Address/Township

## Investigation

The ProfilePage code already calls `useCustomerProfile(user?.id)` and uses `customer?.full_name ?? "Guest"`. The logic is structurally correct. Two issues:

1. **Phone fallback shows raw auth format**: When `customer?.phone` is null (before the query resolves or if missing), `user?.phone` returns `+9595119900` instead of `095119900`. The customer record phone should be the primary source.

2. **Address and township are not displayed**: The user wants `customer.address` and `customer.township` shown on the profile card, but the current UI only shows name, phone, and order count.

## Changes

### `src/pages/ProfilePage.tsx`

**Profile card** — add address and township below the phone number:

```tsx
<p className="text-lg font-bold text-foreground">{displayName}</p>
<p className="text-sm text-muted-foreground">{displayPhone}</p>
{customer?.township && customer?.address && (
  <p className="text-xs text-muted-foreground mt-0.5">
    {customer.address}, {customer.township}
  </p>
)}
<div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
  <Star ... />
  <span>{completedCount} orders completed</span>
</div>
```

**Delivery Addresses menu item** — show the customer's township as a badge:

```tsx
{ icon: MapPin, label: "Delivery Addresses", badge: customer?.township ?? "" },
```

No other files need changes. The `useCustomerProfile` hook and RLS policy (`customers_select_own_customer: auth_user_id = auth.uid()`) are already correct. If the profile still shows "Guest" after this change, it means the `auth_user_id` column on the customer record isn't set — which is a data/linking issue, not a code issue.

| File | Change |
|------|--------|
| `src/pages/ProfilePage.tsx` | Add address/township display, show township badge on Delivery Addresses |

