/**
 * Stable-fluids solver with heat as dye (port of the reference's createFluid).
 * Fixed 1/60 s steps through an accumulator capped at three steps a frame.
 */

import * as THREE from "three";
import * as FL from "@/lib/shaders/fluidSolver";
import { compileMaterials, createQuad, floatPair, floatTarget, quadMaterial, type Pair } from "./engine";

export type FluidSize = { sim: number; dye: number; iters: number };
export const FLUID_FINE: FluidSize = { sim: 160, dye: 640, iters: 20 };
export const FLUID_COARSE: FluidSize = { sim: 96, dye: 384, iters: 12 };

const STEP = 1 / 60;
const VELOCITY_DISSIPATION = 0.94;
const HEAT_DISSIPATION = 0.98;
const CURL = 9;
const BUOYANCY = 0.9;
const SPLAT_RADIUS = 0.0022;
const FORCE = 42;

export type Fluid = {
  readonly vel: Pair;
  readonly heat: Pair;
  /** pointer in canvas 0..1, y down; outside the canvas lifts the probe */
  pointer(x: number, y: number): void;
  update(dt: number, aspect: number): void;
  dispose(): void;
};

export function createFluid(renderer: THREE.WebGLRenderer, { sim, dye, iters }: FluidSize): Fluid | null {
  const tx = new THREE.Vector2(1 / sim, 1 / sim);
  const tex = (): THREE.IUniform<THREE.Texture | null> => ({ value: null });
  const num = (v = 0): THREE.IUniform<number> => ({ value: v });

  const M = {
    advect: quadMaterial(FL.advect, { uSource: tex(), uVelocity: tex(), uDt: num(), uDissipation: num() }),
    splat: quadMaterial(FL.splat, {
      uTarget: tex(), uPoint: { value: new THREE.Vector2() }, uValue: { value: new THREE.Vector3() }, uRadius: num(), uAspect: num(1),
    }),
    curl: quadMaterial(FL.curl, { uVelocity: tex(), uTexel: { value: tx } }),
    forces: quadMaterial(FL.forces, {
      uVelocity: tex(), uCurl: tex(), uHeat: tex(), uTexel: { value: tx },
      uCurlStrength: num(CURL), uBuoyancy: num(BUOYANCY), uDt: num(),
    }),
    div: quadMaterial(FL.divergence, { uVelocity: tex(), uTexel: { value: tx } }),
    pressure: quadMaterial(FL.pressure, { uPressure: tex(), uDivergence: tex(), uTexel: { value: tx } }),
    grad: quadMaterial(FL.gradient, { uPressure: tex(), uVelocity: tex(), uTexel: { value: tx } }),
  };
  const materials = Object.values(M);
  if (!compileMaterials(renderer, materials)) {
    materials.forEach(m => m.dispose());
    return null;
  }

  const quad = createQuad();
  const vel = floatPair(sim, sim);
  const heat = floatPair(dye, dye);
  const pres = floatPair(sim, sim);
  const divT = floatTarget(sim, sim);
  const curlT = floatTarget(sim, sim);
  const probe = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, live: false };
  let aspect = 1;
  let acc = 0;

  const draw = (m: THREE.ShaderMaterial, to: THREE.WebGLRenderTarget) => quad.draw(renderer, m, to);

  const splat = (pair: Pair, x: number, y: number, v: [number, number, number], radius: number) => {
    const u = M.splat.uniforms;
    u.uTarget.value = pair.read.texture;
    u.uPoint.value.set(x, y);
    u.uValue.value.set(...v);
    u.uRadius.value = radius;
    u.uAspect.value = aspect;
    draw(M.splat, pair.write);
    pair.swap();
  };
  const advect = (src: Pair, dissipation: number, dt: number) => {
    const u = M.advect.uniforms;
    u.uVelocity.value = vel.read.texture;
    u.uSource.value = src.read.texture;
    u.uDt.value = dt;
    u.uDissipation.value = dissipation;
    draw(M.advect, src.write);
    src.swap();
  };

  function step(dt: number) {
    advect(vel, VELOCITY_DISSIPATION, dt);
    if (probe.moved) {
      splat(vel, probe.x, probe.y, [probe.dx * FORCE, probe.dy * FORCE, 0], SPLAT_RADIUS);
      const speed = Math.hypot(probe.dx, probe.dy);
      const amount = Math.min(0.9, 0.12 + speed * 16);
      splat(heat, probe.x, probe.y, [amount, amount, amount], SPLAT_RADIUS * 0.6);
      probe.moved = false;
    }
    M.curl.uniforms.uVelocity.value = vel.read.texture;
    draw(M.curl, curlT);

    const f = M.forces.uniforms;
    f.uVelocity.value = vel.read.texture;
    f.uCurl.value = curlT.texture;
    f.uHeat.value = heat.read.texture;
    f.uDt.value = dt;
    draw(M.forces, vel.write);
    vel.swap();

    M.div.uniforms.uVelocity.value = vel.read.texture;
    draw(M.div, divT);

    const p = M.pressure.uniforms;
    p.uDivergence.value = divT.texture;
    for (let i = 0; i < iters; i++) {
      p.uPressure.value = pres.read.texture;
      draw(M.pressure, pres.write);
      pres.swap();
    }

    const g = M.grad.uniforms;
    g.uPressure.value = pres.read.texture;
    g.uVelocity.value = vel.read.texture;
    draw(M.grad, vel.write);
    vel.swap();

    advect(heat, HEAT_DISSIPATION, dt);
  }

  return {
    vel,
    heat,
    pointer(x, y) {
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        probe.live = false;
        return;
      }
      const sy = 1 - y;
      if (!probe.live) {
        probe.x = x;
        probe.y = sy;
        probe.live = true;
        return;
      }
      probe.dx += x - probe.x;
      probe.dy += sy - probe.y;
      probe.x = x;
      probe.y = sy;
      probe.moved = true;
    },
    update(dt, asp) {
      aspect = asp;
      acc += Math.min(Math.max(dt, 0), STEP * 3);
      while (acc >= STEP) {
        step(STEP);
        probe.dx = probe.dy = 0;
        acc -= STEP;
      }
    },
    dispose() {
      materials.forEach(m => m.dispose());
      quad.dispose();
      vel.dispose();
      heat.dispose();
      pres.dispose();
      divT.dispose();
      curlT.dispose();
    },
  };
}
