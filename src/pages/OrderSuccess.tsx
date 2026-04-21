import { useNavigate, useLocation, useSearchParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface OrderSuccessState {
  orderId: string;
  totalAmount: number;
  paymentStatus?: "paid" | "failed" | "timeout" | "pending";
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

  const shortId = state.orderId.slice(0, 8).toUpperCase();
  const paymentStatus = state.paymentStatus;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-24">
      <div className="flex flex-col items-center text-center">
        {/* Green check */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(135,50%,95%)] shadow-[0_6px_20px_hsla(135,50%,40%,0.15)]">
          <span className="text-[40px]">✅</span>
        </div>

        <h1 className="font-display text-[22px] font-extrabold text-foreground mb-1">Order Placed! 🎉</h1>
        <p className="text-[13px] text-muted-foreground">Your gas is on the way</p>

        <div className="mb-6 mt-5 rounded-[20px] border border-border bg-card px-6 py-5 shadow-sm w-full max-w-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Number</p>
          <p className="mt-1 font-display text-lg font-extrabold text-foreground">#{shortId}</p>
          <div className="h-px bg-divider my-3" />
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="font-display text-xl font-black text-action">
            {(state.totalAmount ?? 0).toLocaleString()} MMK
          </p>

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
          <p className="font-bold text-foreground">30–45 minutes</p>
        </div>

        <div className="flex w-full flex-col gap-3 max-w-xs">
          <Button variant="action" size="full" onClick={() => navigate(`/order/tracking/${state.orderId}${location.search}`)}>
            Track Order
          </Button>
          <Button variant="outline" size="full" onClick={() => navigate(`/home${location.search}`)} className="border-border-strong">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
