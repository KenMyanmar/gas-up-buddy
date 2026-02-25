import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCylinderTypes } from "@/hooks/useCylinderTypes";
import { useGasPrices } from "@/hooks/useGasPrices";
import { Skeleton } from "@/components/ui/skeleton";

const OrderConfigure = () => {
  const navigate = useNavigate();
  const { data: cylinderTypes, isLoading: loadingCylinders } = useCylinderTypes();
  const { data: gasPrices, isLoading: loadingPrices } = useGasPrices();

  const [selectedCylinderId, setSelectedCylinderId] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<"refill" | "new">("refill");
  const [quantity, setQuantity] = useState(1);

  // Join cylinder types with their current prices
  const gasSizes = useMemo(() => {
    if (!cylinderTypes || !gasPrices) return [];
    return cylinderTypes.map((ct) => {
      const priceRecord = gasPrices.find((gp) => gp.cylinder_type_id === ct.id);
      return {
        id: ct.id,
        kg: ct.weight_kg,
        price: priceRecord?.price ?? 0,
        brand: ct.brands?.name ?? "Unknown",
      };
    }).sort((a, b) => a.kg - b.kg);
  }, [cylinderTypes, gasPrices]);

  // Auto-select first item
  const selectedId = selectedCylinderId ?? gasSizes[0]?.id ?? null;
  const selected = gasSizes.find((g) => g.id === selectedId);
  const total = selected ? selected.price * quantity : 0;

  const isLoading = loadingCylinders || loadingPrices;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      {/* Header */}
      <header className="flex items-center gap-3 bg-card px-5 py-4 shadow-sm">
        <button onClick={() => navigate("/home")} className="text-muted-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Configure Order</h1>
      </header>

      <div className="space-y-6 px-5 pt-5">
        {/* Delivery Location */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Delivery Location</h2>
          <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
            <MapPin className="h-5 w-5 shrink-0 text-action" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Hlaing Township</p>
              <p className="text-sm text-muted-foreground">No. 42, Pyay Road, Yangon</p>
            </div>
            <button className="text-xs font-semibold text-primary">Change</button>
          </div>
        </section>

        {/* Gas Size */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Gas Size</h2>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : gasSizes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No gas sizes available</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {gasSizes.map((gas) => (
                <button
                  key={gas.id}
                  onClick={() => setSelectedCylinderId(gas.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all active:scale-95",
                    selectedId === gas.id
                      ? "border-action bg-action-light shadow-sm"
                      : "border-border bg-card"
                  )}
                >
                  <span className="text-xl font-bold text-foreground">{gas.kg}kg</span>
                  <span className="text-xs text-muted-foreground">{gas.price.toLocaleString()} Ks</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Delivery Type */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Delivery Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDeliveryType("refill")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-95",
                deliveryType === "refill"
                  ? "border-action bg-action-light shadow-sm"
                  : "border-border bg-card"
              )}
            >
              <span className="text-3xl">🔄</span>
              <span className="font-bold text-foreground">Refill</span>
              <span className="text-center text-xs text-muted-foreground">Bring empty, return filled</span>
            </button>
            <button
              onClick={() => setDeliveryType("new")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-95",
                deliveryType === "new"
                  ? "border-action bg-action-light shadow-sm"
                  : "border-border bg-card"
              )}
            >
              <span className="text-3xl">🆕</span>
              <span className="font-bold text-foreground">New</span>
              <span className="text-center text-xs text-muted-foreground">Keep the cylinder</span>
            </button>
          </div>
        </section>

        {/* Quantity */}
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Quantity</h2>
          <div className="flex items-center justify-center gap-6 rounded-xl bg-card p-4 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors active:bg-muted"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="min-w-[3rem] text-center text-2xl font-bold text-foreground">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(5, quantity + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-action text-action-foreground transition-colors active:bg-action-dark"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </section>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-md">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">💰 Total</span>
            <span className="text-xl font-bold text-foreground">{total.toLocaleString()} MMK</span>
          </div>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">🚚 Delivery</span>
            <span className="font-semibold text-action">Free</span>
          </div>
          <Button variant="action" size="full" onClick={() => navigate("/order/confirm")} disabled={!selected}>
            CONFIRM ORDER
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfigure;
