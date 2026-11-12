"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * FIG. 01: the elevation rises with the scroll. One ScrollTrigger draws the
 * four [data-stage] groups in order, fades in the pediment, and lights the
 * matching stage in the list. Without motion everything is drawn.
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
    const trigger = ScrollTrigger.create({
      trigger: fig,
      start: "top 80%",
      end: "bottom 35%",
      scrub: 0.6,
      onUpdate: self => apply(self.progress),
    });

    return () => {
      trigger.kill();
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
