## Replace Mini App T&C with KBZ-Approved v2026-05-14 (bilingual)

Mirror the FAQ pattern. MM default, EN ⇄ MM toggle, Accordion per section. All legal text preserved verbatim from the uploaded prompt — including approved heading typos (USEAGE, LIABLILITY, IDEMNIFICATION).

### Files

**1. CREATE `src/data/termsContent.ts`**
- `export type Lang = "en" | "mm"`
- `export const termsPreamble: Record<Lang, string>` — EN + MM opening paragraph, copied byte-for-byte from the prompt
- `export interface TermsSection { en: { title; body }; mm: { title; body } }`
- `export const termsSections: TermsSection[]` — all 30 KBZ-approved sections, verbatim
- Bodies as plain strings with `\n\n` paragraph breaks; rendered via `whitespace-pre-line`
- Pure data module — no React, no imports

**2. REPLACE `src/pages/ProfileTerms.tsx`**
- Header layout: `[Back ←] [Title flex-1] [EN/MM toggle]` — same chrome as ProfileFAQ
- `useState<Lang>("mm")` — session-only, no localStorage
- Localized header title ("Terms & Conditions" / "စည်းကမ်းသတ်မှတ်ချက်များ")
- Toggle button shows the *other* language ("EN" when MM active, "မြန်မာ" when EN active)
- Preamble rendered as a muted intro paragraph above the Accordion
- `Accordion type="single" collapsible` from `@/components/ui/accordion`
- One `AccordionItem` per section (key = index):
  - Trigger → `sec[lang].title`
  - Content → `<p className="whitespace-pre-line text-[13px] text-muted-foreground leading-relaxed">{sec[lang].body}</p>`
- Footer (muted, small): `KBZ-approved · Last updated 2026-05-14` (+ MM equivalent)
- Styling: only semantic tokens (`bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `font-display`)

### Constraints honored
- No i18next / global i18n library
- No localStorage
- `/profile/terms` route untouched (App.tsx)
- `ProfilePage.tsx` link untouched
- All 30 sections + preamble copied verbatim, typos preserved

### Out of scope
- Routes, ProfilePage, FAQ page, edge functions, schema