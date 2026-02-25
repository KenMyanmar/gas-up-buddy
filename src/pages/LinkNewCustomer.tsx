import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { useTownships } from "@/hooks/useTownships";
import { useToast } from "@/hooks/use-toast";

const LinkNewCustomer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: townships, isLoading: loadingTownships } = useTownships();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [townshipId, setTownshipId] = useState("");
  const [locating, setLocating] = useState(false);

  const isValid = name.trim().length >= 2 && address.trim().length >= 3 && townshipId;

  const handleLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS not available", description: "Your device doesn't support location services.", variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // TODO: reverse geocode to fill address/township
        console.log("GPS:", pos.coords.latitude, pos.coords.longitude);
        toast({ title: "Location detected", description: "Please confirm your address below." });
        setLocating(false);
      },
      () => {
        toast({ title: "Location denied", description: "Please enter your address manually.", variant: "destructive" });
        setLocating(false);
      }
    );
  };

  const handleSubmit = () => {
    // TODO: Call Edge Function with new_profile payload
    console.log("New profile:", { name, address, townshipId });
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Welcome to AnyGas!</h1>
      <p className="mb-8 text-muted-foreground">Let's set up your profile so we can deliver gas to you.</p>

      <div className="flex-1 space-y-5">
        {/* Name */}
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

        {/* Address */}
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

        {/* Township */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-muted-foreground">Township</label>
          <select
            value={townshipId}
            onChange={(e) => setTownshipId(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-card p-4 text-foreground outline-none transition-colors focus:border-action"
          >
            <option value="">Select township</option>
            {loadingTownships ? (
              <option disabled>Loading...</option>
            ) : (
              townships?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}, {t.city}
                </option>
              ))
            )}
          </select>
        </div>

        {/* GPS Button */}
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
        <Button variant="action" size="full" disabled={!isValid} onClick={handleSubmit}>
          Start Ordering
        </Button>
      </div>
    </div>
  );
};

export default LinkNewCustomer;
