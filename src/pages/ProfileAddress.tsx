import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { YANGON_TOWNSHIPS } from "@/lib/yangonTownships";

const ProfileAddress = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const urlCustomerId = searchParams.get("cid") ?? undefined;
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id, urlCustomerId);

  const [township, setTownship] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;
    setTownship(customer.township ?? "");
    setAddress(customer.address ?? "");
    setLandmark(customer.landmark ?? "");
  }, [customer]);

  const handleSave = async () => {
    const cleanAddress = address.trim();
    const cleanTownship = township.trim();
    const cleanLandmark = landmark.trim();

    if (!cleanTownship) {
      setError("Please select your township.");
      return;
    }
    if (cleanAddress.length < 10 || cleanAddress.length > 500) {
      setError("Address must be between 10 and 500 characters.");
      return;
    }
    if (cleanLandmark.length > 200) {
      setError("Landmark must be 200 characters or less.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const update = supabase
        .from("customers")
        .update({ address: cleanAddress, township: cleanTownship, landmark: cleanLandmark || null });
      const { error: saveError } = urlCustomerId
        ? await update.eq("id", urlCustomerId)
        : await update.eq("auth_user_id", user?.id ?? "");

      if (saveError) throw saveError;
      await queryClient.invalidateQueries({ queryKey: ["customer_profile"] });
      toast({ title: "Address saved", description: "Your delivery address is ready." });
      navigate(-1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not save address.";
      setError(message);
      toast({ title: "Save failed", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-extrabold text-foreground">Delivery Address</h1>
      </div>

      <div className="space-y-4 px-5">
        <div className="rounded-[16px] border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-action/10">
              <MapPin className="h-5 w-5 text-action" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground">Home delivery details</p>
              <p className="text-xs font-semibold text-muted-foreground">Used by AnyGas and your delivery agent</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Township</span>
              <select
                value={township}
                onChange={(event) => setTownship(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
              >
                <option value="">Select township</option>
                {YANGON_TOWNSHIPS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Address</span>
              <Textarea
                value={address}
                onChange={(event) => setAddress(event.target.value.slice(0, 500))}
                minLength={10}
                maxLength={500}
                rows={5}
                placeholder="Building number, street, ward, floor..."
                className="min-h-[120px] bg-background"
              />
              <span className="mt-1 block text-right text-[11px] font-semibold text-muted-foreground">{address.length}/500</span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Landmark</span>
              <Input
                value={landmark}
                onChange={(event) => setLandmark(event.target.value.slice(0, 200))}
                maxLength={200}
                placeholder="Optional — e.g. blue gate, next to grocery shop"
              />
            </label>
          </div>
        </div>

        {error && <p className="rounded-[12px] bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}

        <Button variant="action" size="full" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Address"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileAddress;