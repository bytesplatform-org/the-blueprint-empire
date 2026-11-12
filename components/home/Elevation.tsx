"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * The elevation rises with the scroll: the four [data-stage] groups draw in
 * order, the pediment fills, and the matching stage in the list lights.
 * Pinned while it builds, so it completes before the next sheet rises over
 * it. Without motion everything is drawn.
 */
export default function Elevation({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fig = el.querySelector<HTMLElement>("[data-elevation]");
    const groups = [...el.querySelectorAll<SVGGElement>("[data-stage]")];
    const items = [...el.querySelectorAll<HTMLLIElement>(".stages li")];
    const fill = el.querySelector<SVGPathElement>("[data-fill]");
    if (!fig || !fill) return;

    if (!motionAllowed()) {
      items.forEach(li => li.classList.add("on"));
      return () => items.forEach(li => li.classList.remove("on"));
    }

    const root = document.documentElement;
    root.classList.add("has-st");
    const paths = groups.map(g => [...g.querySelectorAll<SVGGeometryElement>("[pathLength]")]);
    paths.flat().forEach(p => {
      p.style.strokeDasharray = "1";
      p.style.strokeDashoffset = "1";
    });
    fill.style.opacity = "0";

    const apply = (progress: number) => {
      const s = progress * 4;
      paths.forEach((ps, i) => {
        const k = Math.min(1, Math.max(0, s - i));
        ps.forEach((p, j) => {
          const kk = Math.min(1, Math.max(0, k * ps.length - j * 0.6));
          p.style.strokeDashoffset = String(1 - kk);
        });
      });
      fill.style.opacity = String(Math.min(1, Math.max(0, (s - 3.4) / 0.6)));
      const idx = Math.min(3, Math.floor(s));
      items.forEach((li, i) => {
        li.classList.toggle("on", i === idx);
        li.classList.toggle("done", i < idx);
      });
    };
    apply(0);

    // Pin while the building rises, so it's finished before the next sheet
    // covers it: the list and drawing together where they fit on screen,
    // otherwise (phones) the drawing alone. The drawing starts as it comes
    // into view and completes shortly before the pin lets go.
    const navBottom = () => document.getElementById("nav")?.getBoundingClientRect().bottom ?? 76;
    const pinEl = el.offsetHeight <= window.innerHeight - navBottom() - 32 ? el : fig;
    const centre = () => (navBottom() + window.innerHeight) / 2;
    const PIN_VH = 1.1;
    const pin = ScrollTrigger.create({
      trigger: pinEl,
      start: () => `center ${centre()}px`,
      end: () => `+=${window.innerHeight * PIN_VH}`,
      pin: pinEl,
      // Lifted to <body> while pinned, so the next sheet's parallax (a
      // transform on this section's wrapper) can't knock it out of place.
      pinReparent: true,
      invalidateOnRefresh: true,
    });
    const state = { p: 0 };
    const draw = gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: () => apply(state.p),
      scrollTrigger: {
        trigger: pinEl,
        start: "top 85%",
        // through the approach (top at 85 % → centred) and most of the pin,
        // so the finished building holds for a beat before the next sheet rises
        end: () => `+=${window.innerHeight * 0.85 - (centre() - pinEl.offsetHeight / 2) + window.innerHeight * PIN_VH * 0.7}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    ScrollTrigger.sort();

    return () => {
      draw.scrollTrigger?.kill();
      draw.kill();
      pin.kill();
      root.classList.remove("has-st");
      paths.flat().forEach(p => {
        p.style.strokeDasharray = "";
        p.style.strokeDashoffset = "";
      });
      fill.style.opacity = "";
      items.forEach(li => li.classList.remove("on", "done"));
    };
  }, []);

  return (
    <div className="intro" ref={ref}>
      {children}
    </div>
  );
}
