import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How do I place an order?", a: "Tap 'Order Gas Now' on the home screen, choose your cylinder size, brand, and confirm. Your order will be dispatched to a nearby agent." },
  { q: "How long does delivery take?", a: "Most orders are delivered within 30–60 minutes depending on your location and agent availability." },
  { q: "What payment methods do you accept?", a: "We currently accept Cash on Delivery. KBZ Pay and Wave Money support is coming soon." },
  { q: "Can I cancel my order?", a: "You can cancel before the order is dispatched. Once an agent is on the way, cancellation may not be possible." },
  { q: "How do I contact support?", a: "Call 8484 anytime — our support line is available 24/7. You can also reach us through the app." },
  { q: "Is my data safe?", a: "Yes. We only collect the information necessary to process your orders and never share your personal data with third parties." },
];

const ProfileFAQ = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={() => navigate("/profile")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-extrabold text-foreground">Help & FAQ</h1>
      </div>

      <div className="px-5">
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-[14px] border border-border bg-card px-4 shadow-sm">
              <AccordionTrigger className="text-sm font-bold text-foreground text-left py-3.5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-3.5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default ProfileFAQ;
