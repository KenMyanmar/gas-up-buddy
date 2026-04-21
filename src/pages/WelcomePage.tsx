import { useState, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle, MapPin, Trash2, Plus, Phone, Check, ChevronsUpDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { YANGON_TOWNSHIPS } from "@/lib/yangonTownships";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CustomerRow {
  id: string;
  full_name: string | null;
  address: string | null;
  township: string | null;
}

interface PhoneRow {
  id: string;
  phone: string;
  label: string | null;
  is_primary: boolean | null;
  verified: boolean | null;
}

const MAX_SECONDARY_PHONES = 3;
const isValidMmPhone = (p: string) => /^09\d{7,9}$/.test(p.trim());

const SupportFooter = () => (
  <div className="mt-8 pt-4 text-center">
    <a
      href="tel:8484"
      className="text-sm text-muted-foreground underline-offset-4 hover:underline"
    >
      Need help? Call <span className="font-semibold">8484</span>
    </a>
  </div>
);

const TownshipSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          className="flex w-full items-center justify-between rounded-xl border-2 border-border bg-card p-4 text-left text-foreground outline-none transition-colors focus:border-action"
        >
          <span className={cn(!value && "text-muted-foreground/50")}>
            {value || "Select township"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search township..." />
          <CommandList>
            <CommandEmpty>No township found.</CommandEmpty>
            <CommandGroup>
              {YANGON_TOWNSHIPS.map((t) => (
                <CommandItem
                  key={t}
                  value={t}
                  onSelect={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === t ? "opacity-100" : "opacity-0")} />
                  {t}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("cid");
  const location = useLocation();
  const stateCustomer = (location.state as any)?.customer as CustomerRow | undefined;
  const { toast } = useToast();
  const qc = useQueryClient();

  const customerQ = useQuery({
    queryKey: ["welcome_customer", urlCustomerId || user?.id],
    enabled: !!(urlCustomerId || user?.id) && !stateCustomer,
    queryFn: async (): Promise<CustomerRow | null> => {
      let query = supabase
        .from("customers")
        .select("id, full_name, address, township");

      if (urlCustomerId) {
        query = query.eq("id", urlCustomerId);
      } else if (user?.id) {
        query = query.eq("auth_user_id", user.id);
      } else {
        return null;
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data as CustomerRow | null;
    },
  });

  const customer = stateCustomer ?? customerQ.data;

  const phonesQ = useQuery({
    queryKey: ["welcome_phones", customer?.id],
    enabled: !!customer?.id,
    queryFn: async (): Promise<PhoneRow[]> => {
      const { data, error } = await supabase
        .from("customer_phones")
        .select("id, phone, label, is_primary, verified")
        .eq("customer_id", customer!.id)
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PhoneRow[];
    },
  });

  const isComplete = !!(
    customer?.full_name?.trim() &&
    customer?.address?.trim() &&
    customer?.township?.trim()
  );
  const hasAnyField = !!(customer?.full_name || customer?.address || customer?.township);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [township, setTownship] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Pre-fill form once when customer loads
  useMemo(() => {
    if (customer && !initialized) {
      setName(customer.full_name ?? "");
      setAddress(customer.address ?? "");
      setTownship(customer.township ?? "");
      setInitialized(true);
    }
  }, [customer, initialized]);

  const formValid = name.trim().length >= 2 && address.trim().length >= 3 && township.trim().length > 0;

  const handleSave = async () => {
    if (!customer || !formValid) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-update", {
        body: {
          customer_id: customer.id,
          full_name: name.trim(),
          address: address.trim(),
          township: township.trim(),
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Update failed");

      qc.invalidateQueries({ queryKey: ["welcome_customer"] });
      qc.invalidateQueries({ queryKey: ["customer_profile"] });

      navigate(`/home?cid=${customer.id}`, {
        replace: true,
        state: {
          customer: {
            ...customer,
            full_name: name.trim(),
            address: address.trim(),
            township: township.trim(),
          },
        },
      });
    } catch (err: any) {
      toast({
        title: "Could not save your details",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading & error states ──────────────────────────
  if (!stateCustomer && customerQ.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-action" />
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!stateCustomer && (customerQ.isError || !customer)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <p className="mb-4 text-base font-semibold text-foreground">
          Something went wrong. Please try again.
        </p>
        <Button variant="action" onClick={() => customerQ.refetch()}>
          Retry
        </Button>
        <SupportFooter />
      </div>
    );
  }

  const showConfirmation = isComplete && !editing;
  const heading = showConfirmation
    ? `Welcome back, ${customer.full_name}!`
    : hasAnyField
      ? "Welcome back!"
      : "Welcome to AnyGas 8484! 🎉";
  const subheading = showConfirmation
    ? null
    : hasAnyField
      ? "Please complete your delivery details."
      : "Let's set up your delivery details.";

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-6">
      <h1 className="mb-2 font-display text-[22px] font-extrabold text-foreground">
        {heading}
      </h1>
      {subheading && <p className="mb-6 text-sm text-muted-foreground">{subheading}</p>}

      {showConfirmation ? (
        <div className="space-y-5">
          <div className="rounded-2xl border-2 border-action/30 bg-card p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Delivering to
            </p>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-action" />
              <div>
                <p className="text-sm font-semibold text-foreground">{customer.address}</p>
                <p className="text-sm text-muted-foreground">{customer.township}</p>
              </div>
            </div>
          </div>

          <Button
            variant="action"
            size="full"
            className="gap-2"
            onClick={() =>
              navigate(`/home?cid=${customer.id}`, {
                replace: true,
                state: { customer },
              })
            }
          >
            <CheckCircle className="h-5 w-5" />
            Yes, this is correct
          </Button>
          <Button variant="outline" size="full" onClick={() => setEditing(true)}>
            ✏️ Update my details
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted-foreground">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Daw Myint Aye"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-card p-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-action"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted-foreground">
              Township
            </label>
            <TownshipSelect value={township} onChange={setTownship} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-muted-foreground">
              Address
            </label>
            <input
              type="text"
              placeholder="No. 42, Pyay Road"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-card p-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-action"
            />
          </div>

          <Button
            variant="action"
            size="full"
            disabled={!formValid || saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : hasAnyField ? "Save & Continue →" : "Get Started →"}
          </Button>
        </div>
      )}

      <PhonesSection
        customerId={customer.id}
        phones={phonesQ.data ?? []}
        loading={phonesQ.isLoading}
        onChange={() => qc.invalidateQueries({ queryKey: ["welcome_phones", customer.id] })}
      />

      <SupportFooter />
    </div>
  );
};

const PhonesSection = ({
  customerId,
  phones,
  loading,
  onChange,
}: {
  customerId: string;
  phones: PhoneRow[];
  loading: boolean;
  onChange: () => void;
}) => {
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const primary = phones.find((p) => p.is_primary);
  const secondaries = phones.filter((p) => !p.is_primary);
  const canAdd = secondaries.length < MAX_SECONDARY_PHONES;

  const handleAdd = async () => {
    const phone = newPhone.trim();
    if (!isValidMmPhone(phone)) {
      toast({
        title: "Invalid phone number",
        description: "Must start with 09 and be 9–11 digits.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("customer_phones").insert({
      customer_id: customerId,
      phone,
      label: "secondary",
    });
    setSubmitting(false);
    if (error) {
      if ((error as any).code === "23505") {
        toast({ title: "This phone number is already registered", variant: "destructive" });
      } else {
        toast({ title: "Failed to add phone number", variant: "destructive" });
      }
      return;
    }
    setNewPhone("");
    setAdding(false);
    onChange();
    toast({ title: "Phone added" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("customer_phones").delete().eq("id", id);
    if (error) {
      toast({ title: "Cannot remove this phone number", variant: "destructive" });
      return;
    }
    onChange();
  };

  return (
    <div className="mt-8 rounded-2xl border-2 border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
        <Phone className="h-4 w-4" /> Your Phone Numbers
      </h2>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-2">
          {primary && (
            <div className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{primary.phone}</span>
                <span className="rounded-full bg-action-light px-2 py-0.5 text-[10px] font-bold text-action">
                  Primary ✅
                </span>
              </div>
            </div>
          )}

          {secondaries.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">{p.phone}</span>
                {!p.verified && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    unverified
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove phone"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="mt-4 space-y-2">
          <input
            type="tel"
            placeholder="09xxxxxxxxx"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full rounded-xl border-2 border-border bg-background p-3 text-foreground outline-none focus:border-action"
          />
          <div className="flex gap-2">
            <Button
              variant="action"
              className="flex-1"
              disabled={submitting}
              onClick={handleAdd}
            >
              {submitting ? "Adding..." : "Add"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={submitting}
              onClick={() => {
                setAdding(false);
                setNewPhone("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : canAdd ? (
        <button
          onClick={() => setAdding(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-action hover:text-action"
        >
          <Plus className="h-4 w-4" /> Add another phone number
        </button>
      ) : (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Maximum of {MAX_SECONDARY_PHONES} additional phones reached.
        </p>
      )}
    </div>
  );
};

export default WelcomePage;