"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { createFluidVideoRenderer } from "@/lib/fluid/createFluidVideoRenderer";
import { createAutoScrollScene } from "@/lib/fluid/autoScrollScene";
import { watchVideoFrame } from "@/lib/fluid/videoFrameReadiness";
import { isCoarsePointer, prefersReducedMotion } from "@/lib/animation/prefs";

type Source = { src: string; type?: string };

type FluidVideoProps = {
  /** one URL, or several <source>s in order of preference */
  src: string | Source[];
  poster?: string;
  /** share of a viewport the page scrolls while the sheet morphs */
  travel?: number;
  /** seconds the morph takes when it carries itself (autoplay pace) */
  duration?: number;
  /** corner radius in CSS px: [card, panel] */
  radius?: [number, number];
  /** deformation multiplier; 0 is a rigid morph */
  strength?: number;
  className?: string;
  /** where the card sits inside the pinned viewport */
  startClassName?: string;
  /** where the panel sits inside the pinned viewport */
  endClassName?: string;
  /** shown over the panel once the sheet has settled into it */
  children?: ReactNode;
};

/**
 * Scroll-driven fluid video transition. A pinned viewport holds a card (the
 * start rect) and a panel (the end rect); as the page scrolls through the
 * section's travel band, one WebGL sheet carries the video from the card into
 * the panel, bending like cloth on the way (lib/shaders/fluidVideoTransition).
 *
 * The HTML <video> stays visible until the WebGL pass has drawn several real,
 * advancing frames underneath it (watchVideoFrame), then hands off, so there's
 * never a blank or black first frame. Without WebGL, or with reduced motion,
 * the plain video plays in the card.
 *
 * Append ?fluid-debug=1 (undistorted) or ?fluid-debug=2 (distortion map).
 */
export default function FluidVideo({
  src,
  poster,
  travel = 0.9,
  duration = 1.6,
  radius = [18, 28],
  strength = 1,
  className = "",
  startClassName = "left-[6vw] top-[18svh] w-[min(36rem,60vw)]",
  endClassName = "inset-x-[3vw] top-[6svh] bottom-[6svh]",
  children,
}: FluidVideoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sources: Source[] = typeof src === "string" ? [{ src }] : src;
  const [r0, r1] = radius;

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const startEl = startRef.current;
    const endEl = endRef.current;
    const overlay = overlayRef.current;
    if (!section || !canvas || !video || !startEl || !endEl) return;

    let visible = false;
    const syncPlayback = () => {
      if (visible && !document.hidden) void video.play().catch(() => {});
      else video.pause();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      syncPlayback();
    });
    io.observe(section);
    document.addEventListener("visibilitychange", syncPlayback);
    const stopPlaybackSync = () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };

    // Reduced motion, or no WebGL: the plain video in the card.
    if (prefersReducedMotion()) return stopPlaybackSync;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return stopPlaybackSync;
    }
    renderer.setClearColor(0, 0);

    const coarse = isCoarsePointer();
    const fluid = createFluidVideoRenderer(renderer, {
      video,
      segments: coarse ? [48, 32] : [72, 48],
      radius: [r0, r1],
      strength,
    });
    if (!fluid) {
      renderer.dispose();
      return stopPlaybackSync;
    }
    const debugParam = Number(new URLSearchParams(window.location.search).get("fluid-debug"));
    fluid.debugMode = debugParam === 1 || debugParam === 2 ? debugParam : 0;

    // ---- handoff: HTML video covers the canvas until WebGL is proven live
    let ready = false;
    let overlayShown = -1;
    const showFallback = () => {
      ready = false;
      video.style.transition = "";
      video.style.opacity = "";
    };
    const frames = watchVideoFrame(video, {
      frame: first => (first ? fluid.prepare() : fluid.markTextureForUpdate()),
      wake: () => fluid.markTextureForUpdate(),
      changed: isReady => {
        if (!isReady) return showFallback();
        ready = true;
        video.style.transition = "opacity 120ms linear";
        video.style.opacity = "0";
      },
    });

    // ---- scroll: a paused timeline, scrubbed (and auto-carried) by the page
    const state = { progress: 0 };
    const timeline = gsap.timeline({ paused: true });
    timeline.to(state, { progress: 1, duration, ease: "sine.inOut" }, 0);
    const scene = createAutoScrollScene(section, timeline);

    // ---- sizing
    let needsResize = true;
    const ro = new ResizeObserver(() => { needsResize = true; });
    ro.observe(canvas);

    let contextLost = false;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      frames.suspend();
      showFallback();
    };
    const onContextRestored = () => {
      contextLost = false;
      needsResize = true;
      showFallback();
      frames.restart();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    const tick = () => {
      // Render while on screen, and also while warming up (under the video).
      if (contextLost || (!visible && ready)) return;
      const stage = canvas.getBoundingClientRect();
      if (needsResize) {
        needsResize = false;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
        renderer.setSize(Math.max(1, stage.width), Math.max(1, stage.height), false);
      }
      const a = startEl.getBoundingClientRect();
      const b = endEl.getBoundingClientRect();
      if (!a.width || !a.height || !b.width || !b.height) return;
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
      const rel = (r: DOMRect) => ({ x: r.left - stage.left, y: r.top - stage.top, w: r.width, h: r.height });
      fluid.layout({ w: stage.width, h: stage.height }, rel(a), rel(b));
      fluid.render(state.progress);
      if (!ready && !renderer.getContext().isContextLost()) frames.rendered();

      if (overlay) {
        const o = ready ? Math.round(Math.min(1, Math.max(0, (state.progress - 0.7) / 0.3)) * 100) / 100 : 0;
        if (o !== overlayShown) {
          overlayShown = o;
          overlay.style.opacity = String(o);
          overlay.style.visibility = o > 0 ? "visible" : "hidden";
        }
      }
    };
    gsap.ticker.add(tick);
    frames.restart();

    return () => {
      gsap.ticker.remove(tick);
      scene.kill();
      timeline.kill();
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      frames.dispose();
      stopPlaybackSync();
      video.style.transition = "";
      video.style.opacity = "";
      fluid.dispose();
      renderer.dispose();
    };
  }, [duration, r0, r1, strength]);

  return (
    <section
      ref={sectionRef}
      data-fluid-transition
      style={{ "--fluid-travel": travel } as CSSProperties}
      className={`relative h-[calc(100svh*(1+var(--fluid-travel)))] motion-reduce:h-svh ${className}`}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />

        <div ref={startRef} className={`absolute z-[1] aspect-video ${startClassName}`}>
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster}
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            style={{ borderRadius: r0 }}
          >
            {sources.map(s => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        </div>

        <div ref={endRef} className={`pointer-events-none absolute z-[2] motion-reduce:hidden ${endClassName}`}>
          {children && (
            <div
              ref={overlayRef}
              style={{ opacity: 0, visibility: "hidden" }}
              className="pointer-events-auto absolute inset-0 flex items-center justify-center"
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
