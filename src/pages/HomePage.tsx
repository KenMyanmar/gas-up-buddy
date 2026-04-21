import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useCustomerProfile } from "@/hooks/useOrders";
import { useBrands } from "@/hooks/useBrands";
import { supabase } from "@/integrations/supabase/client";
import HomeBannerCarousel from "@/components/HomeBannerCarousel";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("cid");
  const location = useLocation();
  const stateCustomer = (location.state as any)?.customer;
  const { data: fetchedCustomer } = useCustomerProfile(user?.id);
  const customer =
    stateCustomer ??
    fetchedCustomer ??
    (urlCustomerId ? ({ id: urlCustomerId } as any) : undefined);
  const { data: orders } = useOrders(customer?.id);
  const { data: brands } = useBrands();
  const [orderTab, setOrderTab] = useState<"refill" | "new">("refill");

  const { data: activeOrder } = useQuery({
    queryKey: ["active-order", customer?.id],
    queryFn: async () => {
      if (!customer?.id) return null;
      const { data } = await supabase
        .from("orders")
        .select("id, status, cylinder_type, total_amount, created_at")
        .eq("customer_id", customer.id)
        .in("status", ["new", "in_progress", "dispatched"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!customer?.id,
    refetchInterval: 30000,
  });

  const activeStatusLabel = activeOrder
    ? activeOrder.status === "dispatched"
      ? "On the Way 🚚"
      : activeOrder.status === "in_progress"
      ? "Accepted ✓"
      : "Placed 📝"
    : "";

  const filteredBrands = brands?.filter((b) =>
    orderTab === "new" ? b.allow_new_setup : true
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Orange Header Bar */}
      <div className="gradient-hero px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-white" />
          <span className="font-display text-xl font-black text-white tracking-tight">AnyGas 8484</span>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Active Order Banner */}
        {activeOrder && (
          <button
            onClick={() =>
              navigate(
                `/order/tracking/${activeOrder.id}${urlCustomerId ? `?cid=${urlCustomerId}` : ""}`,
                { state: { customer } }
              )
            }
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-action/30 bg-action-light p-4 text-left animate-pulse-border"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-action text-white text-xl flex-shrink-0">
              🚛
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-action-dark">{activeStatusLabel}</p>
              <p className="text-xs font-semibold text-muted-foreground">
                {activeOrder.cylinder_type ?? "Gas"} · Tap to track
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-action flex-shrink-0" />
          </button>
        )}

        {/* Big ORDER GAS NOW Hero Button */}
        <button
          onClick={() =>
            navigate(
              `/order/configure${urlCustomerId ? `?cid=${urlCustomerId}` : ""}`,
              { state: { customer } }
            )
          }
          className="relative w-full overflow-hidden rounded-3xl gradient-hero p-8 text-left shadow-hero transition-transform active:scale-[0.98]"
        >
          <div className="pointer-events-none absolute inset-0" style={{
            background: "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 16px)"
          }} />
          <span className="pointer-events-none absolute -right-4 -bottom-4 text-[100px] opacity-[0.12]">🔥</span>
          <h2 className="relative z-10 font-display text-3xl font-black text-white leading-tight">
            ORDER GAS<br />NOW
          </h2>
          <p className="relative z-10 mt-2 text-sm font-semibold text-white/80">Fast delivery to your door</p>
          <div className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-action shadow-lg">
            Order Now
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-action text-white text-xs">→</span>
          </div>
        </button>

        {/* Our Brands Section */}
        {brands && brands.length > 0 && (
          <div>
            <h2 className="text-base font-extrabold text-foreground mb-3">Our Brands</h2>

            {/* Refill / New Setup Tabs */}
            <div className="flex gap-1 rounded-[14px] bg-bg-warm p-1 mb-3">
              {[
                { key: "refill" as const, label: "🔄 Refill" },
                { key: "new" as const, label: "🆕 New Setup" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setOrderTab(tab.key)}
                  className={cn(
                    "flex-1 rounded-[10px] py-2.5 text-[12px] font-bold transition-all",
                    orderTab === tab.key
                      ? "bg-card text-action shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {filteredBrands?.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() =>
                    navigate(
                      `/order/configure${urlCustomerId ? `?cid=${urlCustomerId}` : ""}`,
                      { state: { brandId: brand.id, orderType: orderTab, customer } }
                    )
                  }
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 shadow-sm transition-all active:scale-95 hover:border-action hover:shadow-md"
                >
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-12 w-12 rounded-xl object-contain mb-2"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-action/10 text-xl font-black text-action mb-2">
                      {brand.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-xs font-bold text-foreground text-center truncate w-full">{brand.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Banner Carousel */}
        <div className="rounded-2xl overflow-hidden">
          <HomeBannerCarousel />
        </div>

        {/* Quick Actions — only My Orders */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() =>
              navigate(`/orders${urlCustomerId ? `?cid=${urlCustomerId}` : ""}`, {
                state: { customer },
              })
            }
            className="flex items-center gap-3 rounded-[20px] border border-border bg-card p-4 shadow-sm text-left transition-all hover:border-action hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-bg-warm text-[22px]">
              📋
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">My Orders</p>
              <p className="text-[11px] font-semibold text-muted-foreground">Track & history</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
