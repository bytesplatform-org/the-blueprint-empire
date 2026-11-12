"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motionAllowed } from "@/lib/animation/motion";
import { isTouchFirst } from "@/lib/animation/prefs";

const INTERACTIVE = 'a[href], button, [role="button"], input, select, textarea, label, summary';

/**
 * Cursor follower: an ivory disc in difference blend that eases after the
 * pointer and shrinks over anything clickable. Mouse and pen only, with
 * motion; purely decorative (the native cursor stays).
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = ref.current;
    if (!dot || !motionAllowed() || isTouchFirst()) return;
    const xTo = gsap.quickTo(dot, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.45, ease: "power3.out" });
    let shown = false;
    let hovering = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (!shown) {
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        gsap.to(dot, { autoAlpha: 1, duration: 0.3 });
        shown = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const over = e.target instanceof Element && !!e.target.closest(INTERACTIVE);
      if (over !== hovering) {
        hovering = over;
        gsap.to(dot, { scale: over ? 0.5 : 1, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      }
    };
    const onLeave = () => {
      shown = false;
      gsap.to(dot, { autoAlpha: 0, duration: 0.3 });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(dot);
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
