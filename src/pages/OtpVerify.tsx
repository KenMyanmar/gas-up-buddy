import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const OtpVerify = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (value && index === 5 && newOtp.every((d) => d !== "")) {
      setTimeout(() => navigate("/home"), 500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <button onClick={() => navigate("/onboarding/phone")} className="mb-8 self-start text-muted-foreground">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <h1 className="mb-2 text-2xl font-bold text-foreground">Verify your number</h1>
      <p className="mb-8 text-muted-foreground">
        We sent a code to <span className="font-semibold text-foreground">09xxx xxx xxx</span>
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
          />
        ))}
      </div>

      <div className="text-center">
        {timer > 0 ? (
          <p className="text-muted-foreground">
            Resend code in <span className="font-semibold text-foreground">0:{timer.toString().padStart(2, "0")}</span>
          </p>
        ) : (
          <button onClick={() => setTimer(59)} className="font-semibold text-action">
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
