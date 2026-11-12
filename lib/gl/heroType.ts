/**
 * The GL half of the hero (port of initHero): the headline drawn through a
 * fluid the pointer stirs. The DOM words stay the source of truth for layout;
 * every frame re-reads their positions, so GSAP motion carries into GL.
 */

import * as THREE from "three";
import { heroTypeFragment, HERO_WORDS } from "@/lib/shaders/heroType";
import { compileMaterials, createShaderPass, createStage, supportsFloatTargets } from "./engine";
import { createFluid, FLUID_COARSE, FLUID_FINE } from "./fluidSolver";
import { atlasTexture, atlasWords, buildAtlas, loadAtlasFonts, placeWords, type Atlas } from "./glyphAtlas";

export type HeroType = {
  /** uniform state the component tweens: text on/off and each line's reveal */
  state: { text: number; reveal: { v: number }[] };
  /** loads the faces and rasterises the atlas; resolves when the GL type can show */
  ready: Promise<void>;
  /** starts feeding the pointer (or, on touch, a slow Lissajous probe) into the fluid */
  drive(): void;
  dispose(): void;
};

export function createHeroType(
  canvas: HTMLCanvasElement,
  title: HTMLElement,
  { coarse, onLost, onRestored }: { coarse: boolean; onLost(): void; onRestored(): void },
): HeroType | null {
  // Touch screens get a higher cap than the reference's 1.25: the serif's
  // hairlines need the resolution, or hollow words smear into blobs.
  const stage = createStage(canvas, { dprCap: coarse ? 2 : 1.5, onLost, onRestored });
  if (!stage) return null;
  const { renderer } = stage;
  if (!supportsFloatTargets(renderer)) {
    stage.dispose();
    return null;
  }
  const fluid = createFluid(renderer, coarse ? FLUID_COARSE : FLUID_FINE);
  if (!fluid) {
    stage.dispose();
    return null;
  }

  const words = atlasWords(title);
  const W = new Float32Array(HERO_WORDS * 4);
  const A = new Float32Array(HERO_WORDS * 3);
  const LX = new Float32Array(6);
  const state: HeroType["state"] = { text: 0, reveal: [{ v: 0 }, { v: 0 }, { v: 0 }] };
  let atlas: Atlas | null = null;
  let texture: THREE.CanvasTexture | null = null;
  let driving = false;
  let disposed = false;

  const uniforms = {
    uVelocity: { value: null as THREE.Texture | null },
    uHeat: { value: null as THREE.Texture | null },
    uFill: { value: null as THREE.Texture | null },
    uAtlasSize: { value: new THREE.Vector2(1, 1) },
    uWords: { value: W },
    uAtlas: { value: A },
    uLineX: { value: LX },
    uText: { value: 0 },
    uReveal: { value: new THREE.Vector3() },
    uRevealDir: { value: new THREE.Vector3(1, -1, 1) },
  };

  const pass = createShaderPass(stage.shared, {
    fragmentShader: heroTypeFragment,
    uniforms,
    update(dt) {
      if (!atlas) return false;
      if (driving && coarse) {
        const t = performance.now() / 1000;
        fluid.pointer(0.5 + 0.34 * Math.sin(t * 0.45), 0.55 + 0.18 * Math.sin(t * 0.7 + 1.3));
      }
      placeWords(words, atlas, canvas.getBoundingClientRect(), stage.pixelRatio(), W, A);
      for (let l = 0; l < 3; l++) {
        const a = 2 * l;
        const b = 2 * l + 1;
        LX[l * 2] = Math.min(W[a * 4], W[b * 4]);
        LX[l * 2 + 1] = Math.max(W[a * 4] + W[a * 4 + 2], W[b * 4] + W[b * 4 + 2]);
      }
      fluid.update(dt, canvas.width / Math.max(canvas.height, 1));
      uniforms.uVelocity.value = fluid.vel.read.texture;
      uniforms.uHeat.value = fluid.heat.read.texture;
      uniforms.uText.value = state.text;
      uniforms.uReveal.value.set(state.reveal[0].v, state.reveal[1].v, state.reveal[2].v);
    },
  });
  if (!compileMaterials(renderer, [pass.material])) {
    pass.dispose();
    fluid.dispose();
    stage.dispose();
    return null;
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
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => { if (atlas && !disposed) rasterise(); }, 120);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(title);

  stage.add({
    render: (r, s, dt) => pass.render(r, s, dt),
    resize: onResize,
    dispose: () => {
      pass.dispose();
      fluid.dispose();
    },
  });

  const ready = loadAtlasFonts(words).then(() => {
    if (disposed) return;
    rasterise();
  });

  const onPointerMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    fluid.pointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };

  return {
    state,
    ready,
    drive() {
      if (driving || disposed) return;
      driving = true;
      if (!coarse) window.addEventListener("pointermove", onPointerMove, { passive: true });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      texture?.dispose();
      stage.dispose();
    },
  };
}
