"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";
import { onBootDone } from "@/lib/boot";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-scrubbed reveals. After boot, arms the reveals (html.armed) and ties
 * each [data-reveal] element's --rv (0 → 1) to its own scroll range: from
 * when its top enters at 94 % of the viewport to when it reaches 62 %. The CSS
 * turns --rv into each variant (mask, sweep, rule, settle), so scrolling back
 * plays a reveal in reverse and scrolling down again replays it. The hidden
 * states exist only under html.armed: without JS, or with reduced motion,
 * everything is visible.
 */
export default function ScrollReveals() {
  useEffect(() => {
    if (!motionAllowed()) return;
    let ctx: gsap.Context | null = null;
    const off = onBootDone(() => {
      document.documentElement.classList.add("armed");
      ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(el => {
          gsap.fromTo(
            el,
            { "--rv": 0 },
            {
              "--rv": 1,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 94%", end: "top 62%", scrub: 0.6, invalidateOnRefresh: true },
            },
          );
        });
      });
      ScrollTrigger.sort();
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return null;
}
