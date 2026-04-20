import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Check, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";
import { useKbzAutoLogin, type KbzCandidate } from "@/hooks/useKbzAutoLogin";
import { useToast } from "@/hooks/use-toast";

const PhoneEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);
  const { toast } = useToast();

  const kbz = useKbzAutoLogin();

  // A3: Returning user redirect — skip auto-login if session is valid
  useEffect(() => {
    if (user && customer) {
      navigate("/welcome", { replace: true });
    }
  }, [user, customer, navigate]);

  // Handle KBZ auto-login state transitions
  useEffect(() => {
    if (kbz.status === "linked") {
      navigate("/welcome", { replace: true });
    } else if (kbz.status === "new_account") {
      navigate("/welcome", { replace: true });
    }
  }, [kbz.status, navigate]);

  const handleCandidateSelect = async (customerId: string | null) => {
    try {
      await kbz.selectCandidate(customerId);
    } catch (err: any) {
      if (err?.message?.includes("phone_already_linked")) {
        toast({
          title: "Phone already linked",
          description: "Please select the correct account from the list above.",
          variant: "destructive",
        });
      }
    }
  };

  // KBZ Pay authenticating state
  if (kbz.status === "idle" || kbz.status === "authenticating") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <Loader2 className="h-10 w-10 animate-spin text-action mb-4" />
        <p className="text-lg font-bold text-foreground">Connecting via KBZ Pay...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait</p>
      </div>
    );
  }

  // A2: Welcome-back hero for single candidate (link_pending with exactly 1 match)
  if (kbz.status === "link_pending" && kbz.candidates.length === 1) {
    const candidate = kbz.candidates[0];
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    return (
      <div className="flex min-h-screen flex-col items-center bg-background px-6 py-10">
        {/* Hero icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-action/10">
          <CheckCircle className="h-10 w-10 text-action" />
        </div>

        <h1 className="font-display text-[24px] font-extrabold text-foreground mb-1.5 text-center">
          Welcome back, {candidate.name.split(" ")[0]}!
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          We found your account linked to this KBZ Pay number.
        </p>

        {/* Account card */}
        <div className="w-full max-w-sm rounded-[16px] border-2 border-action/30 bg-card p-5 mb-4">
          <span className="text-[17px] font-bold text-foreground">{candidate.name}</span>
          <div className="mt-2 flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>{candidate.address_masked}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
            <span>{candidate.total_orders} orders</span>
            {candidate.member_since && (
              <>
                <span>·</span>
                <span>Member since {formatDate(candidate.member_since)}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3 mt-2">
          <Button
            variant="action"
            size="full"
            onClick={() => handleCandidateSelect(candidate.customer_id)}
            disabled={kbz.selecting}
            className="gap-2 text-[17px]"
          >
            {kbz.selecting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            {kbz.selecting ? "Linking..." : "That's me"}
          </Button>
          <button
            onClick={() => handleCandidateSelect(null)}
            disabled={kbz.selecting}
            className="w-full py-3 text-sm font-semibold text-muted-foreground transition-colors active:text-foreground disabled:opacity-50"
          >
            Not me
          </button>
        </div>
      </div>
    );
  }

  // KBZ Pay candidate selection (2+ candidates)
  if ((kbz.status === "linked_select" || kbz.status === "link_pending") && kbz.candidates.length > 0) {
    const hasLinkedCandidate = kbz.candidates.some(c => c.has_auth_account);

    return (
      <div className="flex min-h-screen flex-col bg-background px-6 py-6">
        <div className="mb-6">
          <h1 className="font-display text-[22px] font-extrabold text-foreground mb-1.5">
            Select Your Account
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We found accounts matching your KBZ Pay number. Please select yours.
          </p>
        </div>

        <div className="space-y-3 flex-1">
          {kbz.candidates.map((candidate) => (
            <CandidateCard
              key={candidate.customer_id}
              candidate={candidate}
              onSelect={() => handleCandidateSelect(candidate.customer_id)}
              disabled={kbz.selecting}
            />
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => handleCandidateSelect(null)}
            disabled={kbz.selecting || hasLinkedCandidate}
            title={hasLinkedCandidate ? "Your phone is already linked to an account above. Please select it." : undefined}
            className="w-full rounded-[14px] border-2 border-border bg-card py-4 text-sm font-bold text-muted-foreground transition-colors active:bg-secondary disabled:opacity-50"
          >
            {kbz.selecting ? "Please wait..." : "None of these is me"}
          </button>
          {hasLinkedCandidate && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Your phone is already linked to one of the accounts above
            </p>
          )}
        </div>
      </div>
    );
  }

  // Retry card — bridge failure, timeout, or backend error
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm rounded-[20px] border-2 border-border bg-card p-6 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-[20px] font-extrabold text-foreground mb-2">
          We couldn't sign you in
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Please close this Mini App and open it again from KBZ Pay.
        </p>
        <Button
          variant="action"
          size="full"
          onClick={() => kbz.retry()}
          className="text-[16px]"
        >
          Try Again
        </Button>
        <p className="mt-5 text-xs text-muted-foreground">
          Need help?{" "}
          <a
            href="tel:8484"
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            Call 8484
          </a>
        </p>
      </div>
    </div>
  );
};

// ── Candidate Card Component ─────────────────────────────────────
function CandidateCard({
  candidate,
  onSelect,
  disabled,
}: {
  candidate: KbzCandidate;
  onSelect: () => void;
  disabled: boolean;
}) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className="w-full rounded-[16px] border-2 border-border bg-card p-4 text-left transition-all active:scale-[0.98] active:border-action disabled:opacity-50"
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-[16px] font-bold text-foreground">{candidate.name}</span>
        {candidate.has_auth_account && (
          <span className="flex items-center gap-1 rounded-full bg-action-light px-2 py-0.5 text-[10px] font-bold text-action">
            <Check className="h-3 w-3" /> Linked
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span>{candidate.address_masked}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>{candidate.total_orders} orders</span>
        {candidate.last_order_date && (
          <>
            <span>·</span>
            <span>Last: {formatDate(candidate.last_order_date)}</span>
          </>
        )}
      </div>
      {candidate.member_since && (
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">
          Member since {formatDate(candidate.member_since)}
        </p>
      )}
    </button>
  );
}

export default PhoneEntry;