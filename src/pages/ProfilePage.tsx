import { ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile, useOrders } from "@/hooks/useOrders";
import { toast } from "@/hooks/use-toast";

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

  const handleComingSoon = () => {
    toast({ title: "Coming soon!", description: "This feature will be available in a future update." });
  };

  const accountItems = [
    { emoji: "📍", title: "Delivery Addresses", desc: customer?.township ?? "Manage addresses", action: () => navigate("/profile/addresses") },
    { emoji: "💳", title: "Payment Methods", desc: "Cash, KBZ Pay, Wave", action: handleComingSoon },
    { emoji: "⚙️", title: "Preferences", desc: "Notifications, language", action: handleComingSoon },
  ];

  const supportItems = [
    { emoji: "☎️", title: "Call 8484", desc: "24/7 support", href: "tel:8484" },
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

        {/* Support Section */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Support</p>
          <div className="space-y-2">
            {supportItems.map((item) => {
              const inner = (
                <>
                  <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-bg-warm text-lg flex-shrink-0">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{item.title}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                </>
              );
              if (item.href) {
                return (
                  <a key={item.title} href={item.href} className="flex items-center gap-3.5 rounded-[14px] border border-border bg-card p-3.5 shadow-sm text-left transition-all hover:shadow-md">
                    {inner}
                  </a>
                );
              }
              return (
                <button key={item.title} onClick={item.action} className="flex w-full items-center gap-3.5 rounded-[14px] border border-border bg-card p-3.5 shadow-sm text-left transition-all hover:shadow-md">
                  {inner}
                </button>
              );
            })}
          </div>
        </div>

        {/* Help Callout */}
        <div className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-border bg-surface-warm p-3.5">
          <span className="text-2xl">📞</span>
          <p className="flex-1 text-[13px] font-semibold text-muted-foreground leading-relaxed">
            Need help? Call <strong className="text-action">8484</strong> anytime, 24/7
          </p>
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
