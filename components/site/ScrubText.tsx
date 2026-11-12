"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";

gsap.registerPlugin(ScrollTrigger);

/** dim words, before the reading head reaches them */
const DIM = 0.16;
/** how many words the head's soft edge spans */
const EDGE = 4;

/**
 * A paragraph that is read in as you scroll: a reading head runs through the
 * words in order, and each word comes up from dim to full ink as it passes.
 * Every word's opacity is computed from the (smoothed) scroll progress, so the
 * whole paragraph is always in a consistent state: lit behind the head, dim
 * ahead of it, and scrolling back dims it again. Without motion it is a plain
 * paragraph.
 */
export default function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const p = ref.current;
    if (!p || !motionAllowed()) return;
    const words = [...p.querySelectorAll<HTMLElement>("[data-w]")];
    const n = words.length;
    const apply = (progress: number) => {
      const head = progress * (n + EDGE);
      words.forEach((w, i) => {
        const lit = Math.min(1, Math.max(0, (head - i) / EDGE));
        w.style.opacity = (DIM + (1 - DIM) * lit).toFixed(3);
      });
    };
    apply(0);
    const state = { p: 0 };
    const tween = gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: () => apply(state.p),
      scrollTrigger: {
        trigger: p,
        start: "top 82%",
        end: "bottom 52%",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      words.forEach(w => w.style.removeProperty("opacity"));
    };
  }, []);

  const words = text.split(/\s+/);
  return (
    <p className={className} ref={ref}>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span data-w="">{w}</span>
        </Fragment>
      ))}
    </p>
  );
}
