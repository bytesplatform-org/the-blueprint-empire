"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "@/lib/animation/motion";
import { isTouchFirst } from "@/lib/animation/prefs";
import { compileMaterials, createShaderPass, createStage } from "@/lib/gl/engine";
import { foundationsFragment } from "@/lib/shaders/foundations";
import { foundations } from "@/lib/content/site";

gsap.registerPlugin(ScrollTrigger);

/** Scroll the stage stays pinned for, in viewport heights. */
const PIN_VH = 4.6;
/** The approach: the title rises while the section scrolls from 80 % down the screen to the top. */
const APPROACH_VH = 0.8;
/** Timeline positions: when the first chapter starts, and how long each chapter lasts. */
const CH0 = 0.72;
const CH = 0.26;
const FINAL = CH0 + 3 * CH;

type CardState = { show: number; target: number; grow: number; origin: [number, number] };

/**
 * PILLARS as a pinned, scroll-scrubbed story (after FernGrid's "Our Software"):
 * 1. "Three foundations, / one structure." rises in, huge.
 * 2. It rolls out; the intro brightens word by word.
 * 3. Three chapters: each photograph flies in large from the right and
 *    develops (gold duotone, bleeding in like ink) while its title,
 *    description and points blur in beside it; then it slides away. The
 *    pointer is a lens that shows the photograph in full colour.
 * 4. All three come back into one row with their titles: one structure.
 *    The pin lets go.
 *
 * One canvas draws all three photographs (lib/shaders/foundations); it
 * re-reads every plate's rect each frame, so the GL follows the flying cards.
 * Without motion this is the plain three-column grid (one static frame at full
 * strength); without WebGL the plates show the plain photographs. The story
 * layout is pure CSS under html.motion, so server and client markup match.
 */
