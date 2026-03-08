import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus } from "lucide-react";
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
  const activeSizeId = selectedSizeId ?? cylinderTypes?.[0]?.id ?? null;
  const selectedSize = cylinderTypes?.find((ct) => ct.id === activeSizeId) ?? null;

  const availableBrands = useMemo(() => {
    if (!gasPrices) return [];
    const seen = new Set<string>();
    return gasPrices.filter((gp) => {
      if (!gp.brands || seen.has(gp.brand_id)) return false;
      seen.add(gp.brand_id);
      return true;
    });
  }, [gasPrices]);

  useEffect(() => {
    if (availableBrands.length >= 1 && !selectedBrandId) {
      setSelectedBrandId(availableBrands[0].brand_id);
    }
  }, [availableBrands, selectedBrandId]);

  const activeBrandId = selectedBrandId ?? (availableBrands.length === 1 ? availableBrands[0]?.brand_id : null);
  const selectedBrandPrice = gasPrices?.find((gp) => gp.brand_id === activeBrandId) ?? null;

  const pricing = useMemo(() => {
    if (!selectedSize || !selectedBrandPrice) return null;
    const refillPrice = selectedSize.size_kg * selectedBrandPrice.price_per_kg;
    const newPrice = refillPrice + selectedSize.cylinder_price;
    return { refill: refillPrice, new: newPrice };
  }, [selectedSize, selectedBrandPrice]);

  const unitPrice = pricing ? (deliveryType === "refill" ? pricing.refill : pricing.new) : 0;
  const deliveryFee = deliveryType === "refill" ? 3000 : 0;
  const total = unitPrice * quantity + deliveryFee;
  const canConfirm = !!selectedSize && !!activeBrandId && !!pricing;
  const showBrandSelector = availableBrands.length > 1;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-36">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={() => navigate("/home")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-display text-[22px] font-extrabold text-foreground flex-1">🔥 Order Gas</h1>
      </div>

      <div className="space-y-5 px-5">
        {/* Order Type Tabs */}
        <div className="flex gap-2 rounded-[14px] bg-bg-warm p-1">
          {[
            { key: "refill" as const, label: "🔄 Refill", },
            { key: "new" as const, label: "🆕 New Setup", },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDeliveryType(tab.key)}
              className={cn(
                "flex-1 rounded-[10px] py-3 text-[13px] font-bold transition-all",
                deliveryType === tab.key
                  ? "bg-card text-action shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Brand Selector */}
        {showBrandSelector && (
          <section>
            <h2 className="mb-3 text-base font-extrabold text-foreground">Brand</h2>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {availableBrands.map((gp) => {
                const brandName = gp.brands?.name ?? "Unknown";
                return (
                  <button
                    key={gp.brand_id}
                    onClick={() => setSelectedBrandId(gp.brand_id)}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-4 py-2.5 text-[13px] font-bold transition-all flex-shrink-0",
                      activeBrandId === gp.brand_id
                        ? "border-action bg-action/10 text-action"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", activeBrandId === gp.brand_id ? "bg-action" : "bg-muted-foreground/30")} />
                    {brandName}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Cylinder Size */}
        <section>
          <h2 className="mb-3 text-base font-extrabold text-foreground">Cylinder Size</h2>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-[20px]" />
              ))}
            </div>
          ) : !cylinderTypes?.length ? (
            <p className="py-8 text-center text-muted-foreground">No gas sizes available</p>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {cylinderTypes.map((ct) => {
                const isSelected = activeSizeId === ct.id;
                const priceForSize = selectedBrandPrice
                  ? (ct.size_kg * selectedBrandPrice.price_per_kg + (deliveryType === "new" ? ct.cylinder_price : 0)).toLocaleString()
                  : "—";
                return (
                  <button
                    key={ct.id}
                    onClick={() => setSelectedSizeId(ct.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 rounded-[20px] border-2 p-4 transition-all active:scale-95",
                      isSelected
                        ? "border-action bg-surface-warm shadow-md"
                        : "border-border bg-card shadow-sm"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-action text-[11px] font-extrabold text-white">✓</span>
                    )}
                    <span className="text-[26px]">🧯</span>
                    <span className="font-display text-[22px] font-black text-foreground">{ct.size_kg}</span>
                    <span className="text-[11px] font-bold text-muted-foreground">kg</span>
                    {selectedBrandPrice ? (
                      <span className="text-xs font-extrabold text-action mt-1">{priceForSize} MMK</span>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground mt-1">Select brand</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Quantity */}
        <section>
          <div className="flex items-center justify-between rounded-[14px] border border-border bg-card p-4">
            <span className="text-sm font-bold text-foreground">Quantity</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] border-border-strong bg-card text-lg font-bold text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-display text-xl font-extrabold text-foreground min-w-[28px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(5, quantity + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] border-border-strong bg-card text-lg font-bold text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-divider bg-card px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-md">
          <div className="rounded-[20px] border border-border bg-card p-4 mb-3 shadow-sm">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[13px] font-semibold text-muted-foreground">Gas × {quantity}</span>
              <span className="text-sm font-bold text-foreground">{(unitPrice * quantity).toLocaleString()} K</span>
            </div>
            <div className="h-px bg-divider my-2" />
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[13px] font-semibold text-muted-foreground">Delivery</span>
              <span className={cn("text-xs font-extrabold", deliveryFee > 0 ? "text-foreground" : "text-success")}>
                {deliveryFee > 0 ? `${deliveryFee.toLocaleString()} K` : "Free"}
              </span>
            </div>
            <div className="h-px bg-divider my-2" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-extrabold text-foreground">Total</span>
              <span className="font-display text-[22px] font-black text-action">{total.toLocaleString()} K</span>
            </div>
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
                  cylinderSubtotal: deliveryType === "new" ? selectedSize!.cylinder_price * quantity : 0,
                  deliveryFee,
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
