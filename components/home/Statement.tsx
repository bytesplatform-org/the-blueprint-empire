import type { CSSProperties } from "react";
import { about, brand, hero, statement } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import CopyButton from "@/components/site/CopyButton";
import ScrubText from "@/components/site/ScrubText";
import { MaskLines } from "@/components/site/SheetHead";
import StatementRing from "./StatementRing";

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

/**
 * The ivory sheet that rises over the hero: the three lines turning on a ring
 * around the mark, a line dropping from it, and the project's credentials.
 * Then who we are, and the invitation to partner.
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

        <div className="about" id="about">
          <h2 data-reveal="mask">
            <MaskLines lines={[about.heading]} />
          </h2>
          <div className="about-body">
            <ScrubText className="about-lead" text={about.lead} />
            <p data-reveal="settle">{about.body}</p>
            <div className="nsba" data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
              <span className="seal">{about.nsba.seal}</span>
              <p>{about.nsba.body}</p>
            </div>
          </div>
        </div>

        <div className="partner" data-reveal="settle">
          <div>
            <div className="sheet-label">{about.partner.label}</div>
            <h3>{about.partner.heading}</h3>
          </div>
          <a className="btn" href={about.partner.cta.href} target="_blank" rel="noopener">
            {about.partner.cta.label}
            <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