export default function FoundationsStory() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---- GL: the three figures
  useEffect(() => {
    const stageEl = stageRef.current;
    const canvas = canvasRef.current;
    if (!stageEl || !canvas) return;
    const grid = stageEl.querySelector<HTMLElement>(".fs-grid")!;
    const plates = [...stageEl.querySelectorAll<HTMLElement>("[data-plate]")];
    if (plates.length !== 3) return;
    const motion = motionAllowed();
    const coarse = isTouchFirst();

    let ready = false;
    const stage = createStage(canvas, {
      dprCap: 1.5,
      animate: motion,
      onLost: () => grid.removeAttribute("data-gl"),
      onRestored: () => { if (ready) grid.setAttribute("data-gl", ""); },
    });
    if (!stage) return;

    const S: CardState[] = plates.map(() => ({ show: 0, target: 0, grow: 1, origin: [0.5, 0.5] }));
    if (!motion) S.forEach(s => { s.target = s.show = 1; });
    const R = new Float32Array(12);
    const SH = new Float32Array(3);
    const GR = new Float32Array(3);
    const OR = new Float32Array(6);

    const pass = createShaderPass(stage.shared, {
      fragmentShader: foundationsFragment,
      uniforms: {
        uRadius: { value: 16 },
        uRects: { value: R },
        uShow: { value: SH },
        uGrow: { value: GR },
        uOrigin: { value: OR },
        uTex0: { value: null },
        uTex1: { value: null },
        uTex2: { value: null },
        uAspect: { value: new THREE.Vector3(...foundations.items.map(item => item.image.aspect)) },
        uReady: { value: new THREE.Vector3(0, 0, 0) },
      },
      update(dt) {
        const cr = canvas.getBoundingClientRect();
        // matches .plate's border-radius (--r-md)
        pass.material.uniforms.uRadius.value = 16 * stage.pixelRatio();
        // The story lights a plate (data-lit); it grows out from its centre.
        if (motion) {
          S.forEach((s, i) => {
            const lit = plates[i].dataset.lit === "1";
            if (lit && s.target === 0 && s.show < 0.3) {
              s.grow = 0;
              s.origin = [0.5, 0.5];
            }
            s.target = lit ? 1 : 0;
          });
        }
        if (coarse && motion) {
          const act = S.findIndex(s => s.target > 0);
          if (act >= 0) {
            const r = plates[act].getBoundingClientRect();
            const time = stage.shared.uTime.value;
            stage.setPointerUV(
              (r.left - cr.left + r.width * (0.5 + 0.35 * Math.sin(time * 0.6))) / cr.width,
              (r.top - cr.top + r.height * (0.5 + 0.3 * Math.sin(time * 0.9 + 1))) / cr.height,
            );
          }
        }
        S.forEach((s, i) => {
          s.show += (s.target - s.show) * (1 - Math.pow(0.02, dt));
          s.grow = Math.min(1, s.grow + dt * 0.85);
          const r = plates[i].getBoundingClientRect();
          R.set([(r.left - cr.left) / cr.width, (r.top - cr.top) / cr.height, (r.right - cr.left) / cr.width, (r.bottom - cr.top) / cr.height], i * 4);
          SH[i] = s.show;
          GR[i] = s.grow;
          OR[i * 2] = s.origin[0];
          OR[i * 2 + 1] = s.origin[1];
        });
      },
    });
    if (!compileMaterials(stage.renderer, [pass.material])) {
      pass.dispose();
      stage.dispose();
      return;
    }
    stage.add(pass);

    // The photographs. The DOM <img> stays until all three are on the GPU.
    const textures: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();
    let loaded = 0;
    let disposed = false;
    foundations.items.forEach((item, i) => {
      loader.load(item.image.src, tex => {
        if (disposed) { tex.dispose(); return; }
        tex.colorSpace = THREE.NoColorSpace; // the shader writes sampled sRGB straight out
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        textures.push(tex);
        pass.material.uniforms[`uTex${i}`].value = tex;
        (pass.material.uniforms.uReady.value as THREE.Vector3).setComponent(i, 1);
        loaded++;
        if (loaded === 3) {
          ready = true;
          grid.setAttribute("data-gl", "");
          if (!motion) stage.renderOnce(0);
        }
      });
    });

    const off: (() => void)[] = [];
    if (motion) {
      const move = (e: PointerEvent) => stage.setPointer(e.clientX, e.clientY);
      stageEl.addEventListener("pointermove", move);
      off.push(() => stageEl.removeEventListener("pointermove", move));
    } else {
      stage.renderOnce(0);
    }

    return () => {
      disposed = true;
      off.forEach(fn => fn());
      grid.removeAttribute("data-gl");
      textures.forEach(t => t.dispose());
      stage.dispose();
    };
  }, []);

  // ---- The story: one pin, one scrubbed timeline
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl || !motionAllowed()) return;
    const q = gsap.utils.selector(stageEl);
    const plates = q("[data-plate]") as HTMLElement[];
    const texts = q(".fs-text") as HTMLElement[];
    const titleWords = q("[data-fs-tw]");
    const intro = q(".fs-intro")[0];
    const introWords = q("[data-fs-iw]");
    const caps = q("[data-fs-cap]");
    if (plates.length !== 3 || texts.length !== 3 || !intro) return;

    const W = () => window.innerWidth;
    const SH = () => stageEl.clientHeight;
    const mobile = () => W() < 760;
    // The featured plate: large, left of centre (desktop) or above the text (mobile).
    const feat = () => {
      const w = mobile() ? W() * 0.86 : Math.min(W() * 0.4, 640);
      return { w, h: w * 0.66, x: mobile() ? 0 : -W() * 0.2, y: mobile() ? -SH() * 0.17 : 0 };
    };
    // The final row; mirrors .fs-final's --slot / --gap in CSS.
    const slot = () => {
      const w = mobile() ? (W() - 48) / 3 : Math.min(W() * 0.26, 380);
      return { w, h: w * 0.66, gap: mobile() ? 8 : 24, y: -SH() * 0.06 };
    };
    const offX = () => W() / 2 + feat().w / 2 + 40;
    const lit = (k: number | "all" | null) =>
      plates.forEach((p, i) => { p.dataset.lit = k === "all" || k === i ? "1" : ""; });

    const ctx = gsap.context(() => {
      // Explicit starting states: a staggered fromTo only pre-renders its first target.
      gsap.set(plates, { xPercent: -50, yPercent: -50, x: offX, y: () => feat().y, width: () => feat().w, height: () => feat().h, autoAlpha: 0 });
      gsap.set(titleWords, { yPercent: 115 });
      gsap.set(intro, { autoAlpha: 0 });
      gsap.set(introWords, { opacity: 0.14 });
      texts.forEach(t => gsap.set(t.children, { autoAlpha: 0, y: 30, filter: "blur(8px)" }));
      gsap.set(caps, { autoAlpha: 0, y: 20 });

      ScrollTrigger.create({
        trigger: stageEl,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stageEl,
          start: "top 80%",
          end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: self => {
            // from the scroll position, not the (smoothed, lagging) timeline time
            const t = self.progress * (self.animation?.duration() ?? 0);
            if (t >= FINAL + 0.06) return lit("all");
            const k = Math.floor((t - CH0 - 0.04) / CH);
            const inChapter = t >= CH0 + 0.04 && k >= 0 && k < 3 && t - CH0 - k * CH < 0.24;
            lit(inChapter ? k : null);
          },
          onLeaveBack: () => lit(null),
        },
      });

      // 1. the title rises in as the section arrives, then rolls out
      tl.fromTo(titleWords, { yPercent: 115 }, { yPercent: 0, duration: 0.18, stagger: 0.03, ease: "power3.out" }, 0.02)
        .fromTo(titleWords, { yPercent: 0 }, { yPercent: -115, duration: 0.07, stagger: 0.02, ease: "power3.in", immediateRender: false }, 0.3)
        // 2. the intro brightens word by word, then lifts away
        .to(intro, { autoAlpha: 1, duration: 0.02 }, 0.36)
        .fromTo(introWords, { opacity: 0.14 }, { opacity: 1, duration: 0.02, stagger: 0.2 / Math.max(introWords.length, 1) }, 0.38)
        .to(intro, { autoAlpha: 0, y: -30, filter: "blur(10px)", duration: 0.06 }, 0.64);

      // 3. the chapters
      for (let k = 0; k < 3; k++) {
        const b = CH0 + k * CH;
        tl.fromTo(
          plates[k],
          { x: offX, y: () => feat().y + 40, width: () => feat().w, height: () => feat().h, scale: 0.92, autoAlpha: 0 },
          { x: () => feat().x, y: () => feat().y, scale: 1, autoAlpha: 1, duration: 0.1, ease: "power2.out", immediateRender: false },
          b,
        );
        if (k > 0) tl.to(plates[k - 1], { x: () => -offX(), autoAlpha: 0, duration: 0.1, ease: "power2.in" }, b);
        tl.fromTo(
          texts[k].children,
          { autoAlpha: 0, y: 30, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.06, stagger: 0.02, ease: "power2.out", immediateRender: false },
          b + 0.06,
        );
        tl.to(texts[k].children, { autoAlpha: 0, y: -24, filter: "blur(8px)", duration: 0.05, stagger: 0.01, ease: "power1.in" }, b + 0.2);
      }

      // 4. one structure: all three settle into a row, titles beneath
      plates.forEach((p, i) =>
        tl.to(
          p,
          {
            x: () => (i - 1) * (slot().w + slot().gap),
            y: () => slot().y,
            width: () => slot().w,
            height: () => slot().h,
            scale: 1,
            autoAlpha: 1,
            duration: 0.12,
            ease: "power2.inOut",
          },
          FINAL + (i === 2 ? 0 : 0.02),
        ),
      );
      tl.fromTo(caps, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.02, ease: "power2.out", immediateRender: false }, FINAL + 0.1)
        .to({}, { duration: 0.18 });
    }, stageEl);

    // These pins sit below the hero's: keep ScrollTrigger's order and measurements right.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      lit(null);
    };
  }, []);

  return (
    <div className="fs-stage" ref={stageRef}>
      <canvas ref={canvasRef} className="fs-gl" aria-hidden="true" />
      <div className="wrap">
        <div className="fs-head">
          <h2 className="fs-title">
            {foundations.heading.map((line, l) => (
              <span className="fs-tl" key={l}>
                {line.split(" ").map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="fs-tw" data-fs-tw>{w}</span>
                  </Fragment>
                ))}
              </span>
            ))}
          </h2>
          <div className="fs-intro">
            <p>
              {foundations.body.split(" ").map((w, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span data-fs-iw>{w}</span>
                </Fragment>
              ))}
            </p>
          </div>
        </div>

        <div className="pillars fs-grid">
          {foundations.items.map(item => (
            <article className="pillar fs-card" key={item.title}>
              <div className="plate" data-plate>
                <Image className="plate-img" src={item.image.src} alt={item.image.alt} fill sizes="(max-width: 760px) 90vw, 40vw" />
              </div>
              <div className="fs-text">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <ul>
                  {item.points.map(point => <li key={point}>{point}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="fs-final" aria-hidden="true">
          <p className="fs-final-title" data-fs-cap>{foundations.heading.join(" ")}</p>
          {foundations.items.map(item => (
            <span className="fs-cap" data-fs-cap key={item.title}>{item.title}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
