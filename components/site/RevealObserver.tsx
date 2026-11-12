"use client";

import { useEffect } from "react";
import { motionAllowed } from "@/lib/animation/motion";
import { onBootDone } from "@/lib/boot";

/**
 * After boot, arms the reveals (html.armed) and marks each [data-reveal]
 * element data-shown as it enters. The hidden states exist only under
 * html.armed, so without JS, or with reduced motion, everything is visible.
 */
export default function RevealObserver() {
  useEffect(() => {
    if (!motionAllowed() || !("IntersectionObserver" in window)) return;
    let io: IntersectionObserver | null = null;
    const off = onBootDone(() => {
      document.documentElement.classList.add("armed");
      io = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.setAttribute("data-shown", "");
          io?.unobserve(e.target);
        }),
        { rootMargin: "0px 0px -8% 0px" },
      );
      document.querySelectorAll("[data-reveal]:not([data-shown])").forEach(el => io!.observe(el));
    });
    return () => {
      off();
      io?.disconnect();
    };
  }, []);

  return null;
}
