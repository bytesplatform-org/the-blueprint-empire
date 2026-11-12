import { Fragment } from "react";
import { brand, hero, sheets } from "@/lib/content/site";
import HeroStage from "./HeroStage";

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

/** The lede as words; the words of the strong phrase are flagged to light up in gold. */
const statementWords = [
  ...hero.lede.before.trim().split(/\s+/).map(w => ({ w, hi: false })),
  ...hero.lede.strong.trim().split(/\s+/).map(w => ({ w, hi: true })),
  ...hero.lede.after.trim().split(/\s+/).map(w => ({ w, hi: false })),
];

export default function Hero() {
  return (
    <HeroStage id={sheets.hero.id} sheet={sheets.hero.sheet}>
      <div className="hero-in">
        <div className="hero-top mono" data-hero-fade>
          <span>{hero.kicker}</span>
          <ol className="hero-seq">
            {brand.sequence.map(s => <li key={s}>{s}</li>)}
          </ol>
        </div>

        <h1 className="hero-title" id="hero-title" aria-label={hero.title}>
          {hero.lines.map(line => (
            <span className="hl" data-line data-dir={line.dir} key={line.hollow}>
              <span className="hw" data-atlas-word data-hollow="">{line.hollow}</span>{" "}
              <span className="hw" data-atlas-word>{line.filled}</span>
              <span className="bl" data-baseline />
            </span>
          ))}
        </h1>

        <div className="hero-bar">
          <a className="btn" href={hero.ctas.primary.href}>
            {hero.ctas.primary.label}
            <Arrow />
          </a>
          <a className="btn ghost" href={hero.ctas.secondary.href} target="_blank" rel="noopener">
            {hero.ctas.secondary.label}
          </a>
        </div>
      </div>

      {/*
        With motion the lede takes the headline's place as you scroll: the hero
        pins, the headline blurs away and these words blur in one by one (see
        HeroStage). Without motion it simply sits below the headline.
      */}
      <div className="hero-statement">
        <p className="hs-text">
          {statementWords.map(({ w, hi }, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className={hi ? "hs-word hs-hi" : "hs-word"} data-hs-word>{w}</span>
            </Fragment>
          ))}
        </p>
      </div>
    </HeroStage>
  );
}
