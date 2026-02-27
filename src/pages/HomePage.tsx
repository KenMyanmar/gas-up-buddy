import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bell, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useCustomerProfile } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);
  const { data: orders } = useOrders(customer?.id);

  const lastOrder = orders?.[0];
  const displayName = customer?.full_name ?? "there";

  const { data: activeOrder } = useQuery({
    queryKey: ["active-order", customer?.id],
    queryFn: async () => {
      if (!customer?.id) return null;
      const { data } = await supabase
        .from("orders")
        .select("id, status, cylinder_type, total_amount, created_at")
        .eq("customer_id", customer.id)
        .in("status", ["new", "confirmed", "dispatched", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!customer?.id,
    refetchInterval: 30000,
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-5 space-y-4">
        {/* Greeting Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">{greeting} 👋</p>
            <h1 className="font-display text-[22px] font-extrabold text-foreground">{displayName}</h1>
          </div>
          <button className="relative flex h-11 w-11 items-center justify-center rounded-[14px] border border-border bg-card shadow-sm">
            <Bell className="h-[18px] w-[18px] text-muted-foreground" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
          </button>
        </div>

        {/* Delivery Address Bar */}
        <button
          className="flex w-full items-center gap-2.5 rounded-[14px] border border-border bg-card p-3 shadow-sm text-left"
          onClick={() => {}}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-action/10 text-base flex-shrink-0">
            📍
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground">Deliver to</p>
            <p className="text-[13px] font-bold text-foreground truncate">
              {customer?.township ?? "Hlaing Township"}, Yangon ▾
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </button>

        {/* Hero CTA Card */}
        <button
          onClick={() => navigate("/order/configure")}
          className="relative w-full overflow-hidden rounded-[28px] gradient-hero p-6 text-left shadow-hero transition-transform active:scale-[0.99]"
        >
          <span className="pointer-events-none absolute -right-2 -top-2 text-[90px] opacity-[0.15]">🍳</span>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[60px]" style={{
            background: "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 16px)"
          }} />
          <h2 className="relative z-10 font-display text-2xl font-black text-white">Order Gas Now</h2>
          <p className="relative z-10 mt-1 text-sm font-semibold text-white/90">Keep your kitchen cooking!</p>
          <div className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-extrabold text-white backdrop-blur-sm">
            Order Now
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs">→</span>
          </div>
        </button>

        {/* Active Order Banner */}
        {activeOrder && (
          <button
            onClick={() => navigate(`/order/tracking/${activeOrder.id}`)}
            className="flex w-full items-center gap-3 rounded-[14px] border-[1.5px] bg-action-light p-3.5 text-left animate-pulse-border"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-action text-white text-lg flex-shrink-0">
              🚛
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-action-dark">
                {activeOrder.status === "dispatched" ? "Order on the way!" : activeOrder.status === "confirmed" ? "Agent Assigned" : "Finding Agent..."}
              </p>
              <p className="text-[11px] font-semibold text-muted-foreground">
                {activeOrder.cylinder_type ?? "Gas"} · ETA ~18 min
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-action flex-shrink-0" />
          </button>
        )}

        {/* Quick Actions Grid */}
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
                <a
                  key={item.title}
                  href={item.href}
                  className="rounded-[20px] border border-border bg-card p-4 shadow-sm transition-all hover:border-action hover:shadow-md hover:-translate-y-0.5"
                >
                  {inner}
                </a>
              );
            }
            return (
              <button
                key={item.title}
                onClick={item.onClick}
                className="rounded-[20px] border border-border bg-card p-4 shadow-sm text-left transition-all hover:border-action hover:shadow-md hover:-translate-y-0.5"
              >
                {inner}
              </button>
            );
          })}
        </div>

        {/* Promo Card */}
        <button className="flex w-full items-center gap-3.5 rounded-[14px] border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 p-3.5 text-left">
          <span className="text-[28px]">🎉</span>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-amber-900">Free Delivery This Week!</p>
            <p className="text-[11px] font-semibold text-amber-700">No minimum order required</p>
          </div>
          <ChevronRight className="h-4 w-4 text-amber-600 flex-shrink-0" />
        </button>

        {/* Tips & Safety */}
        <div>
          <h2 className="text-base font-extrabold text-foreground mb-3">🍽️ Tips & Safety</h2>
          {[
            { emoji: "🔥", title: "LPG Safety Guide", desc: "Important tips for safe gas usage" },
            { emoji: "👨‍🍳", title: "Cooking Tips", desc: "Get the most from your cylinder" },
          ].map((tip) => (
            <button key={tip.title} className="mb-2.5 flex w-full items-center gap-3 rounded-[14px] border border-border bg-card p-3.5 shadow-sm text-left transition-all hover:border-action">
              <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-foreground">{tip.title}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">{tip.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
