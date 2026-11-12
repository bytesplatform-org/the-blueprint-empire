"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { glideTo } from "@/lib/animation/scroll";
import { motionAllowed } from "@/lib/animation/motion";
import { isTouchFirst } from "@/lib/animation/prefs";
import { programs, type Program } from "@/lib/content/site";

gsap.registerPlugin(ScrollTrigger);

const WEEKS = programs.weeks;
/** Scroll the stage stays pinned for while the eight weeks play, in viewport heights. */
const PIN_VH = 2.6;

/** What a program is doing in week w (1-based): straight from its curriculum where it has one. */
function statusOf(p: Program, w: number, finished: boolean) {
  const core = p.bars.filter(b => !b.ext);
  const coreLen = Math.max(...core.map(b => b.to)) - 1;
  const ext = p.bars.find(b => b.ext);
  if (w <= coreLen && !(finished && w === coreLen)) {
    return { state: "live" as const, text: p.weeks?.[w - 1] ?? `Week ${w} of ${coreLen}` };
  }
  if (ext && w >= ext.from && w < ext.to && !finished) return { state: "ext" as const, text: programs.legend.ext };
  return { state: "done" as const, text: "Complete · certificate" };
}

/**
 * PROGRAMS as a scroll story: the eight-week scale plays out. A gold playhead
 * sweeps week 1 → 8 across the schedule; each program's bar fills up to it;
 * programs in session brighten (with a sheen on the bar), and as each one
 * finishes its certificate seal pops in. "This week" lists what every
 * program covers in the current week, from its weekly structure where it has
 * one. Pinned when the board fits on screen, otherwise scrubbed in place.
 *
 * After that the board is a tool: hovering a week column previews that week
 * (a ghost playhead), and the rows open as before. Opening a row while the
 * story is pinned first plays out the remaining weeks, then opens it.
 * Without motion: the plain full schedule (bars drawn, no playhead or panel).
 */
