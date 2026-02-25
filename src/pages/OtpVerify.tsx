import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { toLocal } from "@/lib/phoneUtils";

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

      // Query customers table using local format
      const localPhone = toLocal(phone);
      const { data: customers, error: queryError } = await supabase
        .from("customers")
        .select("id, full_name, address, township")
        .eq("phone", localPhone);

      if (queryError) {
        console.error("Customer lookup failed:", queryError);
        navigate("/onboarding/link-new");
        return;
      }

      if (!customers || customers.length === 0) {
        navigate("/onboarding/link-new");
      } else if (customers.length === 1) {
        navigate("/onboarding/link-welcome", { state: { customer: customers[0] } });
      } else {
        navigate("/onboarding/link-select", { state: { candidates: customers } });
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
      <button onClick={() => navigate("/onboarding/phone")} className="mb-8 self-start text-muted-foreground">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <h1 className="mb-2 text-2xl font-bold text-foreground">Verify your number</h1>
      <p className="mb-8 text-muted-foreground">
        We sent a code to <span className="font-semibold text-foreground">{maskedPhone}</span>
      </p>

      <div className="mb-6 flex justify-center gap-3">
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
            className="h-14 w-12 rounded-xl border-2 border-border bg-card text-center text-xl font-bold text-foreground outline-none transition-colors focus:border-action"
            autoFocus={i === 0}
            disabled={verifying}
          />
        ))}
      </div>

      {verifying && (
        <p className="mb-4 text-center text-sm font-semibold text-action">Verifying...</p>
      )}

      <div className="text-center">
        {timer > 0 ? (
          <p className="text-muted-foreground">
            Resend code in <span className="font-semibold text-foreground">0:{timer.toString().padStart(2, "0")}</span>
          </p>
        ) : (
          <button onClick={handleResend} className="font-semibold text-action">
            Resend Code
          </button>
        )}
      </div>

      <button onClick={() => navigate("/onboarding/phone")} className="mt-4 text-center text-sm text-muted-foreground underline">
        Wrong number?
      </button>
    </div>
  );
};

export default OtpVerify;
