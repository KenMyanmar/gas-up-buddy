import { ChevronRight, LogOut, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile, useOrders } from "@/hooks/useOrders";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);
  const { data: orders } = useOrders(customer?.id);

  const completedCount = orders?.filter((o) => o.status === "delivered" || o.status === "completed").length ?? 0;
  const displayName = customer?.full_name ?? "Guest";
  const displayPhone = customer?.phone ?? user?.phone ?? "—";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogOut = async () => {
    await signOut();
    navigate("/");
  };

  const accountItems = [
    { emoji: "📍", title: "Delivery Addresses", desc: customer?.township ?? "Manage addresses", action: () => navigate("/profile/addresses") },
  ];

  const supportItems = [
    { emoji: "❓", title: "Help & FAQ", desc: "Common questions", action: () => navigate("/profile/faq") },
    { emoji: "📄", title: "Terms & Conditions", desc: "Legal info", action: () => navigate("/profile/terms") },
    { emoji: "🔒", title: "Privacy Policy", desc: "Your data rights", action: () => navigate("/profile/privacy") },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-5 space-y-5">
        {/* Profile Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] gradient-hero text-[28px] font-black text-white shadow-hero">
            {initial}
          </div>
          <h1 className="font-display text-xl font-extrabold text-foreground">{displayName}</h1>
          <p className="text-[13px] font-semibold text-muted-foreground mt-0.5">{displayPhone}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-action/10 px-3 py-1 text-[11px] font-bold text-action">
            🔥 {completedCount} orders completed
          </div>
        </div>

        {/* Account Section */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Account</p>
          <div className="space-y-2">
            {accountItems.map((item) => (
              <button key={item.title} onClick={item.action} className="flex w-full items-center gap-3.5 rounded-[14px] border border-border bg-card p-3.5 shadow-sm text-left transition-all hover:shadow-md">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-bg-warm text-lg flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Branded promotional banner — decorative, not interactive */}
        <div className="relative overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 55%, hsl(var(--action) / 0.08) 100%)",
            }}
          />
          {/* Brand wave accent */}
          <svg
            className="absolute -bottom-2 left-0 right-0 w-full text-action/15"
            viewBox="0 0 400 60"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,40 C100,10 200,55 300,25 C350,12 380,30 400,22 L400,60 L0,60 Z"
              fill="currentColor"
            />
          </svg>
          <div className="relative flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-display text-[15px] font-extrabold leading-tight text-foreground">
                Fast gas delivery, right from KBZPay
              </p>
              <p className="mt-1 text-[12px] font-semibold text-muted-foreground leading-snug">
                Multi-brand LPG ordering in minutes
              </p>
            </div>
            {/* Stylised cylinder */}
            <div className="relative h-[68px] w-[44px] shrink-0">
              <div className="absolute left-1/2 top-0 h-2 w-5 -translate-x-1/2 rounded-t-md bg-action/70" />
              <div className="absolute left-1/2 top-1.5 h-1.5 w-7 -translate-x-1/2 rounded-sm bg-action/80" />
              <div
                className="absolute left-0 right-0 top-3 bottom-0 rounded-[10px] shadow-sm"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--action)) 0%, hsl(var(--action) / 0.85) 100%)",
                }}
              >
                <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 rounded-sm bg-white/95 px-1 py-1 text-center">
                  <Flame className="mx-auto h-3 w-3 text-action" strokeWidth={2.5} />
                  <p className="text-[7px] font-extrabold leading-none text-action">8484</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Support</p>
          <div className="space-y-2">
            {supportItems.map((item) => (
              <button key={item.title} onClick={item.action} className="flex w-full items-center gap-3.5 rounded-[14px] border border-border bg-card p-3.5 shadow-sm text-left transition-all hover:shadow-md">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-bg-warm text-lg flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogOut}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-border-strong bg-card py-3.5 text-sm font-bold text-destructive transition-all hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
