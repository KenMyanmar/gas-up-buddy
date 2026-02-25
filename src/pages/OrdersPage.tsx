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
  cancelled: "bg-red-50 text-destructive",
};

const activeStatuses = ["pending", "confirmed", "assigned", "in_transit"];

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
      <header className="bg-card px-5 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">My Orders</h1>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-card px-5 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              activeTab === tab ? "bg-action text-action-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3 px-5 pt-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-muted-foreground">No orders yet</p>
            <button onClick={() => navigate("/home")} className="mt-2 font-semibold text-action">
              Place your first order!
            </button>
          </div>
        ) : (
          filtered.map((order) => (
            <div key={order.id} className="rounded-xl bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {" · "}
                    {new Date(order.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <p className="mt-1 font-bold text-foreground">
                    {order.cylinder_types?.weight_kg ?? "?"}kg · {order.delivery_type}
                  </p>
                  {order.cylinder_types?.brands?.name && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{order.cylinder_types.brands.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", statusStyles[order.status] ?? "bg-secondary text-muted-foreground")}>
                    {order.status.replace("_", " ")}
                  </span>
                  <p className="mt-2 font-bold text-foreground">{order.total_amount.toLocaleString()} MMK</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/order/configure")}
                className="mt-3 w-full rounded-lg bg-action-light py-2 text-center text-sm font-bold text-action transition-colors active:bg-action/20"
              >
                Reorder
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
