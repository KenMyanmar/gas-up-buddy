

# Plan: Remove Email Button + Verify Phone Format

## Two changes, both small.

---

### 1. Remove "Continue with Email" from Welcome Screen

**File:** `src/pages/Welcome.tsx`

Remove the entire "Continue with Email" `<Button>` block (lines 38-46 in the current file). This leaves only the green "Continue with Phone" button as the single CTA.

Before:
```text
[Continue with Phone]  ← keep
[Continue with Email]  ← remove
```

After:
```text
[Continue with Phone]  ← only button
```

Also remove the `Mail` import from lucide-react since it's no longer used.

---

### 2. Verify Phone Format Conversion in PhoneEntry

**File:** `src/pages/PhoneEntry.tsx`

The current code already has the conversion at line 28:
```typescript
const intlPhone = "+95" + phone.slice(1);
```

This correctly converts `09xxxxxxxxx` → `+959xxxxxxxxx`. The input validation (`/^09\d{7,9}$/`) ensures the phone always starts with `09`, so the conversion is safe.

**No change needed** — the format conversion is already correct.

---

### Files Summary

| File | Action |
|------|--------|
| `src/pages/Welcome.tsx` | Remove email button + `Mail` import |
| `src/pages/PhoneEntry.tsx` | No change (conversion already correct) |

