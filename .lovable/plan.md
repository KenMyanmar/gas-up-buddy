

## OrderTracking Fix + Customer-Facing "KBZPay" Brand Rename

### 1. `src/pages/OrderTracking.tsx` — three fixes

**a) Add payment fields to `OrderData` interface (line 40-44):**
```ts
interface OrderData {
  id: string; status: string; cylinder_type: string | null; total_amount: number | null;
  quantity: number; order_type: string | null; township: string; address: string;
  supplier_id: string | null; agent_id: string | null; created_at: string;
  payment_status: string | null;
  payment_method: string | null;
}
```

**b) Update select query (line 89):** add `payment_status, payment_method` to the `.select(...)` string.

**c) Fix `statusSteps` mapping (line 64-69)** — current `in_progress → "Accepted"` and `dispatched → "On the Way"` is wrong. Replace with the spec:
```ts
const statusSteps = [
  { key: "new", label: "Placed", icon: "📝" },
  { key: "confirmed", label: "Accepted", icon: "✓" },
  { key: "in_progress", label: "On the Way", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];
```

**Knock-on cleanup in same file** to stay consistent with the new flow:
- Line 185 `isActive`: change `["confirmed", "dispatched", "in_progress"]` → `["confirmed", "in_progress"]`
- Line 205 status pill ternary: replace `dispatched` reference with `in_progress` for "On the Way"; `confirmed` → "Accepted"
- Line 273 map header: `dispatched` → `in_progress` for "🕐 On the way"

**d) Replace hardcoded "Cash on Delivery" (line 309-311):**
```tsx
<div className="flex justify-between">
  <span className="text-muted-foreground font-semibold">Payment</span>
  <span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-foreground'}`}>
    {order.payment_status === 'paid'
      ? `Paid via ${order.payment_method === 'kbzpay' ? 'KBZPay' : order.payment_method === 'wave' ? 'Wave' : order.payment_method === 'cb_pay' ? 'CB Pay' : 'Cash'}`
      : order.payment_status === 'cod' ? 'Cash on Delivery'
      : 'Payment Pending'}
  </span>
</div>
```

### 2. Global "KBZ Pay" → "KBZPay" rename (customer-facing strings only)

Code identifiers, function names, comments, payment_method values (`kbzpay`, `kbz_pay`), and `client.ts` comment stay untouched. Only user-visible JSX/string-literal text is changed.

| File | Line(s) | Change |
|---|---|---|
| `src/pages/OrderConfirm.tsx` | 273 | Button label `Pay with KBZ Pay …` → `Pay with KBZPay …` |
| `src/pages/PhoneEntry.tsx` | 68 | `Connecting via KBZ Pay...` → `Connecting via KBZPay...` |
| `src/pages/PhoneEntry.tsx` | 94 | `linked to this KBZ Pay number.` → `linked to this KBZPay number.` |
| `src/pages/PhoneEntry.tsx` | 154 | `matching your KBZ Pay number.` → `matching your KBZPay number.` |
| `src/pages/PhoneEntry.tsx` | 200 | `when KBZ Pay asks for permission.` → `when KBZPay asks for permission.` |
| `src/pages/PhoneEntry.tsx` | 235 | `open it again from KBZ Pay.` → `open it again from KBZPay.` |
| `src/pages/KbzProfileComplete.tsx` | 59 | `Welcome via KBZ Pay!` → `Welcome via KBZPay!` |
| `src/pages/ProfilePage.tsx` | 29 | `desc: "KBZ Pay"` → `desc: "KBZPay"` |
| `src/pages/ProfileFAQ.tsx` | 8 | `KBZ Pay and Wave Money support is coming soon.` → `KBZPay and Wave Money support is coming soon.` |
| `src/components/KbzError.tsx` | 26 | `Could not connect to KBZ Pay services.` → `Could not connect to KBZPay services.` |
| `src/components/KbzError.tsx` | 32 | `Unable to verify your KBZ Pay account.` → `Unable to verify your KBZPay account.` |

**Not changed (intentional):**
- Code comments (e.g. `// Custom Storage Adapter for KBZ Pay WebView`, `// 2. Create KBZ Pay payment`)
- Payment-method enum values (`kbzpay`, `kbz_pay`) — DB-bound
- Comments inside `PhoneEntry.tsx` that begin with `//`
- `OrderSuccess.tsx` line 44 (a code comment, not user-visible)

### Files touched
1. `src/pages/OrderTracking.tsx` — fixes 1a/1b/1c/1d + status-flow cleanup
2. `src/pages/OrderConfirm.tsx` — brand rename (1 string)
3. `src/pages/PhoneEntry.tsx` — brand rename (5 strings)
4. `src/pages/KbzProfileComplete.tsx` — brand rename (1 string)
5. `src/pages/ProfilePage.tsx` — brand rename (1 string)
6. `src/pages/ProfileFAQ.tsx` — brand rename (1 string)
7. `src/components/KbzError.tsx` — brand rename (2 strings)

### Out of scope
No DB schema, no edge functions, no payment_method value changes, no agent-facing screens, no comments. No new dependencies.

### Acceptance
- Status timeline reflects `new → confirmed → in_progress → delivered` with correct labels.
- Order with `payment_status='paid'`, `payment_method='kbzpay'` shows green "Paid via KBZPay".
- Order with `payment_status='cod'` shows "Cash on Delivery".
- Order with neither shows "Payment Pending".
- All customer-facing UI displays "KBZPay" (no space). Code/identifiers/DB values unchanged.

