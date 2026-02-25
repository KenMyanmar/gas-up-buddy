

# Fix Bugs 2 and 3: LinkNewCustomer + Township Interface

## Bug 2: LinkNewCustomer sends wrong field name and value

The Edge Function expects `{ township: "Hlaing" }` (a name string). The client sends `{ township_id: "uuid-here" }` (a UUID).

### Changes in `src/pages/LinkNewCustomer.tsx`:

1. **Line 16**: Rename state from `townshipId` to `townshipName` (tracks the selected name, not UUID)
2. **Line 19**: Update validation to use `townshipName`
3. **Line 47**: Change payload from `township_id: townshipId` to `township: townshipName`
4. **Lines 92-93**: The `<select>` value/onChange use `townshipName`
5. **Line 101**: `<option value={t.name}>` instead of `value={t.id}` — sends the name string
6. **Line 102**: Display `{t.name} ({t.zone})` instead of `{t.name}, {t.city}` (Bug 3 fix for display)

## Bug 3: Township interface has wrong fields

### Changes in `src/hooks/useTownships.ts`:

Replace `city: string` and `region: string` with `zone: string` and `zone_priority: number` to match the actual database schema (confirmed from network response).

## File Summary

| File | Lines | Change |
|------|-------|--------|
| `src/hooks/useTownships.ts` | 7-8 | `city`/`region` → `zone`/`zone_priority` |
| `src/pages/LinkNewCustomer.tsx` | 16 | `townshipId` → `townshipName` |
| `src/pages/LinkNewCustomer.tsx` | 19 | validation uses `townshipName` |
| `src/pages/LinkNewCustomer.tsx` | 47 | `township_id: townshipId` → `township: townshipName` |
| `src/pages/LinkNewCustomer.tsx` | 92-93 | select value/onChange use `townshipName` |
| `src/pages/LinkNewCustomer.tsx` | 101-102 | `value={t.name}`, display `{t.name} ({t.zone})` |

