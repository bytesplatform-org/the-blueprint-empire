"use client";

import { useEffect } from "react";
import { mountScroll } from "@/lib/animation/scroll";
import { prefersReducedMotion } from "@/lib/animation/prefs";

/**
 * Mounts Lenis (driven by GSAP's ticker and synced to ScrollTrigger) plus
 * same-page anchor routing, once, for the whole app. Renders nothing.
 * Smooth scrolling is skipped for readers who prefer reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => mountScroll({ smooth: !prefersReducedMotion() }), []);
  return null;
}
