## Revised iPhone KBZPay WebView Zoom Fix

### Decision
Use Option B: drop the global CSS guard and ship only the two load-bearing textarea fixes.

Reason: a base-layer selector like `input, textarea, select { font-size: 16px; }` would not reliably override Tailwind utility classes such as `.text-sm`. Adding `!important` would work, but it creates unnecessary global styling debt. The current bug is fully addressed by Steps 1 and 2.

### Implementation plan

#### 1. Fix the Confirm Order Special Instructions textarea
File: `src/pages/OrderConfirm.tsx`

Patch the only raw `<textarea>` on this page, in the Special Instructions section.

Change:
```tsx
text-sm
```

to:
```tsx
text-base md:text-sm
```

Target class currently appears on the textarea className:
```tsx
className="w-full rounded-[14px] border-[1.5px] border-border-strong bg-bg-warm p-4 text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-action min-h-[70px] text-sm"
```

Result:
```tsx
className="w-full rounded-[14px] border-[1.5px] border-border-strong bg-bg-warm p-4 text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-action min-h-[70px] text-base md:text-sm"
```

#### 2. Harden the shared shadcn Textarea component
File: `src/components/ui/textarea.tsx`

Change the default textarea class from:
```tsx
text-sm
```

to:
```tsx
text-base md:text-sm
```

This matches the existing safe pattern in `src/components/ui/input.tsx`:
```tsx
text-base ... md:text-sm
```

#### 3. Do not change `index.html` viewport
No `maximum-scale=1.0` and no `user-scalable=no` will be added.

Reason: disabling user zoom is an accessibility regression. The root cause is the sub-16px focused textarea font size, not the viewport meta tag.

#### 4. Do not add the global CSS guard
No `input, textarea, select { font-size: 16px; }` rule will be added to `src/index.css`.

Reason: without `!important`, it does not override Tailwind `.text-sm`; with `!important`, it is broader than necessary.

### Verification after implementation
- Grep `src/pages/OrderConfirm.tsx` for the Special Instructions `<textarea>` and confirm it uses `text-base md:text-sm`.
- Confirm `src/components/ui/textarea.tsx` uses `text-base md:text-sm`.
- Confirm `src/components/ui/input.tsx` remains unchanged.
- Confirm there are no backend, Supabase, payment, routing, or KBZPay bridge changes.

### Publish and retest path
1. Apply the two frontend CSS class changes.
2. Click Lovable Publish → Update.
3. Wait about 60 seconds for `miniapp.anygas.org` CDN propagation.
4. Force-close KBZPay on the tester’s iPhone so the WebView reloads fresh assets.
5. Reopen AnyGas 8484 mini app → go to Confirm Order → tap Special Instructions.

Expected result: focusing and blurring the Special Instructions field should no longer zoom the Confirm Order screen.