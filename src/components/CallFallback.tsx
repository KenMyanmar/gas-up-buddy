import { Phone } from "lucide-react";

const CallFallback = () => (
  <a
    href="tel:8484"
    className="fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-action shadow-lg shadow-action/30 transition-transform active:scale-90"
  >
    <Phone className="h-6 w-6 text-action-foreground" />
  </a>
);

export default CallFallback;
