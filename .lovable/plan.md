## Phase 1 — WelcomePage Visual Polish (v2)

Single-file change: `src/pages/WelcomePage.tsx`. Frontend polish only. No backend, hooks, routing, or dependency changes.

### Scope
Only the first-time empty state (`!isComplete && !showConfirmation`, form branch ~lines 313–357). Confirmation card, edit mode, loading, error, `handleSave`, validation, and the `customer-update` edge function call stay untouched.

### Changes

1. **Imports** — add `ShieldCheck` to the existing `lucide-react` import.

2. **State** — add `const [nameWasPrefilled, setNameWasPrefilled] = useState(false);`. Inside the existing `useMemo` initializer, set it `true` when `customer.full_name?.trim()` is non-empty. In the Full Name input's `onChange`, also call `setNameWasPrefilled(false)` so the badge disappears on first keystroke.

3. **Primary phone** — derive `const primaryPhone = phonesQ.data?.find(p => p.is_primary)?.phone;`.

4. **Heading microcopy** — in the existing heading ternary, replace empty-state `"Welcome to AnyGas 8484! 🎉"` with `"Welcome to AnyGas"`. The `hasAnyField` and `showConfirmation` branches stay the same.

5. **Form-branch layout**:
   - Above the `<h1>` (rendered only when `!showConfirmation`), add a **progress dots** row:
     ```
     <div className="flex gap-1.5 items-center text-[11px] text-muted-foreground mb-2">
       <span className="w-1.5 h-1.5 rounded-full bg-action" />
       <span className="w-1.5 h-1.5 rounded-full bg-border" />
       <span>Step 1 of 2 · Your details</span>
     </div>
     ```
   - After the subheading and before the Full Name input, insert the **KBZ Verified card**:
     ```
     <div className="flex items-center gap-3 rounded-2xl bg-card border-2 border-action/20 p-4">
       <ShieldCheck className="h-5 w-5 text-action shrink-0" />
       <div className="flex-1">
         <div className="text-sm font-semibold text-foreground">
           {primaryPhone || "Your KBZ Pay number"}
         </div>
         <div className="text-xs text-action mt-0.5 flex items-center gap-1">
           <Check className="h-3 w-3" /> Verified by KBZ Pay
         </div>
       </div>
     </div>
     ```
   - Below the Full Name input, render the **pre-fill hint** only when `nameWasPrefilled && name.trim().length > 0`:
     ```
     <p className="mt-1.5 text-xs text-action flex items-center gap-1">
       <Check className="h-3 w-3" /> from KBZ Pay
     </p>
     ```
   - **Reorder**: move `<PhonesSection />` inside the form `space-y-5` container, between the Address field and the Get Started button.
   - **PhonesSection** (~line 432): remove the `mt-8` from its outer wrapper `<div className="mt-8 rounded-2xl border-2 border-border bg-card p-5">` so `space-y-5` governs spacing.

### Resulting first-timer order
progress dots → heading → subheading → KBZ Verified card → Full Name (+ pre-fill hint) → Township → Address → PhonesSection → Get Started → SupportFooter.

### Out of scope
GPS/map, bilingual labels, KbzProfileComplete cleanup, register-customer audit, edge-function changes, new deps, any change to confirmation/edit/loading/error states or `handleSave`.

### Self-check
- Returning user (`isComplete`) still sees unchanged confirmation card.
- First-timer sees the new ordered layout above.
- Pre-fill hint disappears on first keystroke.
- Submission still calls `customer-update` and navigates to `/home`.
- Only new import: `ShieldCheck`. No package.json changes.
- PhonesSection no longer carries `mt-8`; spacing is uniform.
