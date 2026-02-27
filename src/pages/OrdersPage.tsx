import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useCustomerProfile } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = ["All", "Active", "Completed", "Cancelled"];

const statusStyles: Record<string, string> = {
  delivered: "bg-action-light text-action-dark",
  completed: "bg-action-light text-action-dark",
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-amber-50 text-amber-700",
  assigned: "bg-amber-50 text-amber-700",
  in_transit: "bg-amber-50 text-amber-700",
  cancelled: "bg-destructive/10 text-destructive",
};

const activeStatuses = ["new", "pending", "confirmed", "assigned", "in_transit", "dispatched", "in_progress"];

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);
  const { data: orders, isLoading } = useOrders(customer?.id);

  const filtered = (orders ?? []).filter((o) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return activeStatuses.includes(o.status);
    if (activeTab === "Completed") return o.status === "delivered" || o.status === "completed";
    if (activeTab === "Cancelled") return o.status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-display text-xl font-extrabold text-foreground">My Orders</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold transition-all border-[1.5px]",
              activeTab === tab
                ? "bg-action border-action text-action-foreground"
                : "bg-card border-border text-muted-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3 px-5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[20px]" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-muted-foreground">No orders yet</p>
            <button onClick={() => navigate("/home")} className="mt-2 font-bold text-action">
              Place your first order!
            </button>
          </div>
        ) : (
          filtered.map((order) => (
            <div
              key={order.id}
              className="rounded-[20px] border border-border bg-card p-4 shadow-sm cursor-pointer transition-all hover:shadow-md"
              onClick={() => {
                if (activeStatuses.includes(order.status)) {
                  navigate(`/order/tracking/${order.id}`);
                }
              }}
            >
              <div className="flex items-start justify-between mb-2.5">
                <span className="text-xs font-bold text-muted-foreground">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-bg-warm text-xl flex-shrink-0">
                  🧯
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {order.cylinder_type ?? "?"} · {order.order_type ?? "refill"}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {order.brands?.name ?? ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold capitalize", statusStyles[order.status] ?? "bg-secondary text-muted-foreground")}>
                    {order.status.replace("_", " ")}
                  </span>
                  <p className="mt-1.5 font-display text-base font-extrabold text-action">{order.total_amount.toLocaleString()} K</p>
                </div>
              </div>
              {activeStatuses.includes(order.status) ? (
                <div className="mt-3 w-full rounded-xl gradient-action py-2.5 text-center text-sm font-extrabold text-action-foreground">
                  Track Order →
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/order/configure"); }}
                  className="mt-3 w-full rounded-xl bg-action-light py-2.5 text-center text-sm font-extrabold text-action transition-colors active:bg-action/20"
                >
                  Reorder
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
