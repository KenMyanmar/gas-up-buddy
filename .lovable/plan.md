

# Remove Exchange Tab from OrderConfigure

## 2 files to change

### 1. `src/pages/OrderConfigure.tsx`
- Remove the "Exchange" tab from the order type selector (keep only Refill and New Setup)
- Remove exchange-related pricing logic (`deliveryType === "exchange"` branches)
- Remove exchange-related state handling and navigation params (`deliveryInstructions: "Exchange order"`)
- Revert `deliveryType` type back to `"refill" | "new"`

### 2. `src/pages/OrderConfirm.tsx`
- Remove exchange display logic ("Exchange Old Cylinder" label, exchange-specific instruction prepending)
- Clean up any exchange references in the OrderState interface

No backend or other file changes needed.

