

## Fix `Pay with KBZPay` label + audit "leave KBZPay" prompt triggers

### 1. One-line brand fix (the only code change)

**`src/pages/OrderConfirm.tsx` line 273**
```diff
-              `Pay with KBZ Pay — ${orderState.totalAmount.toLocaleString()} MMK`
+              `Pay with KBZPay — ${orderState.totalAmount.toLocaleString()} MMK`
```

That's the last remaining customer-facing "KBZ Pay" string in the order flow. Everything else from the previous rename pass is already correct.

### 2. Investigation: where the "leave KBZPay" native dialog comes from

The dialog the user saw is **not** rendered by our app — there is no "leave"/"Leave" string anywhere in `src/`. It is the native KBZ Pay shell's confirmation prompt fired by the host WebView whenever the page asks the OS to handle a non-`https`/non-`http` URL scheme or a `target=_blank` navigation.

**Audit results across the repo**

| Trigger pattern | Where it appears | Will it fire the prompt? |
|---|---|---|
| `window.open` / `target="_blank"` / `location.href = …` | None in `src/` (only `location.href` read inside `index.html` perf beacon) | No |
| `tel:8484` `<a href>` | `src/pages/WelcomePage.tsx:42`, `src/pages/PhoneEntry.tsx:213, 248` | **Yes — tapping any of these inside KBZ Mini App launches the native dialer, which the KBZ shell guards with the "Leave KBZPay?" prompt.** This is the only realistic in-app source. |
| `mailto:` | None | No |
| External `https://` (Leaflet tiles, marker icons, Supabase API) | `OrderTracking.tsx`, `client.ts` | No — XHR/img loads stay in-WebView |
| Hash-router internal navigation (`#/...`) | All routes | No |
| `kbzpay-bridge.ts` `ma.callNativeAPI` (startPay) | `OrderConfirm.tsx` | No — this is the official cashier bridge, runs in-shell |

**Conclusion**: the only customer-tappable element that can pop "Leave KBZPay?" today is the **"Call 8484" support link** on `WelcomePage` and `PhoneEntry`. The user most likely tapped it (or accidentally long-pressed it) while still in the onboarding/error screen — the session-replay shows the user did sit on `/onboarding/phone` after the failed sign-in attempt where "Call 8484" is the prominent help link.

### 3. Recommendations (NOT applied in this patch — flagged for your decision)

These are not part of this one-line fix. Listing them so you can decide whether to schedule a follow-up:

- **Option A (safest UX inside Mini App)**: replace `<a href="tel:8484">` with a button that opens an in-app dialog showing "Call 8484" as plain copyable text and a "Copy number" action. No leave-prompt, no dialer launch. Outside the Mini App (regular browser/PWA), still keep the `tel:` behaviour.
- **Option B (minimal)**: keep `tel:8484` but only render it when `isKBZPayMiniApp() === false`. Inside the Mini App show non-link text "Call 8484 for help". This guarantees zero leave-prompts during the KBZ pilot.
- **Option C (do nothing)**: accept that tapping "Call 8484" will continue to trigger the native prompt — which is actually the *correct* OS behaviour for placing a call. Document it.

### Files touched in this change

1. `src/pages/OrderConfirm.tsx` — single string literal on line 273.

No other files, no DB, no edge functions, no routing, no auth changes.

### Acceptance

- Order Confirm sticky footer button reads **"Pay with KBZPay — 28,000 MMK"** (no space in KBZPay).
- `grep -R "KBZ Pay" src/` returns only code comments and `kbzpay-bridge.ts` thrown-error strings (developer-facing, intentionally left).
- No behaviour change to payment flow, no new strings introduced.

### Out of scope

Tel-link / "leave KBZPay" prompt mitigation — investigated and reported above; awaiting your direction on Option A / B / C before any change.

