import { useNavigate, useLocation, useSearchParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-24">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 animate-[bounce_1.4s_ease-in-out_1] items-center justify-center rounded-full bg-success/10 shadow-[0_6px_20px_hsl(var(--success)/0.15)] ring-4 ring-success/15">
          <CheckCircle2 className="h-11 w-11 text-success" strokeWidth={2.5} />
        </div>

        <h1 className="font-display text-[24px] font-extrabold text-foreground mb-1">Order Confirmed!</h1>
        <p className="text-[13px] font-semibold text-muted-foreground">We're preparing your gas. Delivery in 2 hours.</p>

        <div className="mb-6 mt-5 rounded-[20px] border border-border bg-card px-6 py-5 shadow-sm w-full max-w-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Number</p>
          <p className="mt-1 font-display text-lg font-extrabold text-foreground">#{shortId}</p>
          <div className="h-px bg-divider my-3" />
          <p className="text-sm text-muted-foreground">Total Paid</p>
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
              ) : (
                <p className="font-bold text-warning">⏳ Payment pending — check order history</p>
              )}
            </>
          )}

          <div className="h-px bg-divider my-3" />
          <p className="text-sm text-muted-foreground">⏱ Estimated Delivery</p>
          <p className="font-bold text-foreground">Within 2 hours</p>
        </div>

        <div className="flex w-full flex-col gap-3 max-w-xs">
          <Button variant="action" size="full" onClick={() => navigate(`/order/tracking/${state.orderId}${location.search}`)}>
            Track My Order
          </Button>
          <Button variant="outline" size="full" onClick={() => navigate(`/home${location.search}`)} className="border-border-strong">
            Place Another
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
