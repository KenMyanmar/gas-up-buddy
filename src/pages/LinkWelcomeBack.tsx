import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const LinkWelcomeBack = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const customer = location.state?.customer as { id: string; full_name: string; address: string; township: string } | undefined;

  if (!customer) {
    navigate("/onboarding/link-new");
    return null;
  }

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('link-customer-account', {
        body: { action: 'link', customer_id: customer.id }
      });
      if (error) throw error;
      navigate('/home');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to link account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-action-light">
          <CheckCircle className="h-10 w-10 text-action" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Welcome back, {customer.full_name}!
        </h1>

        <div className="mt-6 w-full rounded-xl border-2 border-action bg-action-light p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-action" />
            <div className="text-left">
              <p className="font-semibold text-foreground">{customer.address}</p>
              <p className="text-sm text-muted-foreground">{customer.township}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full space-y-3">
          <Button variant="action" size="full" onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Linking...
              </>
            ) : (
              "That's me"
            )}
          </Button>
          <button
            onClick={() => navigate("/onboarding/link-new")}
            className="w-full text-center text-sm font-semibold text-muted-foreground underline"
            disabled={loading}
          >
            Not me — create a new profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkWelcomeBack;
