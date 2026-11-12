"use client";

import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { motionAllowed } from "@/lib/animation/motion";
import { compileMaterials, createShaderPass, createStage } from "@/lib/gl/engine";
import { atlasTexture, atlasWords, buildAtlas, loadAtlasFonts, placeWords, type Atlas } from "@/lib/gl/glyphAtlas";
import { signalWordmarkFragment, WORDMARK_WORDS } from "@/lib/shaders/signalWordmark";

/**
 * The footer wordmark riding a signal. Pointer movement across the footer
 * adds energy at the hand, which decays (× 0.25 per second). Motion only;
 * otherwise, or without WebGL, the DOM wordmark stays.
 */
export default function SignalWordmark({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = ref.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || !motionAllowed()) return;
    const footer = wrap.closest("footer") ?? wrap;

    let atlas: Atlas | null = null;
    let texture: THREE.CanvasTexture | null = null;
    let disposed = false;
    const stage = createStage(canvas, {
      dprCap: 1.5,
      onLost: () => wrap.removeAttribute("data-gl-type"),
      onRestored: () => { if (atlas) wrap.setAttribute("data-gl-type", ""); },
    });
    if (!stage) return;

    const words = atlasWords(wrap);
    const W = new Float32Array(WORDMARK_WORDS * 4);
    const A = new Float32Array(WORDMARK_WORDS * 3);
    let energy = 0;
    let mx = 0.5;
    let lastX: number | null = null;
    const uniforms = {
      uFill: { value: null as THREE.Texture | null },
      uAtlasSize: { value: new THREE.Vector2(1, 1) },
      uWords: { value: W },
      uAtlas: { value: A },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uEnergy: { value: 0 },
      uText: { value: 1 },
    };
    const pass = createShaderPass(stage.shared, {
      fragmentShader: signalWordmarkFragment,
      uniforms,
      update(dt) {
        if (!atlas) return false;
        energy *= Math.pow(0.25, dt);
        placeWords(words, atlas, canvas.getBoundingClientRect(), stage.pixelRatio(), W, A);
        uniforms.uMouse.value.set(mx, 0.5);
        uniforms.uEnergy.value = energy;
      },
    });
    if (!compileMaterials(stage.renderer, [pass.material])) {
      pass.dispose();
      stage.dispose();
      return;
    }

    const rasterise = () => {
      stage.syncSize();
      atlas = buildAtlas(words, stage.pixelRatio());
      texture?.dispose();
      texture = atlasTexture(atlas);
      uniforms.uFill.value = texture;
      uniforms.uAtlasSize.value.set(atlas.fill.width, atlas.fill.height);
    };
    let resizeTimer = 0;
    stage.add({
      render: (r, s, dt) => pass.render(r, s, dt),
      resize: () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => { if (atlas && !disposed) rasterise(); }, 120);
      },
      dispose: () => pass.dispose(),
    });

    loadAtlasFonts(words).then(() => {
      if (disposed) return;
      rasterise();
      wrap.setAttribute("data-gl-type", "");
    });

    const onMove = (e: Event) => {
      const r = canvas.getBoundingClientRect();
      const x = ((e as PointerEvent).clientX - r.left) / r.width;
      if (lastX != null) energy = Math.min(1, energy + Math.abs(x - lastX) * 6);
      lastX = x;
      mx = x;
    };
    footer.addEventListener("pointermove", onMove);

    return () => {
      disposed = true;
      window.clearTimeout(resizeTimer);
      footer.removeEventListener("pointermove", onMove);
      wrap.removeAttribute("data-gl-type");
      texture?.dispose();
      stage.dispose();
    };
  }, []);

  return (
    <div className="foot-word" ref={ref}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {children}
    </div>
  );
}
