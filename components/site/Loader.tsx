"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lockScroll } from "@/lib/animation/scroll";
import { motionAllowed } from "@/lib/animation/motion";
import { bootProgress, bootTask, finishBoot, isBooted } from "@/lib/boot";
import { brand, loader as copy } from "@/lib/content/site";

gsap.registerPlugin(ScrollTrigger);

/** Webfonts the first paint depends on, or 3.5 s, whichever is first. */
function displayFontsReady(): Promise<unknown> {
  const root = getComputedStyle(document.documentElement);
  const display = root.getPropertyValue("--font-garamond").trim();
  const mono = root.getPropertyValue("--font-plex-mono").trim();
  const loads = [
    display && document.fonts.load(`500 100px ${display}`),
    display && document.fonts.load(`600 100px ${display}`),
    mono && document.fonts.load(`400 14px ${mono}`),
  ].filter(Boolean) as Promise<unknown>[];
  return Promise.race([
    Promise.all(loads).then(() => document.fonts.ready),
    new Promise(r => setTimeout(r, 3500)),
  ]).catch(() => {});
}

function Half({ part }: { part: "top" | "bottom" }) {
  const seq = brand.sequence.join(" → ");
  return (
    <div className={`loader-half ${part}`} aria-hidden={part === "bottom" || undefined}>
      <div className="ls">
        <div className="ls-row mono">
          <span>{brand.short}</span>
          <span className="hide-sm">{seq}</span>
        </div>
        <div className="ls-word">
          <p className="lw lw-line">{copy.word}</p>
          <p className="lw lw-fill" aria-hidden="true">{copy.word}</p>
          <span className="scan" />
        </div>
        <div className="ls-row mono">
          <span data-status>{copy.status[0]}</span>
          <span>
            <b data-pct>000</b> %
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * The split "DRAFTING" loader. Progress follows the real boot tasks under a
 * slow creep; it leaves once every task has settled (and stayed settled for
 * 0.35 s), never before 1.1 s and always by 7 s. CSS shows it only under
 * html.motion, and a CSS failsafe hides it at 10 s whatever happens here.
 */
export default function Loader() {
  const ref = useRef<HTMLDivElement>(null);
  // Client-side navigation back home: the page has already booted.
  const [skip] = useState(() => typeof window !== "undefined" && isBooted());
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (skip || !el) return;
    if (!motionAllowed() || isBooted()) {
      // Reduced motion: CSS never shows the loader; hiding it keeps it out of the a11y tree too.
      el.hidden = true;
      finishBoot();
      return;
    }

    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    let release: (() => void) | null = lockScroll();
    const unlock = () => {
      release?.();
      release = null;
    };

    bootTask(displayFontsReady(), "fonts");
    bootTask(
      new Promise<void>(r => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true }))),
      "window-load",
    );

    const pcts = [...el.querySelectorAll<HTMLElement>("[data-pct]")];
    const stats = [...el.querySelectorAll<HTMLElement>("[data-status]")];
    const write = (p: number) => {
      el.style.setProperty("--progress", p.toFixed(4));
      const txt = String(Math.round(p * 100)).padStart(3, "0");
      pcts.forEach(n => { n.textContent = txt; });
      const s = copy.status[Math.min(3, Math.floor(p * 4))];
      stats.forEach(n => { if (n.textContent !== s) n.textContent = s; });
    };

    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
    const t0 = performance.now();
    let shown = 0;
    let lastCount = -1;
    let since = t0;
    let leaving = false;
    let fill: gsap.core.Tween | null = null;

    const done = () => {
      el.hidden = true;
      unlock();
      ScrollTrigger.refresh();
      setGone(true);
    };

    const leave = () => {
      leaving = true;
      gsap.ticker.remove(tick);
      const p = { v: shown };
      fill = gsap.to(p, {
        v: 1,
        duration: 0.35,
        ease: "power2.out",
        onUpdate: () => write(p.v),
        onComplete: () => {
          later(() => {
            el.classList.add("leave");
            later(finishBoot, 400);
            later(done, 1450);
          }, 150);
        },
      });
    };

    function tick() {
      if (leaving) return;
      const now = performance.now();
      const t = (now - t0) / 1000;
      const { total, settled } = bootProgress();
      if (total !== lastCount) {
        lastCount = total;
        since = now;
      }
      const real = total ? settled / total : 0;
      const creep = 0.9 * (1 - Math.exp(-t / 2.2));
      shown += (Math.min(0.97, Math.max(real * 0.97, creep)) - shown) * 0.08;
      write(shown);
      const allIn = total > 0 && settled === total && (now - since) / 1000 > 0.35;
      if ((allIn && t > 1.1) || t > 7) leave();
    }
    gsap.ticker.add(tick);

    // Failsafe: whatever happens to the frame loop, the page is shown.
    later(() => {
      if (isBooted()) return;
      el.classList.add("leave");
      finishBoot();
      later(done, 1400);
    }, 8500);

    return () => {
      gsap.ticker.remove(tick);
      fill?.kill();
      timers.forEach(id => window.clearTimeout(id));
      unlock();
    };
  }, [skip]);

  if (skip || gone) return null;
  return (
    <div className="loader" ref={ref} role="status" aria-live="polite" aria-label={copy.label}>
      <Half part="top" />
      <Half part="bottom" />
    </div>
  );
}
