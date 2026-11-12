import type { CSSProperties } from "react";
import { brand, hero, statement } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import CopyButton from "@/components/site/CopyButton";
import StatementRing from "./StatementRing";

/**
 * The ivory sheet that rises over the hero: the three lines turning on a ring
 * around the mark, a line dropping from it, and the project's credentials.
 */
export default function Statement() {
  return (
    <section className="sheet vellum arc statement" aria-labelledby="statement-title">
      <ArcBg />
      <div className="wrap">
        <h2 id="statement-title" className="sr-only">{hero.title}</h2>

        <StatementRing text={statement.ring}>
          <span className="mark mark-xl" aria-hidden="true">{brand.mark}</span>
        </StatementRing>

        <span className="statement-drop" data-reveal="rule" aria-hidden="true" />

        <dl className="creds">
          {statement.credentials.map((c, i) => (
            <div key={c.k} data-reveal="settle" style={i ? ({ "--i": i } as CSSProperties) : undefined}>
              <dt className="mono">{c.k}</dt>
              <dd>
                <span>{c.v}</span>
                {c.copy && <CopyButton value={c.v} />}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
