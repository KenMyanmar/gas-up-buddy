import { useNavigate, useLocation, useSearchParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface OrderSuccessState {
  orderId: string;
  totalAmount: number;
  paymentStatus?: "paid" | "failed" | "timeout" | "pending" | "cancelled";
  brandName?: string;
  sizeKg?: number;
  cylinderType?: string;
}

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("cid");
  const state = location.state as OrderSuccessState | null;

  if (!state?.orderId) {
    return <Navigate to={`/home${location.search}`} replace />;
  }

  const shortId = state.orderId.slice(-8).toUpperCase();
  const paymentStatus = state.paymentStatus;
  const itemSummary = [state.brandName, state.sizeKg ? `${state.sizeKg}kg` : state.cylinderType].filter(Boolean).join(" · ");

  type ScreenVariant = "success" | "failure" | "pending";

  const variant: ScreenVariant = 
    paymentStatus === "paid" ? "success" :
    (paymentStatus === "failed" || paymentStatus === "cancelled") ? "failure" :
    "pending";

  const screenConfig = {
    success: {
      Icon: CheckCircle2,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      iconRing: "ring-success/15",
      iconShadow: "shadow-[0_6px_20px_hsl(var(--success)/0.15)]",
      iconAnimation: "animate-[bounce_1.4s_ease-in-out_1]",
      headline: "Order Confirmed!",
      subtext: "We're preparing your gas. Delivery in 2 hours.",
      totalLabel: "Total Paid",
      showEstimatedDelivery: true,
      primaryButton: { text: "Track My Order", action: "track" as const },
      secondaryButton: { text: "Place Another", action: "home" as const },
    },
    failure: {
      Icon: AlertCircle,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
      iconRing: "ring-destructive/15",
      iconShadow: "shadow-[0_6px_20px_hsl(var(--destructive)/0.15)]",
      iconAnimation: "",
      headline: paymentStatus === "cancelled" ? "Payment Cancelled" : "Payment Failed",
      subtext: paymentStatus === "cancelled"
        ? "You cancelled the payment. Your order is on hold."
        : "Your payment didn't go through. Please try again or call 8484.",
      totalLabel: "Total",
      showEstimatedDelivery: false,
     primaryButton: { text: "View Order Status", action: "retry" as const },
      secondaryButton: { text: "Call 8484", action: "call" as const },
    },
    pending: {
      Icon: Clock,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      iconRing: "ring-warning/15",
      iconShadow: "shadow-[0_6px_20px_hsl(var(--warning)/0.15)]",
      iconAnimation: "animate-pulse",
      headline: "Payment Processing",
      subtext: "We're confirming your payment with KBZ Pay. This usually takes a moment.",
      totalLabel: "Total Paid",
      showEstimatedDelivery: true,
      primaryButton: { text: "Track My Order", action: "track" as const },
      secondaryButton: { text: "Place Another", action: "home" as const },
    },
  }[variant];

  const handleAction = (action: "track" | "home" | "retry" | "call") => {
    if (action === "track") navigate(`/order/tracking/${state.orderId}${location.search}`);
    else if (action === "home") navigate(`/home${location.search}`);
    else if (action === "retry") navigate(`/order/tracking/${state.orderId}${location.search}`);
    else if (action === "call") window.location.href = "tel:8484";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-24">
      <div className="flex flex-col items-center text-center">
        <div className={`mb-6 flex h-20 w-20 ${screenConfig.iconAnimation} items-center justify-center rounded-full ${screenConfig.iconBg} ${screenConfig.iconShadow} ring-4 ${screenConfig.iconRing}`}>
          <screenConfig.Icon className={`h-11 w-11 ${screenConfig.iconColor}`} strokeWidth={2.5} />
        </div>

        <h1 className="font-display text-[24px] font-extrabold text-foreground mb-1">{screenConfig.headline}</h1>
        <p className="text-[13px] font-semibold text-muted-foreground">{screenConfig.subtext}</p>

        <div className="mb-6 mt-5 rounded-[20px] border border-border bg-card px-6 py-5 shadow-sm w-full max-w-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Number</p>
          <p className="mt-1 font-display text-lg font-extrabold text-foreground">#{shortId}</p>
          <div className="h-px bg-divider my-3" />
          <p className="text-sm text-muted-foreground">{screenConfig.totalLabel}</p>
          <p className="font-display text-xl font-black text-action">
            {(state.totalAmount ?? 0).toLocaleString()} MMK
          </p>
          {itemSummary && (
            <>
              <div className="h-px bg-divider my-3" />
              <p className="text-sm text-muted-foreground">Order</p>
              <p className="font-bold text-foreground">{itemSummary}</p>
            </>
          )}

          {/* Payment status for KBZ Pay */}
          {paymentStatus && (
            <>
              <div className="h-px bg-divider my-3" />
              <p className="text-sm text-muted-foreground">Payment</p>
              {paymentStatus === "paid" ? (
                <p className="font-bold text-success">✅ Payment confirmed</p>
              ) : paymentStatus === "failed" ? (
                <p className="font-bold text-destructive">❌ Payment failed — please retry</p>
              ) : paymentStatus === "cancelled" ? (
                <p className="font-bold text-destructive">⊘ Payment cancelled</p>
              ) : (
                <p className="font-bold text-warning">⏳ Payment pending — check order history</p>
              )}
            </>
          )}

          {screenConfig.showEstimatedDelivery && (
            <>
              <div className="h-px bg-divider my-3" />
              <p className="text-sm text-muted-foreground">⏱ Estimated Delivery</p>
              <p className="font-bold text-foreground">Within 2 hours</p>
            </>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 max-w-xs">
          <Button variant="action" size="full" onClick={() => handleAction(screenConfig.primaryButton.action)}>
            {screenConfig.primaryButton.text}
          </Button>
          <Button variant="outline" size="full" onClick={() => handleAction(screenConfig.secondaryButton.action)} className="border-border-strong">
            {screenConfig.secondaryButton.text}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
