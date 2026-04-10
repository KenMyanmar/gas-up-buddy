import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { toInternational } from "@/lib/phoneUtils";
import { isKBZPayMiniApp } from "@/utils/kbzpay";
import { useKbzAutoLogin, type KbzCandidate } from "@/hooks/useKbzAutoLogin";

const PhoneEntry = () => {
  const navigate = useNavigate();
  const { setPhone: setAuthPhone } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const isMiniApp = isKBZPayMiniApp();
  const kbz = useKbzAutoLogin();

  // Handle KBZ auto-login state transitions
  useEffect(() => {
    if (kbz.status === "linked") {
      navigate("/home", { replace: true });
    } else if (kbz.status === "new_account") {
      navigate("/onboarding/kbz-profile", { replace: true });
    }
  }, [kbz.status, navigate]);

  const isValid = /^09\d{7,9}$/.test(phone);

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    const intlPhone = toInternational(phone);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: intlPhone });
      if (error) throw error;
      setAuthPhone(intlPhone);
      navigate("/onboarding/otp");
    } catch (err: any) {
      toast({
        title: "Could not send OTP",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = async (customerId: string | null) => {
    try {
      await kbz.selectCandidate(customerId);
    } catch (err: any) {
      // Handle phone_already_linked error (Add 1)
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
  if (isMiniApp && (kbz.status === "idle" || kbz.status === "authenticating")) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <Loader2 className="h-10 w-10 animate-spin text-action mb-4" />
        <p className="text-lg font-bold text-foreground">Connecting via KBZ Pay...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait</p>
      </div>
    );
  }

  // KBZ error state with phone_already_linked — show toast and stay on selection
  if (isMiniApp && kbz.error?.includes("phone_already_linked")) {
    // Fall through to candidate selection UI below
  }

  // KBZ Pay candidate selection
  if (isMiniApp && (kbz.status === "linked_select" || kbz.status === "link_pending") && kbz.candidates.length > 0) {
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

  // Error state for KBZ — fall through to manual entry
  // (kbz.status === "error" || kbz.status === "not-in-kbz" → show phone form)

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <button onClick={() => navigate("/")} className="mb-8 flex items-center gap-1.5 self-start text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="font-display text-[26px] font-extrabold text-foreground mb-1.5">Enter your phone</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We'll send a verification code to confirm your number.
        </p>
      </div>

      <div className="mb-6">
        <input
          type="tel"
          inputMode="numeric"
          placeholder="09xxxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
          className="w-full rounded-[14px] border-[1.5px] border-border-strong bg-card px-4 py-4 text-lg font-semibold text-foreground outline-none tracking-wide transition-colors focus:border-action placeholder:text-muted-foreground/50 placeholder:tracking-normal placeholder:text-[15px]"
          autoFocus
        />
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-[10px] bg-bg-warm px-3.5 py-3 text-xs text-muted-foreground">
        <span>💡</span>
        <span>We'll send a 6-digit OTP code via SMS</span>
      </div>

      <Button variant="action" size="full" disabled={!isValid || loading} onClick={handleSubmit}>
        {loading ? "Sending..." : "Send OTP Code"}
      </Button>
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
      <p className="text-[14px] text-muted-foreground">{candidate.address_masked}</p>
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
