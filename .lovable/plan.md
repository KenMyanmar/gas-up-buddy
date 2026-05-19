## Replace Mini App Privacy Policy with Bilingual Draft v1.0

Mirror the FAQ/T&C pattern for the Privacy screen. MM default, EN ⇄ MM toggle, Accordion per section. Content is DRAFT — not yet KBZ-approved.

### Files

1. **CREATE `src/data/privacyContent.ts`** — pure data module:
   - `Lang = "en" | "mm"`
   - `PrivacySection` interface (en/mm title + body)
   - `privacySections` array — 16 sections verbatim from the prompt, preserving the §16 numbering gap (jumps §15 → §17) and the `[full registered address to be added]` placeholder in §13
   - `privacyLabels` record for header title, switch-to label, and draft footer

2. **REPLACE `src/pages/ProfilePrivacy.tsx`** — full rewrite mirroring `ProfileTerms.tsx`:
   - `useState<Lang>("mm")` — session-only, no localStorage
   - Header: `[Back button] [Title flex-1] [EN/MM toggle]`
   - `Accordion type="single" collapsible` over `privacySections`, rendering `section[lang].title` and `section[lang].body` with `whitespace-pre-line`
   - Footer line clearly marks DRAFT v1.0 + Pending KBZ review

### Constraints honored

- No i18next or global i18n library
- No localStorage
- No changes to `App.tsx` route or `ProfilePage.tsx` link
- No edge functions, no schema, no shared tables — zero cross-app risk
- Semantic tokens only (border, bg-card, text-foreground, text-muted-foreground)
- All EN + MM text copied verbatim from the prompt, including the intentional §16 gap

### Verification after publish

Profile → Privacy Policy shows MM by default, 16 sections (§1–§15 then §17), §6 has 6.1–6.5, §13 shows ken@parami.com + 8484 + long code + bracketed address placeholder, footer reads "Draft v1.0 · Last updated 2026-05-19 · Pending KBZ review", EN/MM toggle flips all content.
