"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wherever a curved ivory sheet (.arc) rises over the section before it,
 * that section drifts down at ~60 % speed while it's being covered, so the
 * sheet appears to scroll faster and lift off the page.
 *
 * The drift moves the previous section's [data-parallax] wrapper, or the
 * section itself when it's marked (only where it holds no pin: a transform on
 * a pinned element or any ancestor of one would break the pin). Mounted once,
 * after every section.
 */
export default function ArcParallax() {
  useEffect(() => {
    if (!motionAllowed()) return;
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>("section.arc").forEach(sheet => {
        // the previous section itself (when it holds no pin), or its marked wrapper
        const prev = sheet.previousElementSibling as HTMLElement | null;
        const target = prev?.matches("[data-parallax]") ? prev : prev?.querySelector<HTMLElement>("[data-parallax]");
        if (!target) return;
        // No transform at all outside the drift (immediateRender off, cleared
        // when scrolled back above it): a transform on a section that holds a
        // pin (the elevation's) would break that pin.
        gsap.fromTo(
          target,
          { y: 0 },
          {
            y: () => window.innerHeight * 0.4,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: sheet,
              start: "top bottom",
              end: "top top",
              scrub: true,
              invalidateOnRefresh: true,
              onLeaveBack: () => gsap.set(target, { clearProps: "transform" }),
            },
          },
        );
      });
    });
    ScrollTrigger.sort();
    return () => ctx.revert();
  }, []);

  return null;
}
