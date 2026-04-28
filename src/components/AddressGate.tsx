import { ReactNode, cloneElement, isValidElement, MouseEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";

interface AddressGateProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "wrap" | "modal";
}

const hasDeliveryAddress = (customer: { address?: string | null; township?: string | null } | null | undefined) =>
  Boolean(customer?.address?.trim() && customer?.township?.trim());

const AddressGatePrompt = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const suffix = queryString ? `?${queryString}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-[20px] border-border bg-card p-5 sm:max-w-sm">
        <DialogHeader className="text-left">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-[16px] bg-action/10">
            <MapPin className="h-6 w-6 text-action" />
          </div>
          <DialogTitle className="font-display text-xl font-extrabold text-foreground">Add Your Delivery Address</DialogTitle>
          <DialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
            We need your address to deliver gas to you. Add it once — we'll remember for future orders.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 space-y-3">
          <Button variant="action" size="full" onClick={() => navigate(`/profile/address${suffix}`)}>
            Add Address
          </Button>
          <Button variant="outline" size="full" className="border-border-strong" onClick={() => { window.location.href = "tel:8484"; }}>
            <Phone className="mr-2 h-4 w-4" />
            Skip for now (Call 8484)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddressGate = ({ children, open, onOpenChange, mode = "wrap" }: AddressGateProps) => {
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("cid") ?? undefined;
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile(user?.id, urlCustomerId);
  const isOpen = open ?? false;
  const setIsOpen = onOpenChange ?? (() => undefined);

  if (mode === "modal") {
    return <AddressGatePrompt open={isOpen} onOpenChange={setIsOpen} />;
  }

  if (!isValidElement(children)) {
    return <>{children}<AddressGatePrompt open={isOpen} onOpenChange={setIsOpen} /></>;
  }

  return (
    <>
      {cloneElement(children as React.ReactElement<{ onClick?: (event: MouseEvent) => void }>, {
        onClick: (event: MouseEvent) => {
          if (!hasDeliveryAddress(customer)) {
            event.preventDefault();
            event.stopPropagation();
            setIsOpen(true);
            return;
          }
          children.props.onClick?.(event);
        },
      })}
      <AddressGatePrompt open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export { hasDeliveryAddress };
export default AddressGate;