import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface OrderSuccessState {
  orderId: string;
  totalAmount: number;
}

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderSuccessState | null;

  if (!state?.orderId) {
    return <Navigate to="/home" replace />;
  }

  const shortId = state.orderId.slice(0, 8).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-24">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-action/10">
          <CheckCircle className="h-14 w-14 text-action" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">Order Placed! 🎉</h1>
        <p className="mb-1 text-muted-foreground">Your gas is on the way</p>

        <div className="mb-6 mt-4 rounded-xl bg-card px-6 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Order Number</p>
          <p className="mt-1 text-lg font-bold text-foreground">#{shortId}</p>
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground">
              {(state.totalAmount ?? 0).toLocaleString()} MMK
            </p>
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">⏱ Estimated Delivery</p>
            <p className="font-semibold text-foreground">30–45 minutes</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button variant="action" size="full" onClick={() => navigate("/orders")}>
            Track Order
          </Button>
          <Button variant="outline" size="full" onClick={() => navigate("/home")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
