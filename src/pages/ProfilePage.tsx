import { MapPin, CreditCard, Settings, Phone, HelpCircle, FileText, Shield, LogOut, Star, ChevronRight } from "lucide-react";
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

  const menuItems = [
    { icon: MapPin, label: "Delivery Addresses", badge: "" },
    { icon: CreditCard, label: "Payment Methods" },
    { icon: Settings, label: "Preferences" },
    { divider: true },
    { icon: Phone, label: "Call 8484", href: "tel:8484" },
    { icon: HelpCircle, label: "Help & FAQ" },
    { icon: FileText, label: "Terms & Conditions" },
    { icon: Shield, label: "Privacy Policy" },
    { divider: true },
    { icon: LogOut, label: "Log Out", destructive: true },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card px-5 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </header>

      {/* Profile Card */}
      <div className="mx-5 mt-5 flex items-center gap-4 rounded-xl bg-card p-5 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-action text-2xl font-bold text-action-foreground">
          {initial}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-foreground">{displayName}</p>
          <p className="text-sm text-muted-foreground">{displayPhone}</p>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span>{completedCount} orders completed</span>
          </div>
        </div>
        <button className="text-sm font-semibold text-primary">Edit</button>
      </div>

      {/* Menu Items */}
      <div className="mx-5 mt-4 overflow-hidden rounded-xl bg-card shadow-sm">
        {menuItems.map((item, i) => {
          if ('divider' in item && item.divider) {
            return <div key={i} className="border-t border-border" />;
          }
          const content = (
            <div className="flex items-center gap-3 px-5 py-3.5">
              {'icon' in item && item.icon && <item.icon className={`h-5 w-5 ${'destructive' in item && item.destructive ? "text-destructive" : "text-muted-foreground"}`} />}
              <span className={`flex-1 font-medium ${'destructive' in item && item.destructive ? "text-destructive" : "text-foreground"}`}>
                {'label' in item ? item.label : ''}
              </span>
              {'badge' in item && item.badge && (
                <span className="text-xs text-muted-foreground">{item.badge}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          );

          if ('href' in item && item.href) {
            return <a key={i} href={item.href}>{content}</a>;
          }
          if ('destructive' in item && item.destructive) {
            return (
              <button key={i} className="w-full" onClick={handleLogOut}>
                {content}
              </button>
            );
          }
          return <button key={i} className="w-full text-left">{content}</button>;
        })}
      </div>
    </div>
  );
};

export default ProfilePage;
