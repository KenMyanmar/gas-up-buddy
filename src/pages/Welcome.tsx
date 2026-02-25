import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Phone, Mail } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-action-light to-background px-6 py-12">
      {/* Logo Section */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-action shadow-xl shadow-action/20">
          <Flame className="h-16 w-16 text-action-foreground" />
        </div>
        <h1 className="mt-4 text-4xl font-bold text-foreground">
          AnyGas <span className="text-action">8484</span>
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          Your trusted gas delivery partner in Myanmar
        </p>
        <p className="text-center text-base text-muted-foreground">
          မြန်မာနိုင်ငံရဲ့ ယုံကြည်ရတဲ့ ဓာတ်ငွေ့ပို့ဆောင်ရေး
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          variant="action"
          size="full"
          onClick={() => navigate("/onboarding/phone")}
          className="gap-3"
        >
          <Phone className="h-5 w-5" />
          Continue with Phone
        </Button>
        <Button
          variant="action-outline"
          size="full"
          onClick={() => navigate("/onboarding/phone")}
          className="gap-3"
        >
          <Mail className="h-5 w-5" />
          Continue with Email
        </Button>
        <p className="pt-4 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <span className="underline">Terms</span> &{" "}
          <span className="underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Welcome;
