import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, MapPin, Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCylinderTypes } from "@/hooks/useCylinderTypes";
import { useGasPrices } from "@/hooks/useGasPrices";
import { useBrands } from "@/hooks/useBrands";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";

const brandColors = ["#E65100", "#1565C0", "#2E7D32", "#6A1B9A", "#C62828", "#00838F"];

const OrderConfigure = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);
  const { data: cylinderTypes, isLoading: loadingCylinders } = useCylinderTypes();
  const { data: gasPrices, isLoading: loadingPrices } = useGasPrices();
  const { data: brands } = useBrands();

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

  // Build a map of brand_id → Brand for logo lookup
  const brandMap = useMemo(() => {
    const map = new Map<string, { name: string; logo_url: string | null }>();
    brands?.forEach((b) => map.set(b.id, { name: b.name, logo_url: b.logo_url }));
    return map;
  }, [brands]);

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
    return { refill: refillPrice, new: newPrice, exchange: refillPrice };
  }, [selectedSize, selectedBrandPrice]);

  const unitPrice = pricing ? pricing[deliveryType] : 0;
  const deliveryFee = deliveryType === "new" ? 0 : 3000;
  const total = unitPrice * quantity + deliveryFee;
  const canConfirm = !!selectedSize && !!activeBrandId && !!pricing;
  const showBrandSelector = availableBrands.length > 1;

  const getDisplayBrandName = (name: string) => name === "Other Partners" ? "Any Brands" : name;

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
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-action" />
            <span className="text-xs font-bold text-action">Configure</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="text-xs font-bold text-muted-foreground">Confirm</span>
          </div>
        </div>

        {/* Delivering To Bar */}
        {customer?.address && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Delivering to</p>
              <p className="text-sm text-foreground truncate">{customer.address}, {customer.township}</p>
            </div>
            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
          </div>
        )}

        {/* Order Type Tabs */}
        <div className="flex gap-1 rounded-[14px] bg-bg-warm p-1">
          {[
            { key: "refill" as const, label: "🔄 Refill" },
            { key: "new" as const, label: "🆕 New Setup" },
            { key: "exchange" as const, label: "🔁 Exchange" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDeliveryType(tab.key)}
              className={cn(
                "flex-1 rounded-[10px] py-3 text-[12px] font-bold transition-all",
                deliveryType === tab.key
                  ? "bg-card text-action shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Brand Selector — Large Cards */}
        {showBrandSelector && (
          <section>
            <h2 className="mb-3 text-base font-extrabold text-foreground">Brand</h2>
            <div className="grid grid-cols-2 gap-3">
              {availableBrands.map((gp, index) => {
                const brandInfo = brandMap.get(gp.brand_id);
                const brandName = getDisplayBrandName(brandInfo?.name ?? gp.brands?.name ?? "Unknown");
                const logoUrl = brandInfo?.logo_url ?? null;
                const isSelected = activeBrandId === gp.brand_id;
                const colorIndex = index % brandColors.length;
                return (
                  <button
                    key={gp.brand_id}
                    onClick={() => setSelectedBrandId(gp.brand_id)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-[20px] border-2 p-4 transition-all active:scale-95",
                      isSelected
                        ? "border-action bg-surface-warm shadow-md"
                        : "border-border bg-card shadow-sm"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-action text-[11px] font-extrabold text-white">✓</span>
                    )}
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={brandName}
                        className="h-[120px] w-full object-contain"
                      />
                    ) : (
                      <div
                        className="flex h-[120px] w-full items-center justify-center rounded-2xl"
                        style={{ backgroundColor: `${brandColors[colorIndex]}15` }}
                      >
                        <span
                          className="text-4xl font-black"
                          style={{ color: brandColors[colorIndex] }}
                        >
                          {brandName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-bold text-foreground text-center leading-tight">{brandName}</span>
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
                  : null;
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
                    {ct.image_url ? (
                      <img src={ct.image_url} alt={ct.display_name} className="h-20 w-20 object-contain" />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground" />
                    )}
                    <span className="font-display text-[22px] font-black text-foreground">{ct.size_kg}</span>
                    <span className="text-[11px] font-bold text-muted-foreground">kg</span>
                    {priceForSize ? (
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
              <span className="text-sm font-bold text-foreground">{(unitPrice * quantity).toLocaleString()} MMK</span>
            </div>
            <div className="h-px bg-divider my-2" />
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[13px] font-semibold text-muted-foreground">Delivery</span>
              <span className={cn("text-xs font-extrabold", deliveryFee > 0 ? "text-foreground" : "text-success")}>
                {deliveryFee > 0 ? `${deliveryFee.toLocaleString()} MMK` : "Free"}
              </span>
            </div>
            <div className="h-px bg-divider my-2" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-extrabold text-foreground">Total</span>
              <span className="font-display text-[22px] font-black text-action">{total.toLocaleString()} MMK</span>
            </div>
          </div>
          <Button
            variant="action"
            size="full"
            onClick={() => {
              const isExchange = deliveryType === "exchange";
              navigate("/order/confirm", {
                state: {
                  cylinderType: selectedSize!.display_name,
                  sizeKg: selectedSize!.size_kg,
                  brandId: activeBrandId,
                  brandName: selectedBrandPrice?.brands?.name ?? "",
                  orderType: isExchange ? "refill" : deliveryType,
                  displayOrderType: deliveryType,
                  quantity,
                  unitPrice,
                  gasSubtotal: unitPrice * quantity,
                  cylinderSubtotal: deliveryType === "new" ? selectedSize!.cylinder_price * quantity : 0,
                  deliveryFee,
                  totalAmount: total,
                  gasPricePerKg: selectedBrandPrice?.price_per_kg ?? 0,
                  deliveryInstructions: isExchange ? "Exchange order" : undefined,
                },
              });
            }}
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
