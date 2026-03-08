import { ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";

const ProfileAddresses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={() => navigate("/profile")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-extrabold text-foreground">Delivery Addresses</h1>
      </div>

      <div className="px-5 space-y-3">
        {customer ? (
          <div className="rounded-[14px] border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-action/10 flex-shrink-0">
                <MapPin className="h-5 w-5 text-action" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-foreground">Home</p>
                  <span className="rounded-full bg-action/10 px-2 py-0.5 text-[10px] font-bold text-action">Default</span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{customer.address}</p>
                <p className="text-[12px] font-semibold text-muted-foreground mt-1">📍 {customer.township}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No address found.</p>
        )}

        <p className="text-[11px] text-muted-foreground text-center pt-2">
          Multi-address support coming soon!
        </p>
      </div>
    </div>
  );
};

export default ProfileAddresses;
