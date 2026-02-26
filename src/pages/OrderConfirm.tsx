import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderState {
  cylinderType: string;
  sizeKg: number;
  brandId: string;
  brandName: string;
  orderType: "refill" | "new";
  quantity: number;
  unitPrice: number;
  gasSubtotal: number;
  cylinderSubtotal: number;
  deliveryFee: number;
  totalAmount: number;
  gasPricePerKg: number;
}

const paymentMethods = [
  { id: "cash", label: "Cash on Delivery", icon: "💵" },
  { id: "kbz", label: "KBZ Pay", icon: "🏦" },
  { id: "wave", label: "Wave Money", icon: "📱" },
  { id: "cb", label: "CB Pay", icon: "💳" },
];

const OrderConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);
  const { toast } = useToast();

  const orderState = location.state as OrderState | null;
  const [payment, setPayment] = useState("cash");
  const [placing, setPlacing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");

  // Redirect if no order state
  if (!orderState) {
    return <Navigate to="/order/configure" replace />;
  }

  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-customer-order",
        {
          body: {
            cylinderType: orderState.cylinderType,
            sizeKg: orderState.sizeKg,
            brandId: orderState.brandId,
            orderType: orderState.orderType,
            quantity: orderState.quantity,
            clientTotal: orderState.totalAmount,
            deliveryInstructions: instructions || undefined,
          },
        }
      );

      if (error) throw error;

      const result = data as { success?: boolean; order_id?: string; total_amount?: number; error?: string };

      if (!result?.success) {
        throw new Error(result?.error ?? "Order creation failed");
      }

      navigate("/order/success", {
        replace: true,
        state: {
          orderId: result.order_id,
          totalAmount: result.total_amount,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "Order Failed",
        description: message,
        variant: "destructive",
      });
      setPlacing(false);
    }
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
              <span className="font-semibold text-foreground">
                {orderState.cylinderType} {orderState.brandName ? `(${orderState.brandName})` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-semibold text-foreground">
                {orderState.orderType === "refill" ? "Refill My Cylinder" : "New Cylinder"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-semibold text-foreground">× {orderState.quantity}</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-action" />
              <span className="text-foreground">
                {customer?.address ?? "—"}, {customer?.township ?? "—"}
              </span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gas</span>
              <span className="text-foreground">{orderState.gasSubtotal.toLocaleString()} MMK</span>
            </div>
            {orderState.cylinderSubtotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cylinder Deposit</span>
                <span className="text-foreground">{orderState.cylinderSubtotal.toLocaleString()} MMK</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-semibold text-action">Free</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">
                {orderState.totalAmount.toLocaleString()} MMK
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">⏱ Est. Delivery</span>
              <span className="font-semibold text-foreground">30–45 min</span>
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
                {payment === pm.id && <span className="ml-auto text-action">✓</span>}
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
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
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
              `PLACE ORDER — ${orderState.totalAmount.toLocaleString()} MMK`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirm;
