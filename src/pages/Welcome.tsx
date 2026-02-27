import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import mascot from "@/assets/mascot.png";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-surface-warm to-bg-warm px-7 py-12">
      {/* Decorative flames */}
      <span className="pointer-events-none absolute -right-8 -top-10 text-[180px] opacity-[0.04] rotate-[-15deg]">🔥</span>
      <span className="pointer-events-none absolute -left-8 bottom-0 text-[140px] opacity-[0.03] rotate-[15deg]">🍳</span>

      {/* Logo Section */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5">
        {/* Mascot logo */}
        <div className="relative">
          <div className="flex h-[110px] w-[110px] items-center justify-center rounded-[32px] gradient-hero shadow-hero">
            <img src={mascot} alt="AnyGas mascot" className="h-20 w-20 object-contain" />
          </div>
          <div className="absolute -inset-[6px] rounded-[36px] border-2 border-dashed border-action/20" />
        </div>

        <h1 className="font-display text-4xl font-black tracking-tight text-foreground leading-tight">
          8484 <span className="text-action">AnyGas</span>
        </h1>
        <p className="text-center text-sm font-semibold text-muted-foreground">
          Fast & reliable LPG delivery
        </p>
        <p className="text-center text-[13px] text-muted-foreground/80">
          သင့်မီးဖိုချောင်ကို ဆက်ချက်ပြုတ်ပါ
        </p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-action shadow-sm">
          🍳 Keep your kitchen cooking!
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 w-full max-w-sm space-y-3">
        <Button
          variant="action"
          size="full"
          onClick={() => navigate("/onboarding/phone")}
          className="gap-3 text-[17px]"
        >
          <Phone className="h-5 w-5" />
          Continue with Phone
        </Button>
        <p className="pt-4 text-center text-[11px] text-muted-foreground leading-relaxed">
          By continuing, you agree to our{" "}
          <span className="font-bold text-action underline">Terms</span> &{" "}
          <span className="font-bold text-action underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Welcome;
