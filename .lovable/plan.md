

# Match Lovable App to Rork Play Store Version

## 6 changes across 6 files

### 1. `src/hooks/useCylinderTypes.ts` — Add `image_url`
- Add `image_url: string | null` to interface
- Add `image_url` to `.select()` string

### 2. `src/pages/OrderConfigure.tsx` — Major UI overhaul

**a) Brand selector → large cards with logos**
- Import `useBrands` hook to get `logo_url` (currently uses gasPrices which lacks logos)
- Replace horizontal pill row with 2-column grid of cards
- Show `logo_url` image (120px height, object-contain), brand name below
- Fallback: first letter in colored circle if no logo
- Display "Any Brands" instead of "Other Partners"

**b) Cylinder cards → product photos**
- Show `cylinder.image_url` as `<img className="h-20 w-20 object-contain">` instead of 🧯 emoji
- Fallback to Package icon

**c) Add Exchange order type**
- Change `deliveryType` state to `"refill" | "new" | "exchange"`
- Add third tab: "🔄 Exchange"
- **Pricing is identical to Refill**: `gas_price = price_per_kg × size_kg`, delivery fee = 3,000 MMK, no cylinder deposit
- `deliveryFee`: refill = 3000, exchange = 3000, new = 0
- When navigating to confirm with exchange: map to `orderType: "refill"` and prepend `deliveryInstructions: "Exchange order"`

**d) "Delivering to" bar**
- Green bar with MapPin + Check showing `customer.address, customer.township` above order type tabs

**e) Step indicator**
- Simple 2-dot indicator: "Configure" (active) → "Confirm"

**f) Price format: all `} K` → `} MMK`** (lines 198, 204, 210)

### 3. `src/pages/OrderConfirm.tsx` — UI updates

**a) OrderState interface** — add `deliveryInstructions?: string`
**b) Exchange type display** — show "Exchange Old Cylinder" in summary
**c) "Delivering to" bar** — same green bar
**d) Step indicator** — dot 2 active
**e) Handle exchange deliveryInstructions** — prepend "Exchange order" to any user instructions when sending to Edge Function
**f) Price format: all `} K` → `} MMK`** (lines 120, 125, 131, 138, 206)

### 4. `src/pages/OrdersPage.tsx` — `} K` → `} MMK` (line 117)

### 5. `src/pages/OrderSuccess.tsx` — `} K` → `} MMK` (line 37)

### 6. `src/pages/OrderTracking.tsx` — `} K` → `} MMK` (line 285)

### Pricing model (corrected)

| Order Type | Gas Price | Cylinder Price | Delivery Fee |
|---|---|---|---|
| Refill | price_per_kg × size | 0 | 3,000 |
| New Cylinder | price_per_kg × size | cylinder_price | Free |
| Exchange | price_per_kg × size | 0 | 3,000 |

Exchange = same as Refill pricing. Backend receives `orderType: "refill"` + `deliveryInstructions: "Exchange order"`.

### Not changed
- Edge Function calls/payloads (exchange maps to refill)
- Supabase queries
- KBZ Pay detection
- Auth/login flow

