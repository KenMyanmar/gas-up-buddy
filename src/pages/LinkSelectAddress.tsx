import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const LinkSelectAddress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const candidates = (location.state?.candidates as { id: string; full_name: string; address: string; township: string }[]) || [];
  const [selected, setSelected] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  if (candidates.length === 0) {
    navigate("/onboarding/link-new");
    return null;
  }

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };




  const handleConfirm = async () => {
    setConfirming(true);
    try {
      for (const customerId of selected) {
        const { error } = await supabase.functions.invoke('link-customer-account', {
          body: { action: 'link', customer_id: customerId }
        });
        if (error) throw error;
      }
      navigate("/home");
    } catch (err: any) {
      toast({ title: "Linking failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Which addresses are yours?</h1>
      <p className="mb-6 text-muted-foreground">
        We found multiple records for your phone number. Select all that belong to you.
      </p>

      <div className="flex-1 space-y-3">
        {candidates.map((c) => {
          const isSelected = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all active:scale-[0.98]",
                isSelected ? "border-action bg-action-light" : "border-border bg-card"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  isSelected ? "border-action bg-action" : "border-muted"
                )}
              >
                {isSelected && <Check className="h-4 w-4 text-action-foreground" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{c.full_name}</p>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{c.address}, {c.township}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        <Button variant="action" size="full" disabled={selected.length === 0 || confirming} onClick={handleConfirm}>
          {confirming ? "Linking..." : `Confirm (${selected.length} selected)`}
        </Button>
        <button
          onClick={() => navigate("/onboarding/link-new")}
          className="w-full text-center text-sm font-semibold text-muted-foreground underline"
        >
          None of these — create a new profile
        </button>
      </div>
    </div>
  );
};

export default LinkSelectAddress;
