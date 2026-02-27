import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const OtpVerify = () => {
  const navigate = useNavigate();
  const { phone } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const verifyOtp = async (code: string) => {
    if (!phone) {
      toast({ title: "Phone number missing", description: "Please go back and enter your number.", variant: "destructive" });
      return;
    }
    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
      if (error) throw error;

      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: retry } = await supabase.auth.getSession();
        if (!retry.session) {
          toast({ title: "Auth error", description: "Session not established. Please try again.", variant: "destructive" });
          setVerifying(false);
          return;
        }
      }

      const userId = session?.user?.id ?? (await supabase.auth.getSession()).data.session?.user?.id;
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('id, full_name, address, township')
        .eq('auth_user_id', userId!);

      if (existingCustomers && existingCustomers.length === 1) {
        navigate('/home');
      } else if (existingCustomers && existingCustomers.length > 1) {
        navigate('/onboarding/link-select', { state: { candidates: existingCustomers } });
      } else {
        const response = await supabase.functions.invoke('link-customer-account', {
          body: { action: 'check_phone' },
        });
        const result = response.data;
        if (result?.status === 'single') {
          navigate('/onboarding/link-welcome', { state: { customer: result.customer } });
        } else if (result?.status === 'multiple') {
          navigate('/onboarding/link-select', { state: { candidates: result.candidates } });
        } else {
          navigate('/onboarding/link-new');
        }
      }
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err?.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (value && index === 5 && newOtp.every((d) => d !== "")) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!phone) return;
    try {
      await supabase.auth.signInWithOtp({ phone });
      setTimer(59);
      toast({ title: "Code resent", description: "Check your phone for the new code." });
    } catch {
      toast({ title: "Resend failed", variant: "destructive" });
    }
  };

  const maskedPhone = phone
    ? phone.replace(/^(\+95)(\d{2})(\d+)(\d{3})$/, "$1 $2*** *** $4")
    : "your number";

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <button onClick={() => navigate("/onboarding/phone")} className="mb-8 flex items-center gap-1.5 self-start text-sm font-semibold text-muted-foreground">
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="font-display text-[26px] font-extrabold text-foreground mb-1.5">Verify your number</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enter the 6-digit code sent to <span className="font-semibold text-foreground">{maskedPhone}</span>
        </p>
      </div>

      <div className="mb-7 flex justify-center gap-2.5">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`h-[60px] w-[50px] rounded-[14px] border-2 text-center font-display text-2xl font-extrabold text-foreground outline-none transition-all ${
              digit
                ? "border-action bg-surface-warm"
                : "border-border-strong bg-card"
            } focus:border-action focus:bg-surface-warm focus:shadow-[0_0_0_3px_hsla(27,85%,49%,0.15)]`}
            autoFocus={i === 0}
            disabled={verifying}
          />
        ))}
      </div>

      {verifying && (
        <p className="mb-4 text-center text-sm font-semibold text-action">Verifying...</p>
      )}

      <div className="mb-2 text-center text-sm text-muted-foreground">
        {timer > 0 ? (
          <p>
            Resend code in <span className="font-display font-extrabold text-action">0:{timer.toString().padStart(2, "0")}</span>
          </p>
        ) : (
          <button onClick={handleResend} className="font-bold text-action">
            Resend Code
          </button>
        )}
      </div>

      <button onClick={() => navigate("/onboarding/phone")} className="text-center text-sm text-muted-foreground underline">
        Wrong number?
      </button>
    </div>
  );
};

export default OtpVerify;
