## Fix Privacy renderer: honor single `\n` within paragraphs

**File:** `src/pages/ProfilePrivacy.tsx` (only this file)

**Problem:** `renderBody()` splits on `\n\n` for paragraphs but collapses single `\n` into spaces, squishing bullet lists (§8 Data Retention, §4, §10) into one flowing line.

**Change:**

1. Extract the inline bold-rendering logic into a `renderInline(text, keyPrefix)` helper that handles `**bold**` segments.
2. Update `renderBody()` so each `\n\n`-separated paragraph is further split by `\n`, with `<br />` inserted between lines. Each line runs through `renderInline()`.

```tsx
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
```

3. Add `Fragment` to the React import:
   `import { Fragment, useState } from "react";`
   (Keep `ArrowLeft` from `lucide-react` as-is.)

**No data changes.** No other files touched. After Publish, §8 retention bullets and §4/§10 lists render on separate lines.
