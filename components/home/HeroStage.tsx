"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";
import { isTouchFirst } from "@/lib/animation/prefs";
import { bootTask, isBooted, onBootDone } from "@/lib/boot";
import { createHeroType } from "@/lib/gl/heroType";

gsap.registerPlugin(ScrollTrigger);

/**
 * The hero sheet. The DOM headline moves (entrance, scroll drift, pointer
 * lean) and the GL headline follows it, drawn through a fluid the pointer
 * stirs. Once the glyph atlas is up the section gets data-gl-type, which
 * makes the DOM words transparent; without WebGL or float targets they keep
 * their fill and stroke.
 */
export default function HeroStage({ id, sheet, children }: { id: string; sheet: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hero = ref.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;
    const title = hero.querySelector<HTMLElement>("#hero-title");
    const cleanups: (() => void)[] = [];
    const cleanup = () => cleanups.splice(0).reverse().forEach(fn => fn());
    if (!motionAllowed() || !title) return cleanup;

    const coarse = isTouchFirst();
    const lines = [...hero.querySelectorAll<HTMLElement>("[data-line]")];
    const words = [...hero.querySelectorAll<HTMLElement>("[data-atlas-word]")];
    const dirOf = (el: Element) => Number(el.closest<HTMLElement>("[data-line]")?.dataset.dir ?? 1);

    const fade = hero.querySelector<HTMLElement>("[data-hero-fade]");
    const statement = [...hero.querySelectorAll<HTMLElement>("[data-hs-word]")];
    const nav = document.getElementById("nav");

    // ---- DOM motion (the GL copy follows it): entrance, the pinned swap, pointer lean
    const ctx = gsap.context(() => {
      gsap.set(words, { x: (_i: number, el: Element) => `${-dirOf(el) * 5}vw` });

      // Pinned, scroll-scrubbed headline swap: the lines slide apart and blur
      // away (the GL type rides along and its canvas blurs out with them), then
      // the lede blurs in word by word in their place. A short hold, then the
      // pin lets go and the statement sheet rises over the hero.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: () => `top ${nav?.getBoundingClientRect().bottom ?? 64}`,
          end: "+=200%",
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      tl.to(fade, { autoAlpha: 0, y: -12, duration: 0.2 }, 0)
        .to(
          lines,
          { xPercent: (_i: number, el: Element) => dirOf(el) * 24, autoAlpha: 0, filter: "blur(14px)", duration: 0.34, ease: "power1.in", stagger: 0.03 },
          0.02,
        )
        .to(canvas, { autoAlpha: 0, filter: "blur(18px)", duration: 0.3, ease: "power1.in" }, 0.06)
        .fromTo(
          statement,
          { autoAlpha: 0, filter: "blur(14px)", y: 18 },
          { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 0.14, stagger: 0.62 / Math.max(statement.length, 1), ease: "power2.out" },
          0.32,
        )
        .to({}, { duration: 0.12 });
    }, hero);
    cleanups.push(() => ctx.revert());
    cleanups.push(
      onBootDone(() => {
        ctx.add(() => {
          gsap.to(words, { x: 0, duration: 1.8, ease: "expo.out", delay: (i: number) => 0.1 + Math.floor(i / 2) * 0.16 });
        });
      }),
    );
    if (!coarse) {
      let lean: { to: gsap.QuickToFunc; dir: number }[] = [];
      ctx.add(() => {
        lean = lines.map(l => ({ to: gsap.quickTo(l, "x", { duration: 1.4, ease: "power3.out" }), dir: dirOf(l) }));
      });
      const onLean = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        lean.forEach(l => l.to(nx * 36 * l.dir));
      };
      hero.addEventListener("pointermove", onLean);
      cleanups.push(() => hero.removeEventListener("pointermove", onLean));
    }

    // ---- GL: the fluid headline. The loader waits for it (up to 6 s).
    let settle: () => void = () => {};
    bootTask(new Promise<void>(r => { settle = r; }), "hero-type");
    const failsafe = window.setTimeout(() => settle(), 6000);
    cleanups.push(() => window.clearTimeout(failsafe));

    let atlasUp = false;
    let disposed = false;
    const gl = createHeroType(canvas, title, {
      coarse,
      onLost: () => hero.removeAttribute("data-gl-type"),
      onRestored: () => { if (atlasUp) hero.setAttribute("data-gl-type", ""); },
    });
    if (!gl) {
      settle();
      return cleanup;
    }
    cleanups.push(() => {
      disposed = true;
      hero.removeAttribute("data-gl-type");
      gl.dispose();
    });

    gl.ready.then(() => {
      if (disposed) return;
      atlasUp = true;
      hero.setAttribute("data-gl-type", "");
      gl.state.text = 1;
      if (isBooted()) gl.state.reveal.forEach(r => { r.v = 1; });
      requestAnimationFrame(() => requestAnimationFrame(() => settle()));
    }, () => settle());

    const reveals: gsap.core.Tween[] = [];
    cleanups.push(() => reveals.forEach(t => t.kill()));
    cleanups.push(
      onBootDone(() => {
        gl.state.reveal.forEach((r, i) => {
          reveals.push(gsap.to(r, { v: 1, duration: 1.6, delay: 0.1 + i * 0.16, ease: "power1.inOut" }));
        });
        gl.drive();
      }),
    );

    return cleanup;
  }, []);

  return (
    <section ref={ref} className="hero" id={id} data-sheet={sheet} aria-labelledby="hero-title">
      {/* Inner wrapper: the statement sheet's parallax moves this, never the pinned section itself. */}
      <div className="hero-inner" data-hero-inner>
        <canvas ref={canvasRef} className="hero-gl" aria-hidden="true" />
        {children}
      </div>
    </section>
  );
}
