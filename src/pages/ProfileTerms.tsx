import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lang, termsPreamble, termsSections, termsLabels } from "@/data/termsContent";

const ProfileTerms = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("mm");
  const t = termsLabels[lang];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button
          onClick={() => navigate("/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card"
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="flex-1 font-display text-lg font-extrabold text-foreground">{t.title}</h1>
        <button
          onClick={() => setLang(lang === "en" ? "mm" : "en")}
          className="h-9 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground"
          aria-label="Switch language"
        >
          {t.switchTo}
        </button>
      </div>

      <div className="px-5">
        <p className="mb-4 whitespace-pre-line text-[12px] leading-relaxed text-muted-foreground">
          {termsPreamble[lang]}
        </p>

        <Accordion type="single" collapsible className="space-y-2">
          {termsSections.map((section, i) => {
            const item = section[lang];
            return (
              <AccordionItem
                key={i}
                value={`tc-${i}`}
                className="rounded-[14px] border border-border bg-card px-4 shadow-sm"
              >
                <AccordionTrigger className="text-sm font-bold text-foreground text-left py-3.5 hover:no-underline">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground pb-3.5">
                  {item.body}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">{t.footer}</p>
      </div>
    </div>
  );
};

export default ProfileTerms;
