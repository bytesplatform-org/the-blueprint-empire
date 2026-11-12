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

/** A section's heading and its intro paragraph. */
export default function SheetHead({ heading, body }: { heading: string[]; body: string }) {
  return (
    <div className="sheet-head">
      <h2 data-reveal="mask">
        <MaskLines lines={heading} />
      </h2>
      <p data-reveal="settle" style={{ "--i": 2 } as CSSProperties}>
        {body}
      </p>
    </div>
  );
}
