import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCylinderTypes } from "@/hooks/useCylinderTypes";
import { useGasPrices } from "@/hooks/useGasPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";

const OrderConfigure = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);
  const { data: cylinderTypes, isLoading: loadingCylinders } = useCylinderTypes();
  const { data: gasPrices, isLoading: loadingPrices } = useGasPrices();

  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<"refill" | "new">("refill");
  const [quantity, setQuantity] = useState(1);

  const isLoading = loadingCylinders || loadingPrices;

  // Auto-select first size
  const activeSizeId = selectedSizeId ?? cylinderTypes?.[0]?.id ?? null;
  const selectedSize = cylinderTypes?.find((ct) => ct.id === activeSizeId) ?? null;

  // Brands with active pricing
  const availableBrands = useMemo(() => {
    if (!gasPrices) return [];
    // Dedupe by brand — one price entry per brand (effective_to is null)
    const seen = new Set<string>();
    return gasPrices.filter((gp) => {
      if (!gp.brands || seen.has(gp.brand_id)) return false;
      seen.add(gp.brand_id);
      return true;
    });
  }, [gasPrices]);

  // Auto-select brand when only one option, or reset when size changes
  useEffect(() => {
    if (availableBrands.length === 1) {
      setSelectedBrandId(availableBrands[0].brand_id);
    }
  }, [availableBrands]);

  const activeBrandId = selectedBrandId ?? (availableBrands.length === 1 ? availableBrands[0]?.brand_id : null);
  const selectedBrandPrice = gasPrices?.find((gp) => gp.brand_id === activeBrandId) ?? null;

  // Price calculation
  const pricing = useMemo(() => {
    if (!selectedSize || !selectedBrandPrice) return null;
    const refillPrice = selectedSize.size_kg * selectedBrandPrice.price_per_kg;
    const newPrice = refillPrice + selectedSize.cylinder_price;
    return { refill: refillPrice, new: newPrice };
  }, [selectedSize, selectedBrandPrice]);

  const unitPrice = pricing ? (deliveryType === "refill" ? pricing.refill : pricing.new) : 0;
  const total = unitPrice * quantity;
  const canConfirm = !!selectedSize && !!activeBrandId && !!pricing;
  const showBrandSelector = availableBrands.length > 1;

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
              <p className="font-semibold text-foreground">{customer?.township ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{customer?.address ?? "No address on file"}</p>
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
          ) : !cylinderTypes?.length ? (
            <p className="py-8 text-center text-muted-foreground">No gas sizes available</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {cylinderTypes.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => setSelectedSizeId(ct.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all active:scale-95",
                    activeSizeId === ct.id
                      ? "border-action bg-action-light shadow-sm"
                      : "border-border bg-card"
                  )}
                >
                  <span className="text-xl font-bold text-foreground">{ct.display_name}</span>
                  <span className="text-xs text-muted-foreground">{ct.size_kg} kg</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Brand Selector — only when multiple brands exist */}
        {showBrandSelector && (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Brand</h2>
            <div className="grid grid-cols-2 gap-3">
              {availableBrands.map((gp) => {
                const brandName = gp.brands?.name ?? "Unknown";
                const priceForSize = selectedSize
                  ? (selectedSize.size_kg * gp.price_per_kg).toLocaleString()
                  : "—";
                return (
                  <button
                    key={gp.brand_id}
                    onClick={() => setSelectedBrandId(gp.brand_id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all active:scale-95",
                      activeBrandId === gp.brand_id
                        ? "border-action bg-action-light shadow-sm"
                        : "border-border bg-card"
                    )}
                  >
                    <span className="font-bold text-foreground">{brandName}</span>
                    <span className="text-xs text-muted-foreground">{priceForSize} Ks/refill</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

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
              {pricing && (
                <span className="text-xs font-semibold text-action">{pricing.refill.toLocaleString()} Ks</span>
              )}
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
              <span className="font-bold text-foreground">New Cylinder</span>
              {pricing && (
                <span className="text-xs font-semibold text-action">{pricing.new.toLocaleString()} Ks</span>
              )}
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
          <Button
            variant="action"
            size="full"
            onClick={() =>
              navigate("/order/confirm", {
                state: {
                  cylinderType: selectedSize!.display_name,
                  sizeKg: selectedSize!.size_kg,
                  brandId: activeBrandId,
                  brandName: selectedBrandPrice?.brands?.name ?? "",
                  orderType: deliveryType,
                  quantity,
                  unitPrice,
                  gasSubtotal: unitPrice * quantity,
                  cylinderSubtotal:
                    deliveryType === "new"
                      ? selectedSize!.cylinder_price * quantity
                      : 0,
                  deliveryFee: 0,
                  totalAmount: total,
                  gasPricePerKg: selectedBrandPrice?.price_per_kg ?? 0,
                },
              })
            }
            disabled={!canConfirm}
          >
            CONFIRM ORDER
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfigure;
