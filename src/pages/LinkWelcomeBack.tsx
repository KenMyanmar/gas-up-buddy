import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle } from "lucide-react";

// Mock response - will be replaced with Edge Function response
const mockLinkedCustomer = {
  full_name: "Daw Myint Aye",
  address: "No. 42, Pyay Road",
  township: "Hlaing Township, Yangon",
};

const LinkWelcomeBack = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-action-light">
          <CheckCircle className="h-10 w-10 text-action" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Welcome back, {mockLinkedCustomer.full_name}!
        </h1>

        <div className="mt-6 w-full rounded-xl border-2 border-action bg-action-light p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-action" />
            <div className="text-left">
              <p className="font-semibold text-foreground">{mockLinkedCustomer.address}</p>
              <p className="text-sm text-muted-foreground">{mockLinkedCustomer.township}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full space-y-3">
          <Button variant="action" size="full" onClick={() => navigate("/home")}>
            That's me
          </Button>
          <button
            onClick={() => navigate("/onboarding/link-new")}
            className="w-full text-center text-sm font-semibold text-muted-foreground underline"
          >
            Not me — create a new profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkWelcomeBack;
