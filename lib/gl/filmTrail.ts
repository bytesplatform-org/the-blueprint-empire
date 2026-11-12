/**
 * Pointer liquid-film trail (port of initFilm), drawn on a fixed full-viewport
 * canvas. Mouse only. Simulation sleeps once the pointer has been still for
 * SETTLE seconds and clears when the pointer leaves the window.
 */

import * as THREE from "three";
import * as F from "@/lib/shaders/filmTrail";
import { isBooted } from "@/lib/boot";
import {
  clearTarget, compileMaterials, createQuad, createStage, floatPair, floatTarget, quadMaterial, supportsFloatTargets,
} from "./engine";

const SIM = 192;
const FILM = 768;
const STEP = 1 / 60;
const SETTLE = 1.8;
const ITERS = 12;

export function createFilmTrail(canvas: HTMLCanvasElement): { dispose(): void } | null {
  const stage = createStage(canvas, { dprCap: 1.5, rootMargin: "0px" });
  if (!stage) return null;
  const { renderer } = stage;
  if (!supportsFloatTargets(renderer)) {
    stage.dispose();
    return null;
  }

  const tex = (): THREE.IUniform<THREE.Texture | null> => ({ value: null });
  const num = (v = 0): THREE.IUniform<number> => ({ value: v });
  const texel = (n: number) => ({ value: new THREE.Vector2(1 / n, 1 / n) });
  const M = {
    advect: quadMaterial(F.filmAdvect, { uSource: tex(), uVelocity: tex(), uDecay: num(), uDt: num() }),
    splat: quadMaterial(F.filmSplat, {
      uSource: tex(), uPoint: { value: new THREE.Vector2() }, uDelta: { value: new THREE.Vector2() },
      uAspect: num(1), uFilm: num(), uAmount: num(),
    }),
    div: quadMaterial(F.filmDivergence, { uSource: tex(), uTexel: texel(SIM) }),
    solve: quadMaterial(F.filmSolve, { uSource: tex(), uTexel: texel(SIM), uDiv: tex() }),
    project: quadMaterial(F.filmProject, { uSource: tex(), uTexel: texel(SIM), uVelocity: tex() }),
    display: quadMaterial(F.filmDisplay, { uFilm: tex(), uTexel: texel(FILM) }),
  };
  const materials = Object.values(M);
  if (!compileMaterials(renderer, materials)) {
    materials.forEach(m => m.dispose());
    stage.dispose();
    return null;
  }

  const quad = createQuad();
  const vel = floatPair(SIM, SIM);
  const film = floatPair(FILM, FILM);
  const pres = floatPair(SIM, SIM);
  const divT = floatTarget(SIM, SIM);
  const all = [...vel.all(), ...film.all(), ...pres.all(), divT];
  const clearAll = () => all.forEach(t => clearTarget(renderer, t));
  const draw = (m: THREE.ShaderMaterial, to: THREE.WebGLRenderTarget | null) => quad.draw(renderer, m, to);

  const probe = { x: 0, y: 0, active: false };
  let lastX = -1;
  let lastY = -1;
  let acc = 0;
  let idle = SETTLE + 1;

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    probe.x = e.clientX;
    probe.y = e.clientY;
    probe.active = true;
  };
  const onOut = (e: PointerEvent) => { if (!e.relatedTarget) probe.active = false; };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerout", onOut);

  const splat = (source: typeof vel, isFilm: boolean, px: number, py: number, cx: number, cy: number, aspect: number, amount: number) => {
    const u = M.splat.uniforms;
    u.uSource.value = source.read.texture;
    u.uPoint.value.set(px, py);
    u.uDelta.value.set(cx, cy);
    u.uAspect.value = aspect;
    u.uFilm.value = isFilm ? 1 : 0;
    u.uAmount.value = amount;
    draw(M.splat, source.write);
    source.swap();
  };
  const advect = (source: typeof vel, decay: number) => {
    const u = M.advect.uniforms;
    u.uVelocity.value = vel.read.texture;
    u.uSource.value = source.read.texture;
    u.uDecay.value = decay;
    u.uDt.value = 1.45 / 60;
    draw(M.advect, source.write);
    source.swap();
  };

  stage.add({
    render(_r, _s, dt) {
      if (!isBooted()) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      if (!probe.active) {
        if (idle < SETTLE) clearAll();
        idle = SETTLE + 1;
        lastX = lastY = -1;
      } else {
        const x = probe.x / w;
        const y = 1 - probe.y / h;
        if (lastX >= 0) {
          const dx = x - lastX;
          const dy = y - lastY;
          const dist = Math.hypot(dx * w, dy * h);
          if (dist > 0.5) {
            idle = 0;
            const steps = Math.min(12, Math.max(1, Math.ceil(dist / 18)));
            const amount = Math.min(0.26, dist * 0.017) / steps;
            const cx = Math.max(-0.08, Math.min(0.08, dx)) / steps;
            const cy = Math.max(-0.08, Math.min(0.08, dy)) / steps;
            for (let i = 1; i <= steps; i++) {
              const px = lastX + (dx * i) / steps;
              const py = lastY + (dy * i) / steps;
              splat(vel, false, px, py, cx, cy, w / h, amount);
              splat(film, true, px, py, cx, cy, w / h, amount);
            }
          }
        }
        lastX = x;
        lastY = y;
        idle += dt;
        if (idle < SETTLE) {
          acc += Math.min(dt, 0.05);
          while (acc >= STEP) {
            advect(vel, 0.95);
            M.div.uniforms.uSource.value = vel.read.texture;
            draw(M.div, divT);
            const s = M.solve.uniforms;
            s.uDiv.value = divT.texture;
            for (let i = 0; i < ITERS; i++) {
              s.uSource.value = pres.read.texture;
              draw(M.solve, pres.write);
              pres.swap();
            }
            const p = M.project.uniforms;
            p.uSource.value = pres.read.texture;
            p.uVelocity.value = vel.read.texture;
            draw(M.project, vel.write);
            vel.swap();
            advect(film, 0.9);
            acc -= STEP;
          }
        }
      }
      // The stage has already cleared the canvas this frame.
      if (idle < SETTLE) {
        M.display.uniforms.uFilm.value = film.read.texture;
        draw(M.display, null);
      }
    },
    dispose() {
      materials.forEach(m => m.dispose());
      quad.dispose();
      all.forEach(t => t.dispose());
    },
  });

  return {
    dispose() {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      stage.dispose();
    },
  };
}
