# Self-host Google Fonts via @fontsource

## Why
KBZ Pay Mini Program Server Domain Whitelist blocks `fonts.googleapis.com` and `fonts.gstatic.com`. Currently `src/index.css` loads all three font families via `@import url('https://fonts.googleapis.com/css2?...')`. We must bundle them.

## Where the external request lives
- `src/index.css` line 1 — `@import url('https://fonts.googleapis.com/css2?family=DM+Sans...&family=Outfit...&family=Padauk...&display=swap')`
- `index.html` — no font `<link>` tags (clean already)
- Grep for `fonts.googleapis|fonts.gstatic` across the repo (excluding node_modules) currently shows only the one line above.

## Changes

1. **Install packages**
   ```
   bun add @fontsource/dm-sans @fontsource/outfit @fontsource/padauk
   ```

2. **Edit `src/main.tsx`** — add at the very top, before existing imports:
   ```ts
   // Self-hosted fonts (replaces fonts.googleapis.com @import)
   import "@fontsource/dm-sans/400.css";
   import "@fontsource/dm-sans/500.css";
   import "@fontsource/dm-sans/600.css";
   import "@fontsource/dm-sans/700.css";
   import "@fontsource/dm-sans/800.css";
   import "@fontsource/dm-sans/900.css";
   import "@fontsource/outfit/400.css";
   import "@fontsource/outfit/500.css";
   import "@fontsource/outfit/600.css";
   import "@fontsource/outfit/700.css";
   import "@fontsource/outfit/800.css";
   import "@fontsource/outfit/900.css";
   import "@fontsource/padauk/400.css";
   import "@fontsource/padauk/700.css";
   ```

3. **Edit `src/index.css`** — remove the first `@import url('https://fonts.googleapis.com/...')` line. Leave everything else (the `@tailwind` directives and design tokens) intact. Font-family names in CSS (`'DM Sans'`, `'Outfit'`, `'Padauk'`) stay identical — @fontsource exposes the same family names.

4. **No other files change.** `index.html` has no font links to remove.

## Verification
- `rg "fonts.googleapis.com|fonts.gstatic.com"` → 0 hits
- `package.json` lists the three `@fontsource/*` deps
- After Lovable build, dist contains 14 woff2 files (6 DM Sans + 6 Outfit + 2 Padauk)
- Preview Network tab shows no requests to fonts.googleapis.com / fonts.gstatic.com; woff2 files load same-origin

## Out of scope
- No font-family renames, no weight additions/removals, no fallback changes, no edge function or supabase/ changes.

## Post-implementation
User clicks Publish → Update, then waits 60s before retesting on miniapp.anygas.org / KBZ Pay shell.
