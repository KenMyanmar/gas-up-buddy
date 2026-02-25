import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = ["All", "Active", "Completed", "Cancelled"];

const mockOrders = [
  { id: 1, date: "Feb 20, 2026", time: "2:30 PM", size: 7, type: "Refill", price: "36,400", status: "delivered", agent: "Ko Aung Aung" },
  { id: 2, date: "Jan 28, 2026", time: "10:15 AM", size: 7, type: "Refill", price: "36,400", status: "delivered", agent: "Ko Min Thu" },
  { id: 3, date: "Jan 5, 2026", time: "4:00 PM", size: 10, type: "New", price: "50,000", status: "cancelled", agent: "" },
];

const statusStyles: Record<string, string> = {
  delivered: "bg-action-light text-action-dark",
  "in-progress": "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-destructive",
};

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();

  const filtered = mockOrders.filter((o) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return o.status === "in-progress";
    if (activeTab === "Completed") return o.status === "delivered";
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
        {filtered.length === 0 ? (
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
                  <p className="text-sm text-muted-foreground">{order.date} · {order.time}</p>
                  <p className="mt-1 font-bold text-foreground">{order.size} kg · {order.type}</p>
                  {order.agent && (
                    <p className="mt-0.5 text-sm text-muted-foreground">Agent: {order.agent}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", statusStyles[order.status])}>
                    {order.status}
                  </span>
                  <p className="mt-2 font-bold text-foreground">{order.price} MMK</p>
                </div>
              </div>
              <button className="mt-3 w-full rounded-lg bg-action-light py-2 text-center text-sm font-bold text-action transition-colors active:bg-action/20">
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
