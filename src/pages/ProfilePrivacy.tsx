import { ArrowLeft } from "lucide-react";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lang, privacySections, privacyLabels } from "@/data/privacyContent";

function renderInline(text: string, keyPrefix: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((segment, j) => {
    const m = segment.match(/^\*\*([^*]+)\*\*$/);
    return m ? (
      <strong key={`${keyPrefix}-${j}`} className="text-foreground font-semibold">{m[1]}</strong>
    ) : (
      <span key={`${keyPrefix}-${j}`}>{segment}</span>
    );
  });
}

function renderBody(body: string) {
  return body.split("\n\n").map((para, i) => {
    const lines = para.split("\n");
    return (
      <p key={i} className={i > 0 ? "mt-3" : ""}>
        {lines.map((line, k) => (
          <Fragment key={k}>
            {k > 0 && <br />}
            {renderInline(line, `${i}-${k}`)}
          </Fragment>
        ))}
      </p>
    );
  });
}

const ProfilePrivacy = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("mm");
  const t = privacyLabels[lang];

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
        <Accordion type="single" collapsible className="space-y-2">
          {privacySections.map((section, i) => {
            const item = section[lang];
            return (
              <AccordionItem
                key={i}
                value={`pp-${i}`}
                className="rounded-[14px] border border-border bg-card px-4 shadow-sm"
              >
                <AccordionTrigger className="text-sm font-bold text-foreground text-left py-3.5 hover:no-underline">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground pb-3.5">
                  {renderBody(item.body)}
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

export default ProfilePrivacy;
