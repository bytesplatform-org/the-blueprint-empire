import type { CSSProperties } from "react";
import Image from "next/image";
import { impact, sheets } from "@/lib/content/site";
import { MaskLines } from "@/components/site/SheetHead";

/**
 * "Impact Across Our Ecosystem" beside "Built for Growth": the six areas set
 * large, each drawing its gold rule in as it scrolls up.
 */
export default function Impact() {
  const { id, sheet } = sheets.impact;
  return (
    <section className="sheet deep on-dark" id={id} data-sheet={sheet}>
      <div className="wrap" data-parallax>
        <div className="impact">
          <div className="impact-copy">
            <h2 data-reveal="mask">
              <MaskLines lines={impact.heading} />
            </h2>
            <p data-reveal="settle" style={{ "--i": 2 } as CSSProperties}>{impact.body}</p>
            <figure className="impact-logo" data-reveal="settle" style={{ "--i": 3 } as CSSProperties}>
              <Image src={impact.logo.src} alt={impact.logo.alt} width={impact.logo.width} height={impact.logo.height} sizes="(max-width: 900px) 70vw, 340px" />
            </figure>
          </div>
          <div className="growth">
            <h3 className="growth-title" data-reveal="settle">{impact.growth.heading}</h3>
            <ul>
              {impact.growth.items.map((item, i) => (
                <li key={item} data-reveal="settle" style={i ? ({ "--i": i % 3 } as CSSProperties) : undefined}>
                  <span className="g-rule" data-reveal="rule" aria-hidden="true" />
                  <span className="g-name">{item}</span>
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
