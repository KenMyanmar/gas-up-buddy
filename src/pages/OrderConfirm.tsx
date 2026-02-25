import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const paymentMethods = [
  { id: "cash", label: "Cash on Delivery", icon: "💵" },
  { id: "kbz", label: "KBZ Pay", icon: "🏦" },
  { id: "wave", label: "Wave Money", icon: "📱" },
  { id: "cb", label: "CB Pay", icon: "💳" },
];

const OrderConfirm = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState("cash");
  const [placing, setPlacing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handlePlaceOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      navigate("/orders");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      {/* Header */}
      <header className="flex items-center gap-3 bg-card px-5 py-4 shadow-sm">
        <button onClick={() => navigate("/order/configure")} className="text-muted-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Confirm Order</h1>
      </header>

      <div className="space-y-4 px-5 pt-5">
        {/* Order Summary */}
        <div className="rounded-xl bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gas</span>
              <span className="font-semibold text-foreground">7 kg LP Gas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-semibold text-foreground">Refill My Cylinder</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-semibold text-foreground">× 1</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-action" />
              <span className="text-foreground">No. 42, Pyay Road, Hlaing, Yangon</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-bold text-foreground">36,400 MMK</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-semibold text-action">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">⏱ Est. Delivery</span>
              <span className="font-semibold text-foreground">30-45 min</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-xl bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">Payment Method</h2>
          <div className="space-y-2">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPayment(pm.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 p-3.5 transition-all active:scale-[0.98]",
                  payment === pm.id ? "border-action bg-action-light" : "border-border bg-background"
                )}
              >
                <span className="text-xl">{pm.icon}</span>
                <span className="font-semibold text-foreground">{pm.label}</span>
                {payment === pm.id && (
                  <span className="ml-auto text-action">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex w-full items-center justify-between rounded-xl bg-card p-4 shadow-sm"
        >
          <span className="font-semibold text-foreground">Special Instructions</span>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showInstructions && "rotate-180")} />
        </button>
        {showInstructions && (
          <textarea
            placeholder="Floor number, landmark, gate code..."
            className="w-full rounded-xl border-2 border-border bg-card p-4 text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-action"
            rows={3}
          />
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-md">
          <Button
            variant="action"
            size="full"
            onClick={handlePlaceOrder}
            disabled={placing}
            className="text-lg"
          >
            {placing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Placing Order...
              </>
            ) : (
              "PLACE ORDER — 36,400 MMK"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirm;
