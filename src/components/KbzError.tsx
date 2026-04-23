import { WifiOff, ShieldX, CreditCard, Radio, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type KbzErrorReason =
  | "jssdk-missing"
  | "authcode-fail"
  | "session-lost"
  | "payment-failed"
  | "realtime-blocked"
  | "map-blocked";

interface KbzErrorProps {
  reason: KbzErrorReason;
  onRetry?: () => void;
  detail?: string;
}

const config: Record<KbzErrorReason, {
  title: string;
  message: string;
  cta?: string;
  icon: React.ReactNode;
}> = {
  "jssdk-missing": {
    title: "Connection Error",
    message: "Could not connect to KBZPay services. Please close and reopen this app.",
    cta: "Try again",
    icon: <WifiOff className="h-8 w-8 text-destructive" />,
  },
  "authcode-fail": {
    title: "Sign-in Failed",
    message: "Unable to verify your KBZPay account. Please try again.",
    cta: "Try again",
    icon: <ShieldX className="h-8 w-8 text-destructive" />,
  },
  "session-lost": {
    title: "Session Expired",
    message: "Your session expired. Please sign in again.",
    cta: "Sign in",
    icon: <ShieldX className="h-8 w-8 text-accent" />,
  },
  "payment-failed": {
    title: "Payment Error",
    message: "The payment couldn't be completed. Please try again or contact support.",
    cta: "Try again",
    icon: <CreditCard className="h-8 w-8 text-destructive" />,
  },
  "realtime-blocked": {
    title: "Live Updates Unavailable",
    message: "Order status may be delayed. Pull down to refresh.",
    cta: "Refresh",
    icon: <Radio className="h-8 w-8 text-accent" />,
  },
  "map-blocked": {
    title: "Map Unavailable",
    message: "Your delivery is on the way. Track via status updates.",
    icon: <MapPinOff className="h-8 w-8 text-muted-foreground" />,
  },
};

const KbzError = ({ reason, onRetry, detail }: KbzErrorProps) => {
  const { title, message, cta, icon } = config[reason];
  const showButton = cta && onRetry;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2 text-center">{title}</h2>
      <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">{message}</p>
      {showButton && (
        <Button variant="default" className="mt-6" onClick={onRetry}>
          {cta}
        </Button>
      )}
      {detail && (
        <p className="mt-4 text-xs text-muted-foreground/60 text-center max-w-xs font-mono break-all">
          {detail}
        </p>
      )}
    </div>
  );
};

export default KbzError;
export type { KbzErrorReason, KbzErrorProps };
