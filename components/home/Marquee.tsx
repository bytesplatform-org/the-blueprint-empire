"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";
import { brand, ticker } from "@/lib/content/site";

gsap.registerPlugin(ScrollTrigger);

function Big() {
  return (
    <div className="mq-set">
      {ticker.map((t, i) => (
        <span className="mq-item" key={t}>
          <span className={i % 2 ? "mq-word hollow" : "mq-word"}>{t}</span>
          <i className="mq-dot" />
        </span>
      ))}
    </div>
  );
}

function Small() {
  const line = brand.sequence.join(" → ");
  return (
    <div className="mq-set">
      {Array.from({ length: 5 }, (_, i) => (
        <span className="mq-small mono" key={i}>
          {line}
          <i />
        </span>
      ))}
    </div>
  );
}

/**
 * Two-row marquee band. The rows run opposite ways; scrolling speeds them up
 * (and turns them round when you scroll back up), then they ease back to
 * cruising pace. Paused on hover and offscreen; still under reduced motion.
 */
export default function Marquee() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    let hovered = false;
    let st: ScrollTrigger | null = null;
    const ctx = gsap.context(() => {
      const a = gsap.to("[data-track='1']", { xPercent: -50, duration: 42, ease: "none", repeat: -1, paused: true });
      const b = gsap.fromTo("[data-track='2']", { xPercent: -50 }, { xPercent: 0, duration: 52, ease: "none", repeat: -1, paused: true });
      const tweens = [a, b];
      st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: self => tweens.forEach(t => (self.isActive && !hovered ? t.play() : t.pause())),
        onUpdate: self => {
          if (hovered) return;
          const boost = gsap.utils.clamp(-5, 5, self.getVelocity() / 300);
          const scale = (self.direction >= 0 ? 1 : -1) * (1 + Math.abs(boost));
          tweens.forEach(t =>
            gsap.to(t, {
              timeScale: scale,
              duration: 0.2,
              overwrite: true,
              onComplete: () => { gsap.to(t, { timeScale: Math.sign(scale) || 1, duration: 1.2, ease: "power2.out" }); },
            }),
          );
        },
      });
      const enter = () => {
        hovered = true;
        tweens.forEach(t => t.pause());
      };
      const leave = () => {
        hovered = false;
        if (st?.isActive) tweens.forEach(t => t.play());
      };
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      return () => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      };
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="marquee" ref={ref} aria-label="What we deliver">
      <p className="sr-only">{ticker.join(", ")}</p>
      <div aria-hidden="true">
        <div className="mq-track" data-track="1">
          <Big />
          <Big />
        </div>
        <div className="mq-track small" data-track="2">
          <Small />
          <Small />
        </div>
      </div>
    </section>
  );
}
