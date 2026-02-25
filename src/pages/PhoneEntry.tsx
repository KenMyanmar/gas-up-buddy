import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PhoneEntry = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");

  const isValid = /^09\d{7,9}$/.test(phone);

  const handleSubmit = () => {
    if (isValid) navigate("/onboarding/otp");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <button onClick={() => navigate("/")} className="mb-8 self-start text-muted-foreground">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <h1 className="mb-2 text-2xl font-bold text-foreground">Enter your phone number</h1>
      <p className="mb-8 text-muted-foreground">We'll send you a verification code</p>

      <div className="mb-6 flex items-center gap-3 rounded-xl border-2 border-border bg-card p-4 focus-within:border-action">
        <span className="text-lg font-semibold text-muted-foreground">+95</span>
        <div className="h-6 w-px bg-border" />
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

      <Button variant="action" size="full" disabled={!isValid} onClick={handleSubmit}>
        Send OTP
      </Button>
    </div>
  );
};

export default PhoneEntry;
