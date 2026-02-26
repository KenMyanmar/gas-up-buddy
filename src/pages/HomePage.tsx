import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Flame, MapPin, ClipboardList, Phone, HelpCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useCustomerProfile } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);
  const { data: orders } = useOrders(customer?.id);

  const lastOrder = orders?.[0];
  const initial = customer?.full_name?.charAt(0)?.toUpperCase() ?? "A";

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between bg-primary px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-primary-foreground">AnyGas 8484</span>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-sm font-bold text-primary-foreground"
        >
          {initial}
        </button>
      </header>

      {/* Location Bar */}
      <div className="flex items-center gap-2 bg-card px-5 py-2.5 border-t border-border">
        <MapPin className="h-4 w-4 text-action" />
        <span className="text-sm font-medium text-foreground">
          {customer?.address ? customer.address : "Hlaing Township, Yangon"}
        </span>
        <button className="ml-auto text-xs font-semibold text-primary">Change</button>
      </div>

      {/* Active Order Banner */}
      {activeOrder && (
        <button
          onClick={() => navigate(`/order/tracking/${activeOrder.id}`)}
          className="mx-5 mt-3 flex items-center justify-between rounded-xl border border-action/20 bg-action-light p-4"
        >
          <div>
            <p className="text-sm font-bold text-action">
              🔶 {activeOrder.status === "dispatched" ? "On the Way" : activeOrder.status === "confirmed" ? "Agent Assigned" : "Finding Agent..."}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activeOrder.cylinder_type ?? "Gas"} · {(activeOrder.total_amount ?? 0).toLocaleString()} MMK
            </p>
          </div>
          <span className="text-sm font-bold text-action">Track →</span>
        </button>
      )}

      <div className="space-y-4 px-5 pt-5">
        {/* Hero Button */}
        <Button
          variant="hero"
          size="xl"
          className="w-full flex-col gap-1 rounded-2xl py-8"
          onClick={() => navigate("/order/configure")}
        >
          <span className="text-2xl">🔥 ORDER GAS NOW</span>
          {lastOrder ? (
            <span className="text-sm font-normal opacity-90">
              {lastOrder.cylinder_type ?? "?"} · {lastOrder.order_type ?? "refill"} · {(lastOrder.total_amount ?? 0).toLocaleString()} MMK
            </span>
          ) : (
            <span className="text-sm font-normal opacity-90">Fast delivery to your door</span>
          )}
        </Button>

        {/* Order Again Card */}
        {lastOrder && (
          <button
            onClick={() => navigate("/order/configure")}
            className="w-full rounded-xl border-2 border-action bg-action-light p-4 text-left transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-action" />
              <div>
                <p className="font-bold text-foreground">Order Again</p>
                <p className="text-sm text-muted-foreground">
                  Last order: {lastOrder.cylinder_type ?? "?"} · {new Date(lastOrder.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: ClipboardList, label: "My Orders", path: "/orders" },
            { icon: Phone, label: "Call 8484", href: "tel:8484" },
            { icon: HelpCircle, label: "Help", path: "/profile" },
          ].map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm transition-transform active:scale-[0.97]"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">{item.label}</span>
              </a>
            ) : (
              <button
                key={item.label}
                onClick={() => navigate(item.path!)}
                className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm transition-transform active:scale-[0.97]"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">{item.label}</span>
              </button>
            )
          )}
        </div>

        {/* Promo Cards */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Tips & Promos</h2>
          {[
            { emoji: "🎁", title: "Refer a friend", desc: "Get 1,000 Ks off your next order" },
            { emoji: "🔒", title: "Gas Safety Tip", desc: "Always check cylinder seal before use" },
          ].map((promo) => (
            <div key={promo.title} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm">
              <span className="text-2xl">{promo.emoji}</span>
              <div>
                <p className="font-bold text-foreground">{promo.title}</p>
                <p className="text-sm text-muted-foreground">{promo.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
