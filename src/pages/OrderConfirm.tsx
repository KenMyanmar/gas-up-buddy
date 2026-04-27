import { useState } from "react";
import { useNavigate, useLocation, useSearchParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, ChevronDown, Loader2, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { startPay, pollOrderUntilPaid } from "@/lib/kbzpay-bridge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

const OrderConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("cid");
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id, urlCustomerId ?? undefined);
  const { toast } = useToast();

  const orderState = location.state as OrderState | null;
  const [placing, setPlacing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");

  if (!orderState) {
    return <Navigate to="/order/configure" replace />;
  }

  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      // 1. Create the order
      const { data, error } = await supabase.functions.invoke("create-customer-order", {
        body: {
          cylinderType: orderState.cylinderType,
          sizeKg: orderState.sizeKg,
          brandId: orderState.brandId,
          orderType: orderState.orderType,
          quantity: orderState.quantity,
          clientTotal: orderState.totalAmount,
          deliveryInstructions: instructions || undefined,
          paymentMethod: "kbzpay",
          orderSource: "kbzpay_miniapp",
          customerId: urlCustomerId ?? undefined,
        },
      });
      if (error) throw error;
      const result = data as { success?: boolean; order_id?: string; total_amount?: number; error?: string };
      if (!result?.success) throw new Error(result?.error ?? "Order creation failed");

      const orderId = result.order_id!;

      // 2. Create KBZ Pay payment
      const { data: payData, error: payErr } = await supabase.functions.invoke("kbzpay-create-payment", {
        body: { orderId, customerId: urlCustomerId ?? undefined },
      });
      if (payErr) throw payErr;
      const payResult = payData as any;
      if (!payResult?.prepay_id) throw new Error(payResult?.error ?? "Payment setup failed");

      // 3. Invoke KBZ Pay cashier
      try {
        const paymentResult = await startPay({
          prepayId: payResult.prepay_id,
          orderInfo: payResult.orderinfo,
          sign: payResult.sign,
          signType: payResult.signType,
        });

        // KBZ H5 spec: resultCode == 1 means PIN/payment flow success.
        // Webhook is the source of truth for "paid". A null/missing result
        // is "unknown" — start polling, do not assume cancelled.
        const rawCode = paymentResult?.resultCode;
        const codeStr = rawCode == null ? null : String(rawCode);
        const isSuccess = codeStr === "1";
        const isExplicitCancel = codeStr === "2"; // KBZ user-cancel
        const isExplicitFail = codeStr === "3" || codeStr === "-1";
        const isUnknown = rawCode == null || (!isSuccess && !isExplicitCancel && !isExplicitFail);

        if (isExplicitCancel) {
          navigate(`/order/success${location.search}`, {
            replace: true,
            state: { orderId, totalAmount: result.total_amount, paymentStatus: "cancelled" },
          });
          return;
        }
        if (isExplicitFail) {
          navigate(`/order/success${location.search}`, {
            replace: true,
            state: { orderId, totalAmount: result.total_amount, paymentStatus: "failed" },
          });
          return;
        }

        // success or unknown → poll for webhook confirmation
        const pollResult = await pollOrderUntilPaid(supabase, orderId, 120_000);
        // pollResult: "paid" | "failed" | "timeout"
        const paymentStatus =
          pollResult === "paid" ? "paid"
            : pollResult === "failed" ? "failed"
              : isSuccess ? "pending" // success but webhook not yet → processing
                : isUnknown ? "pending" // unknown result, no webhook → pending
                  : "pending";
        navigate(`/order/success${location.search}`, {
          replace: true,
          state: { orderId, totalAmount: result.total_amount, paymentStatus },
        });
      } catch (payError: any) {
        console.error("startPay failed:", payError);
        // Bridge/timeout error — order exists, webhook may still arrive. Show pending.
        navigate(`/order/success${location.search}`, {
          replace: true,
          state: { orderId, totalAmount: result.total_amount, paymentStatus: "pending" },
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Order Failed", description: message, variant: "destructive" });
      setPlacing(false);
    }
  };

  const orderTypeLabel =
    orderState.orderType === "new" ? "New Cylinder" : "Refill My Cylinder";

  return (
    <div className="flex min-h-screen flex-col bg-background pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={() => navigate(`/order/configure${location.search}`)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-display text-[22px] font-extrabold text-foreground flex-1">Confirm Order</h1>
      </div>

      <div className="space-y-4 px-5">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="text-xs font-bold text-muted-foreground">Configure</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-action" />
            <span className="text-xs font-bold text-action">Confirm</span>
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

        {/* Order Summary Card */}
        <div className="rounded-[20px] border border-border bg-card p-5 shadow-sm">
          <h2 className="text-[13px] font-extrabold text-foreground mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-semibold">Gas</span>
              <span className="font-bold text-foreground">
                {orderState.cylinderType} {orderState.brandName ? `(${orderState.brandName})` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-semibold">Type</span>
              <span className="font-bold text-foreground">{orderTypeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-semibold">Quantity</span>
              <span className="font-bold text-foreground">× {orderState.quantity}</span>
            </div>
            <div className="h-px bg-divider my-2" />
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-action" />
              <span className="text-foreground text-[13px]">
                {customer?.address ?? "—"}, {customer?.township ?? "—"}
              </span>
            </div>
            <div className="h-px bg-divider my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground font-semibold">Gas</span>
              <span className="text-foreground font-bold">{orderState.gasSubtotal.toLocaleString()} MMK</span>
            </div>
            {orderState.cylinderSubtotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Cylinder Deposit</span>
                <span className="text-foreground font-bold">{orderState.cylinderSubtotal.toLocaleString()} MMK</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                Delivery
                {orderState.deliveryFee === 6000 && (
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
              <span className={cn("font-extrabold text-xs", orderState.deliveryFee > 0 ? "text-foreground" : "text-success")}>
                {orderState.deliveryFee > 0 ? `${orderState.deliveryFee.toLocaleString()} MMK` : "Free"}
              </span>
            </div>
            <div className="h-px bg-divider my-2" />
            <div className="flex justify-between items-center pt-1">
              <span className="font-extrabold text-foreground">Total</span>
              <span className="font-display text-[22px] font-black text-action">
                {orderState.totalAmount.toLocaleString()} MMK
              </span>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex w-full items-center justify-between rounded-[14px] border border-border bg-card p-4 shadow-sm"
        >
          <span className="font-bold text-foreground">Special Instructions</span>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showInstructions && "rotate-180")} />
        </button>
        {showInstructions && (
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Floor number, landmark, gate code..."
            className="w-full rounded-[14px] border-[1.5px] border-border-strong bg-bg-warm p-4 text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-action min-h-[70px] text-base md:text-sm"
            rows={3}
          />
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-divider bg-card px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-md">
          <Button variant="action" size="full" onClick={handlePlaceOrder} disabled={placing} className="text-lg">
            {placing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay with KBZPay — ${orderState.totalAmount.toLocaleString()} MMK`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirm;
