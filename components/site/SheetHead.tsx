import type { CSSProperties, ReactNode } from "react";

/** A heading revealed line by line through a mask. */
export function MaskLines({ lines }: { lines: ReactNode[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span className="line" key={i} style={i ? ({ "--i": i } as CSSProperties) : undefined}>
          <span>{line}</span>
        </span>
      ))}
    </>
  );
}

/** A section's own name (the live site's title for it), set small above a heading. */
export function SheetLabel({ children }: { children: ReactNode }) {
  return (
    <div className="sheet-label" data-reveal="settle">
      {children}
    </div>
  );
}

/** A section's heading and its intro paragraph(s), with an optional label above. */
export default function SheetHead({ label, heading, body }: { label?: string; heading: string[]; body: string | string[] }) {
  const paragraphs = Array.isArray(body) ? body : [body];
  return (
    <div className="sheet-head">
      {label && <SheetLabel>{label}</SheetLabel>}
      <h2 data-reveal="mask">
        <MaskLines lines={heading} />
      </h2>
      {paragraphs.map((text, i) => (
        <p data-reveal="settle" className={i ? "more" : undefined} style={{ "--i": 2 + i } as CSSProperties} key={i}>
          {text}
        </p>
      ))}
    </div>
  );
}
