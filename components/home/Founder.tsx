import type { CSSProperties } from "react";
import { founder, sheets } from "@/lib/content/site";
import { MaskLines } from "@/components/site/SheetHead";

export default function Founder() {
  const { id, sheet } = sheets.founder;
  return (
    <section className="sheet on-dark" id={id} data-sheet={sheet}>
      <div className="wrap" data-parallax>
        <div className="founder">
          {/* TODO(client): portrait photo. The outlined monogram stands in until one is supplied. */}
          <div className="portrait" data-reveal="sweep">
            <span className="corner c1" />
            <span className="corner c2" />
            <span className="ini" aria-hidden="true">{founder.initials}</span>
            <div className="cap-t mono">
              <span>{founder.name}</span>
              <span style={{ color: "var(--brass)" }}>{founder.role}</span>
            </div>
          </div>
          <div>
            <blockquote data-reveal="mask">
              <p className="quote">
                <MaskLines
                  lines={founder.quote.map((parts, i) => (
                    <span key={i}>
                      {parts.map((part, j) => (part.mark ? <mark key={j}>{part.text}</mark> : <span key={j}>{part.text}</span>))}
                    </span>
                  ))}
                />
              </p>
            </blockquote>
            <div className="attrib" data-reveal="settle">
              <b>{founder.name}</b>
              <span className="mono" style={{ color: "var(--line-dim)" }}>{founder.attribution}</span>
            </div>
            <p data-reveal="settle" style={{ "--i": 1, marginTop: 24, color: "var(--line-dim)", maxWidth: "58ch" } as CSSProperties}>
              {founder.story}
            </p>
            <div className="values" data-reveal="settle" style={{ "--i": 2 } as CSSProperties}>
              {founder.values.map(v => (
                <div key={v.title}>
                  <h3>{v.title}</h3>
                  <p>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
