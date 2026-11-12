"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";

gsap.registerPlugin(ScrollTrigger);

/** Ring radius in the 1000×1000 viewBox. */
const R = 380;
const CIRC = 2 * Math.PI * R;

/**
 * The three lines set on a circle around the mark. While the section is on
 * screen the ring turns with the scroll (both ways) and scales in as it
 * arrives. (The hero's drift behind it is ArcParallax's.)
 */
export default function StatementRing({ text, children }: { text: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const section = el?.closest("section");
    if (!el || !section || !motionAllowed()) return;
    const ring = el.querySelector("[data-ring]");
    const mark = el.querySelector("[data-mark]");

    const ctx = gsap.context(() => {
      gsap.fromTo(ring, { rotate: -150 }, {
        rotate: 210,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
      gsap.fromTo(ring, { scale: 0.86 }, {
        scale: 1,
        ease: "none",
        immediateRender: false,
        scrollTrigger: { trigger: section, start: "top 95%", end: "center 55%", scrub: 0.6 },
      });
      gsap.from(mark, {
        autoAlpha: 0,
        scale: 0.8,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: mark, start: "top 80%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="st-ring" ref={ref}>
      <svg data-ring viewBox="0 0 1000 1000" aria-hidden="true">
        <defs>
          <path id="statement-ring" d={`M 500 ${500 - R} a ${R} ${R} 0 1 1 -0.01 0`} fill="none" />
        </defs>
        <circle cx="500" cy="500" r={R - 52} fill="none" className="st-ring-rule" />
        <text className="st-ring-text">
          <textPath href="#statement-ring" textLength={CIRC} lengthAdjust="spacing">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
      <div className="st-ring-core">
        <div data-mark>{children}</div>
      </div>
    </div>
  );
}
