import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

    // Format to international: 09xxx -> +959xxx
    const intlPhone = "+95" + phone.slice(1);

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
      <button onClick={() => navigate("/")} className="mb-8 self-start text-muted-foreground">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <h1 className="mb-2 text-2xl font-bold text-foreground">Enter your phone number</h1>
      <p className="mb-8 text-muted-foreground">We'll send you a verification code</p>

      <div className="mb-6 flex items-center rounded-xl border-2 border-border bg-card p-4 focus-within:border-action">
        <input
          type="tel"
          inputMode="numeric"
          placeholder="09xxxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
          className="flex-1 bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
          autoFocus
        />
      </div>

      <Button variant="action" size="full" disabled={!isValid || loading} onClick={handleSubmit}>
        {loading ? "Sending..." : "Send OTP"}
      </Button>
    </div>
  );
};

export default PhoneEntry;
