import type { CSSProperties } from "react";
import { mission, sheets, structure } from "@/lib/content/site";
import { MaskLines } from "@/components/site/SheetHead";
import ScrubText from "@/components/site/ScrubText";
import ArcBg from "@/components/site/ArcBg";
import Marquee from "./Marquee";

/**
 * "Our Mission", read in word by word as it scrolls past, then "You Don't
 * Need More Ideas — You Need Structure." on a dark panel inset in the sheet,
 * its stanzas settling in one after another and the last line in gold. The
 * marquee band closes the section: it belongs to it, so it sits inside the
 * same drifting wrapper and moves with the rest as the contact sheet rises.
 */
export default function Mission() {
  const { id, sheet } = sheets.mission;
  return (
    <section className="sheet vellum arc mission-sec" id={id} data-sheet={sheet}>
      <ArcBg />
      <div data-parallax>
        <div className="wrap">
          <div className="mission">
            <h2 data-reveal="mask">
              <MaskLines lines={mission.heading} />
            </h2>
            <ScrubText className="mission-text" text={mission.body} />
          </div>

          <div className="structure">
            <h2 className="structure-title" data-reveal="mask">
              <MaskLines lines={structure.heading.map((line, i) => (i ? <em key={i}>{line}</em> : line))} />
            </h2>
            <div className="stanzas">
              {structure.stanzas.map((stanza, i) => (
                <p key={i} data-reveal="settle" className={i === structure.stanzas.length - 1 ? "last" : undefined} style={i ? ({ "--i": i } as CSSProperties) : undefined}>
                  {stanza.map((line, j) => (
                    <span key={j}>{line}</span>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </div>
        <Marquee />
      </div>
    </section>
  );
}
