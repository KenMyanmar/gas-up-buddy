import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { useTownships } from "@/hooks/useTownships";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const KbzProfileComplete = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: townships, isLoading: loadingTownships } = useTownships();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [townshipName, setTownshipName] = useState("");
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid = name.trim().length >= 2 && address.trim().length >= 3 && townshipName;

  const handleLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS not available", description: "Your device doesn't support location services.", variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        toast({ title: "Location detected", description: "Please confirm your address below." });
        setLocating(false);
      },
      () => {
        toast({ title: "Location denied", description: "Please enter your address manually.", variant: "destructive" });
        setLocating(false);
      },
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("register-customer", {
        body: { full_name: name, address, township: townshipName },
      });
      if (error) throw error;
      navigate("/welcome", { replace: true });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <h1 className="mb-2 font-display text-[22px] font-extrabold text-foreground">Complete Your Profile</h1>
      <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
        Welcome via KBZPay! Let's set up your delivery details.
      </p>

      <div className="flex-1 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-muted-foreground">What's your name?</label>
          <input
            type="text"
            placeholder="e.g. Daw Myint Aye"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card p-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-action"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-muted-foreground">Delivery address</label>
          <input
            type="text"
            placeholder="No. 42, Pyay Road"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card p-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-action"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-muted-foreground">Township</label>
          <select
            value={townshipName}
            onChange={(e) => setTownshipName(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card p-4 text-foreground outline-none transition-colors focus:border-action"
          >
            <option value="">Select township</option>
            {loadingTownships ? (
              <option disabled>Loading...</option>
            ) : (
              townships?.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.zone})
                </option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={handleLocation}
          disabled={locating}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-border bg-card p-4 font-semibold text-primary transition-colors active:bg-secondary"
        >
          <Navigation className="h-5 w-5" />
          {locating ? "Detecting location..." : "Use Current Location"}
        </button>
      </div>

      <div className="mt-6">
        <Button variant="action" size="full" disabled={!isValid || submitting} onClick={handleSubmit}>
          {submitting ? "Setting up..." : "Start Ordering"}
        </Button>
      </div>
    </div>
  );
};

export default KbzProfileComplete;
