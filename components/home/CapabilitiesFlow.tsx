"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * "From curriculum to coordination", as a thread: scrolling draws a gold
 * line along the rule under each capability in reading order, and each one
 * lights as the line reaches it (its icon draws itself in, the accent dot
 * pulses, the copy comes up from dim). Hovering redraws an icon. Without
 * motion: the plain grid.
 */
export default function CapabilitiesFlow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid || !motionAllowed()) return;
    const cells = [...grid.querySelectorAll<HTMLElement>(".cap")];
    const n = cells.length;
    grid.classList.add("is-flow");
    const apply = (p: number) => {
      cells.forEach((cell, k) => {
        const fill = Math.min(1, Math.max(0, p * n - k));
        cell.style.setProperty("--fill", fill.toFixed(4));
        cell.classList.toggle("lit", fill > 0.35);
      });
    };
    apply(0);
    const st = ScrollTrigger.create({
      trigger: grid,
      start: "top 78%",
      end: "bottom 62%",
      scrub: 0.5,
      onUpdate: self => apply(self.progress),
      onRefresh: self => apply(self.progress),
    });
    return () => {
      st.kill();
      grid.classList.remove("is-flow");
      cells.forEach(c => {
        c.classList.remove("lit");
        c.style.removeProperty("--fill");
      });
    };
  }, []);

  return (
    <div className="caps" ref={ref}>
      {children}
    </div>
  );
}
