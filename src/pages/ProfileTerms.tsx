import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileTerms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={() => navigate("/profile")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-extrabold text-foreground">Terms & Conditions</h1>
      </div>

      <div className="px-5 space-y-4 text-[13px] text-muted-foreground leading-relaxed">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Last updated: March 2026</p>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>By using the AnyGas application, you agree to these Terms and Conditions. If you do not agree, please do not use our services.</p>

          <h2 className="text-sm font-bold text-foreground">2. Service Description</h2>
          <p>AnyGas provides a platform connecting customers with LPG gas delivery agents. We facilitate the ordering and delivery of gas cylinders and related equipment.</p>

          <h2 className="text-sm font-bold text-foreground">3. Orders & Delivery</h2>
          <p>All orders are subject to availability. Delivery times are estimates and may vary based on location, demand, and agent availability. Prices are displayed at the time of order and are final once confirmed.</p>

          <h2 className="text-sm font-bold text-foreground">4. Cancellations</h2>
          <p>Orders may be cancelled before dispatch. Once an agent has been dispatched, cancellation may not be possible. Refunds for cancelled orders will be processed according to our refund policy.</p>

          <h2 className="text-sm font-bold text-foreground">5. Limitation of Liability</h2>
          <p>AnyGas acts as an intermediary platform. We are not directly responsible for the quality of gas cylinders delivered by third-party agents, though we maintain quality standards with all our partners.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileTerms;
