import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, MapPin, Check, Package, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrands } from "@/hooks/useBrands";
import { useBrandProducts } from "@/hooks/useBrandProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AddressGate from "@/components/AddressGate";

const brandColors = ["#E65100", "#1565C0", "#2E7D32", "#6A1B9A", "#C62828", "#00838F"];

const OrderConfigure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("cid");
  const routeState = location.state as { brandId?: string; orderType?: "refill" | "new" } | null;

  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id, urlCustomerId ?? undefined);
  const { data: brands } = useBrands();

  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(routeState?.brandId ?? null);
  const [deliveryType, setDeliveryType] = useState<"refill" | "new">(routeState?.orderType ?? "refill");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAddressGate, setShowAddressGate] = useState(false);

  // Filter brands by delivery type
  const filteredBrands = useMemo(() => {
    if (!brands) return [];
    return deliveryType === "new"
      ? brands.filter((b) => b.allow_new_setup)
      : brands;
  }, [brands, deliveryType]);

  // Auto-select first brand if current selection is invalid
  useEffect(() => {
    if (filteredBrands.length > 0 && !filteredBrands.find((b) => b.id === selectedBrandId)) {
      setSelectedBrandId(filteredBrands[0].id);
    }
  }, [filteredBrands, selectedBrandId]);

  const activeBrandId = selectedBrandId ?? filteredBrands[0]?.id ?? null;
  const selectedBrand = brands?.find((b) => b.id === activeBrandId) ?? null;

  const { data: brandProducts, isLoading: loadingProducts } = useBrandProducts(activeBrandId);

  // Reset product selection when brand changes
  useEffect(() => {
    setSelectedProductId(null);
  }, [activeBrandId]);

  const activeProductId = selectedProductId ?? brandProducts?.[0]?.brand_product_id ?? null;
  const selectedProduct = brandProducts?.find((p) => p.brand_product_id === activeProductId) ?? null;

  const pricing = useMemo(() => {
    if (!selectedProduct || !selectedProduct.price_per_kg) return null;
    const gasPrice = selectedProduct.size_kg * selectedProduct.price_per_kg;
    const cylinderDeposit = deliveryType === "new" ? selectedProduct.cylinder_price : 0;
    return { gasPrice, cylinderDeposit, unitPrice: gasPrice + cylinderDeposit };
  }, [selectedProduct, deliveryType]);

  const deliveryFee = deliveryType === "refill" && selectedBrand
    ? selectedBrand.refill_delivery_fee
    : 0;
  const unitPrice = pricing?.unitPrice ?? 0;
  const total = unitPrice * quantity + deliveryFee;
  const canConfirm = !!selectedProduct && !!activeBrandId && !!pricing;

  const getDisplayBrandName = (name: string) => name === "Other Partners" ? "Any Brands" : name;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-36">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={() => navigate(`/home${location.search}`)}
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

        {/* Brand Selector */}
        {filteredBrands.length > 1 && (
          <section>
            <h2 className="mb-3 text-base font-extrabold text-foreground">Brand</h2>
            <div className="grid grid-cols-2 gap-3">
              {filteredBrands.map((brand, index) => {
                const brandName = getDisplayBrandName(brand.name);
                const isSelected = activeBrandId === brand.id;
                const colorIndex = index % brandColors.length;
                return (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrandId(brand.id)}
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
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
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

        {/* Cylinder Size from brand_products */}
        <section>
          <h2 className="mb-3 text-base font-extrabold text-foreground">Cylinder Size</h2>
          {loadingProducts ? (
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-[20px]" />
              ))}
            </div>
          ) : !brandProducts?.length ? (
            <p className="py-8 text-center text-muted-foreground">No sizes available for this brand</p>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {brandProducts.map((bp) => {
                const isSelected = activeProductId === bp.brand_product_id;
                const priceForSize = bp.price_per_kg
                  ? (bp.size_kg * bp.price_per_kg + (deliveryType === "new" ? bp.cylinder_price : 0)).toLocaleString()
                  : null;
                return (
                  <button
                    key={bp.brand_product_id}
                    onClick={() => setSelectedProductId(bp.brand_product_id)}
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
                    {bp.image_url ? (
                      <img src={bp.image_url} alt={bp.display_name} className="h-20 w-20 object-contain" />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground" />
                    )}
                    <span className="font-display text-[22px] font-black text-foreground">{bp.size_kg}</span>
                    <span className="text-[11px] font-bold text-muted-foreground">kg</span>
                    {priceForSize ? (
                      <span className="text-xs font-extrabold text-action mt-1">{priceForSize} MMK</span>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground mt-1">—</span>
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
              <span className="text-[13px] font-semibold text-muted-foreground flex items-center gap-1">
                Delivery
                {deliveryFee === 6000 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-xs">
                      2-way delivery: we pick up your empty cylinder, refill at the factory, and deliver it back.
                    </TooltipContent>
                  </Tooltip>
                )}
              </span>
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
          <AddressGate open={showAddressGate} onOpenChange={setShowAddressGate}>
            <Button
              variant="action"
              size="full"
              onClick={() => {
                if (!selectedProduct || !selectedBrand) return;
                navigate(`/order/confirm${location.search}`, {
                  state: {
                    cylinderType: selectedProduct.display_name,
                    sizeKg: selectedProduct.size_kg,
                    brandId: activeBrandId,
                    brandName: selectedBrand.name,
                    orderType: deliveryType,
                    quantity,
                    unitPrice,
                    gasSubtotal: (pricing?.gasPrice ?? 0) * quantity,
                    cylinderSubtotal: (pricing?.cylinderDeposit ?? 0) * quantity,
                    deliveryFee,
                    totalAmount: total,
                    gasPricePerKg: selectedProduct.price_per_kg ?? 0,
                  },
                });
              }}
              disabled={!canConfirm}
            >
              CONFIRM ORDER
            </Button>
          </AddressGate>
        </div>
      </div>
    </div>
  );
};

export default OrderConfigure;
