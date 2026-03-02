import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useCustomerProfile } from "@/hooks/useOrders";
import { useBrands } from "@/hooks/useBrands";
import { supabase } from "@/integrations/supabase/client";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);
  const { data: orders } = useOrders(customer?.id);
  const { data: brands } = useBrands();

  const lastOrder = orders?.[0];

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Orange Header Bar */}
      <div className="gradient-hero px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-white" />
          <span className="font-display text-xl font-black text-white tracking-tight">AnyGas 8484</span>
        </div>
        <a href="tel:8484" className="rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
          ☎️ Call 8484
        </a>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Active Order Banner */}
        {activeOrder && (
          <button
            onClick={() => navigate(`/order/tracking/${activeOrder.id}`)}
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
          onClick={() => navigate("/order/configure")}
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
            <div className="grid grid-cols-3 gap-3">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 shadow-sm"
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: "🔄", title: "Order Again", desc: lastOrder ? `${lastOrder.cylinder_type ?? "?"} · ${lastOrder.order_type ?? "refill"}` : "Place a new order", onClick: () => navigate("/order/configure") },
            { emoji: "📋", title: "My Orders", desc: "Track & history", onClick: () => navigate("/orders") },
            { emoji: "🛒", title: "Accessories", desc: "Regulators, hoses", onClick: () => {} },
            { emoji: "☎️", title: "Call 8484", desc: "24/7 support", href: "tel:8484" },
          ].map((item) => {
            const inner = (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-bg-warm text-[22px] mb-2.5">
                  {item.emoji}
                </div>
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">{item.desc}</p>
              </>
            );

            if ('href' in item && item.href) {
              return (
                <a key={item.title} href={item.href} className="rounded-[20px] border border-border bg-card p-4 shadow-sm transition-all hover:border-action hover:shadow-md">
                  {inner}
                </a>
              );
            }
            return (
              <button key={item.title} onClick={item.onClick} className="rounded-[20px] border border-border bg-card p-4 shadow-sm text-left transition-all hover:border-action hover:shadow-md">
                {inner}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
