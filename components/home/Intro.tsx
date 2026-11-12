import type { CSSProperties } from "react";
import { intro, sheets } from "@/lib/content/site";
import SheetHead from "@/components/site/SheetHead";
import Elevation from "./Elevation";

/** A civic building in elevation, one group per stage. */
function ElevationDrawing() {
  return (
    <svg viewBox="0 0 520 440" aria-hidden="true">
      <g data-stage="0">
        <path className="ink thin" pathLength={1} d="M10 380 H510" />
        <path className="ink thin" pathLength={1} d="M20 380 l8 8 M40 380 l8 8 M60 380 l8 8 M460 380 l8 8 M480 380 l8 8 M500 380 l8 8" />
        <path className="ink" pathLength={1} d="M60 366 H460 V380 H60 Z" />
        <path className="ink" pathLength={1} d="M72 354 H448 V366 H72 Z" />
      </g>
      <g data-stage="1">
        <path className="ink" pathLength={1} d="M96 202 V346 M124 202 V346 M92 194 H128 V202 H92 Z M90 346 H130 V354 H90 Z" />
        <path className="ink" pathLength={1} d="M160 202 V346 M188 202 V346 M156 194 H192 V202 H156 Z M154 346 H194 V354 H154 Z" />
        <path className="ink" pathLength={1} d="M224 202 V346 M252 202 V346 M220 194 H256 V202 H220 Z M218 346 H258 V354 H218 Z" />
        <path className="ink" pathLength={1} d="M268 202 V346 M296 202 V346 M264 194 H300 V202 H264 Z M262 346 H302 V354 H262 Z" />
        <path className="ink" pathLength={1} d="M332 202 V346 M360 202 V346 M328 194 H364 V202 H328 Z M326 346 H366 V354 H326 Z" />
        <path className="ink" pathLength={1} d="M396 202 V346 M424 202 V346 M392 194 H428 V202 H392 Z M390 346 H430 V354 H390 Z" />
        <path className="ink thin" pathLength={1} d="M110 206 V342 M174 206 V342 M238 206 V342 M282 206 V342 M346 206 V342 M410 206 V342" />
      </g>
      <g data-stage="2">
        <path className="ink" pathLength={1} d="M80 170 H440 V194 H80 Z" />
        <path className="ink thin" pathLength={1} d="M80 182 H440" />
        <path className="ink thin" pathLength={1} d="M484 96 V380 M478 96 H490 M478 380 H490" />
      </g>
      <g data-stage="3">
        <path className="ink" pathLength={1} d="M70 170 L260 96 L450 170 Z" />
        <path className="fillin" data-fill="" d="M118 162 L260 107 L402 162 Z" />
        <path className="ink thin" pathLength={1} d="M118 162 L260 107 L402 162 Z" />
        <path className="ink thin" pathLength={1} d="M70 76 H450 M70 70 V82 M450 70 V82" />
        <path className="ink acc" pathLength={1} d="M273 146 H330 L348 128" />
        <circle className="ink acc" pathLength={1} cx="260" cy="146" r="13" />
      </g>
      <path className="cl" d="M260 90 V400" />
      <text x="236" y="66">38&apos;-0&quot;</text>
      <text x="496" y="244" transform="rotate(90 496 244)">28&apos;-6&quot;</text>
      <text x="256" y="150" className="acc-t">A</text>
      <text x="352" y="126" className="acc-t">LEGACY</text>
      <text x="62" y="408">SOUTH ELEVATION</text>
      <text x="62" y="424">SCALE 1/8&quot; = 1&apos;-0&quot;</text>
      <text x="330" y="408">DWG NO. BE-001</text>
      <text x="330" y="424">REV. 2026</text>
    </svg>
  );
}

export default function Intro() {
  const { id, sheet } = sheets.intro;
  return (
    <section className="sheet deep on-dark" id={id} data-sheet={sheet}>
      <div className="wrap" data-parallax>
        <SheetHead heading={intro.heading} body={intro.body} />
        <Elevation>
          <ol className="stages">
            {intro.stages.map((stage, i) => (
              <li key={stage.title} data-reveal="settle" style={i ? ({ "--i": i } as CSSProperties) : undefined}>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </li>
            ))}
          </ol>
          <figure className="fig" data-elevation aria-label={intro.figure.label}>
            <ElevationDrawing />
          </figure>
        </Elevation>
      </div>
    </section>
  );
}