export default function ProgramsStory({ head, legend, children }: { head: ReactNode; legend: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [week, setWeek] = useState(1);
  const [finished, setFinished] = useState(false);
  const [peek, setPeek] = useState<number | null>(null);

  useEffect(() => {
    const inner = ref.current;
    const stage = inner?.parentElement;
    if (!inner || !stage || !motionAllowed()) return;
    const schedule = stage.querySelector<HTMLElement>(".schedule");
    const weeksEl = stage.querySelector<HTMLElement>(".weeks");
    if (!schedule || !weeksEl) return;
    const rows = [...stage.querySelectorAll<HTMLElement>(".sch-row")];
    const cells = [...weeksEl.querySelectorAll<HTMLElement>("span")];
    const rowBars = rows.map(r => [...r.querySelectorAll<HTMLElement>(".bar")]);

    const measure = () => {
      const s = inner.getBoundingClientRect();
      const w = weeksEl.getBoundingClientRect();
      const sc = schedule.getBoundingClientRect();
      inner.style.setProperty("--wl", `${w.left - s.left}px`);
      inner.style.setProperty("--ww", `${w.width}px`);
      inner.style.setProperty("--st", `${sc.top - s.top}px`);
      inner.style.setProperty("--sh", `${sc.height}px`);
    };

    let lastWeek = 1;
    let lastDone = false;
    const apply = (ph: number) => {
      measure();
      inner.style.setProperty("--ph", ph.toFixed(4));
      const wk = ph * WEEKS;
      const cur = Math.min(WEEKS, Math.max(1, Math.floor(wk) + 1));
      const done = ph >= 0.995;
      rowBars.forEach((bars, i) => {
        let live = false;
        let end = 0;
        bars.forEach(b => {
          const from = Number(b.dataset.from);
          const to = Number(b.dataset.to);
          const fill = Math.min(1, Math.max(0, (wk - (from - 1)) / (to - from)));
          b.style.setProperty("--fill", fill.toFixed(4));
          if (!b.hasAttribute("data-ext")) {
            end = Math.max(end, to - 1);
            if (wk > from - 1 && wk < to - 1) live = true;
          }
        });
        rows[i].classList.toggle("live", live && ph > 0.001);
        rows[i].classList.toggle("done", wk >= end - 0.001 && end > 0);
      });
      cells.forEach((c, i) => {
        c.classList.toggle("on", i + 1 === cur && ph > 0.001);
        c.classList.toggle("past", i + 1 < cur);
      });
      if (cur !== lastWeek) { lastWeek = cur; setWeek(cur); }
      if (done !== lastDone) { lastDone = done; setFinished(done); }
    };

    stage.classList.add("is-story");
    const state = { ph: 0 };
    const fits = stage.offsetHeight <= window.innerHeight;
    const tween = gsap.to(state, {
      ph: 1,
      ease: "none",
      onUpdate: () => apply(state.ph),
      scrollTrigger: fits
        ? { trigger: stage, start: "top top", end: () => `+=${window.innerHeight * PIN_VH}`, pin: true, scrub: 0.6, invalidateOnRefresh: true }
        : { trigger: schedule, start: "top 75%", end: "bottom 45%", scrub: 0.6, invalidateOnRefresh: true },
    });
    apply(0);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    // Hover a week column to preview it (fine pointers).
    const off: (() => void)[] = [];
    if (!isTouchFirst()) {
      const move = (e: PointerEvent) => {
        const w = weeksEl.getBoundingClientRect();
        const s = schedule.getBoundingClientRect();
        if (e.clientX < w.left || e.clientX > w.right || e.clientY < s.top || e.clientY > s.bottom) {
          setPeek(null);
          return;
        }
        const k = Math.min(WEEKS, Math.max(1, Math.floor(((e.clientX - w.left) / w.width) * WEEKS) + 1));
        inner.style.setProperty("--pk", ((k - 0.5) / WEEKS).toFixed(4));
        setPeek(k);
      };
      const leave = () => setPeek(null);
      schedule.addEventListener("pointermove", move);
      schedule.addEventListener("pointerleave", leave);
      off.push(() => {
        schedule.removeEventListener("pointermove", move);
        schedule.removeEventListener("pointerleave", leave);
      });
    }

    // Opening a row mid-story: play out the weeks (and unpin) first.
    let bypass = false;
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as Element | null)?.closest<HTMLButtonElement>(".sch-btn");
      const st = tween.scrollTrigger;
      if (!btn || bypass || !st || !fits || window.scrollY >= st.end - 2) return;
      e.preventDefault();
      e.stopPropagation();
      glideTo(st.end + 4, 0.9);
      window.setTimeout(() => {
        bypass = true;
        btn.click();
        bypass = false;
      }, 950);
    };
    stage.addEventListener("click", onClick, true);
    off.push(() => stage.removeEventListener("click", onClick, true));

    // Opening and closing rows changes the board's height.
    const ro = new ResizeObserver(() => measure());
    ro.observe(schedule);
    off.push(() => ro.disconnect());

    return () => {
      off.forEach(fn => fn());
      tween.scrollTrigger?.kill();
      tween.kill();
      stage.classList.remove("is-story");
      rows.forEach(r => r.classList.remove("live", "done"));
      cells.forEach(c => c.classList.remove("on", "past"));
      rowBars.flat().forEach(b => b.style.removeProperty("--fill"));
    };
  }, []);

  const shown = peek ?? week;
  const isFinished = peek == null && finished;

  return (
    <div className="ps-stage">
      {/* Inner wrapper: the next sheet's parallax moves this, never the pinned stage. */}
      <div className="ps-inner" ref={ref} data-parallax>
      <div className="wrap">
        <div className="ps-top">
          {head}
          <div className="ps-week" aria-live="polite">
            <p className="ps-week-title">
              Week {shown} <span>of {WEEKS}</span>
            </p>
            <ul>
              {programs.items.map(p => {
                const s = statusOf(p, shown, isFinished);
                return (
                  <li key={p.id} data-state={s.state}>
                    <b>{p.name}</b>
                    <span>{s.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {children}
        {legend}
      </div>
      <div className="ps-playhead" aria-hidden="true">
        <span className="mono">WK {Math.min(WEEKS, week)}</span>
      </div>
      <div className={peek ? "ps-playhead ghost on" : "ps-playhead ghost"} aria-hidden="true" />
      </div>
    </div>
  );
}
