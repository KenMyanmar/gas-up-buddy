import { Home, ClipboardList, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { isKBZPayMiniApp } from "@/utils/kbzpay";

const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/orders", icon: ClipboardList, label: "Orders" },
  { path: "/alerts", icon: Bell, label: "Alerts" },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // KBZ Pay provides its own navigation
  if (isKBZPayMiniApp()) return null;

  if (location.pathname === "/" || location.pathname.startsWith("/onboarding") || location.pathname.startsWith("/order/")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-divider bg-card pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-6 py-1.5 transition-colors",
                isActive ? "text-action" : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-action" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
