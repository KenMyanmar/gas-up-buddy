import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { toInternational } from "@/lib/phoneUtils";

const PhoneEntry = () => {
  const navigate = useNavigate();
  const { setPhone: setAuthPhone } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

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

export default PhoneEntry;
