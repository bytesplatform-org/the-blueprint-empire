/**
 * A small Three.js stage for fullscreen-quad shaders (the port of the
 * reference's makeGL mini-engine).
 *
 * One WebGLRenderer per canvas, ticking on gsap.ticker, skipping frames while
 * the canvas is offscreen, resizing through a ResizeObserver with a capped
 * pixel ratio, and surviving context loss the way components/gl/FluidVideo
 * does. Every display shader writes premultiplied colour into a cleared,
 * premultiplied canvas, so materials use NoBlending (as do simulation passes).
 */

import * as THREE from "three";
import gsap from "gsap";

/** Clip-space quad: PlaneGeometry(2, 2) covers the target, vUv runs 0..1 from bottom-left. */
export const QUAD_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export type Shared = {
  /** seconds this stage has been drawing */
  uTime: THREE.IUniform<number>;
  /** drawing-buffer size in px */
  uResolution: THREE.IUniform<THREE.Vector2>;
  /** eased pointer in canvas 0..1, y down */
  uMouse: THREE.IUniform<THREE.Vector2>;
};

export type Pass = {
  render(renderer: THREE.WebGLRenderer, shared: Shared, dt: number): void;
  resize?(): void;
  dispose(): void;
};

export type StageOptions = {
  dprCap?: number;
  scale?: number;
  /** false: no ticker; draw with renderOnce() (and again after each resize) */
  animate?: boolean;
  /** IntersectionObserver margin for "on screen" */
  rootMargin?: string;
  /** the WebGL context went away: show the DOM version */
  onLost?(): void;
  /** the context came back and the stage will draw again */
  onRestored?(): void;
};

export type Stage = {
  renderer: THREE.WebGLRenderer;
  shared: Shared;
  canvas: HTMLCanvasElement;
  add(pass: Pass): void;
  /** draws one frame now, advancing uTime by dt */
  renderOnce(dt?: number): void;
  /** pointer target from client coordinates (uMouse eases toward it) */
  setPointer(clientX: number, clientY: number): void;
  /** pointer target in canvas 0..1, y down */
  setPointerUV(x: number, y: number): void;
  /** drawing-buffer px per CSS px */
  pixelRatio(): number;
  /** applies the canvas's current CSS size now (before the first frame, say) */
  syncSize(): void;
  readonly visible: boolean;
  readonly lost: boolean;
  dispose(): void;
};

export function createStage(
  canvas: HTMLCanvasElement,
  { dprCap = 2, scale = 1, animate = true, rootMargin = "120px", onLost, onRestored }: StageOptions = {},
): Stage | null {
  let renderer: THREE.WebGLRenderer;
  try {
    // Ask for the context first: without WebGL2 this returns null quietly,
    // where Three would log an error for every canvas that tried.
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
      depth: false,
      stencil: false,
    });
    if (!context) return null;
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: false, premultipliedAlpha: true });
  } catch {
    return null;
  }
  renderer.autoClear = false;
  renderer.setClearColor(0, 0);

  const shared: Shared = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  };
  const mouseTarget = new THREE.Vector2(0.5, 0.5);
  const passes: Pass[] = [];
  let visible = false;
  let lost = false;
  let disposed = false;
  let needsResize = true;

  const applySize = () => {
    needsResize = false;
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    const pr = Math.min(window.devicePixelRatio || 1, dprCap) * scale;
    if (renderer.getPixelRatio() !== pr) renderer.setPixelRatio(pr);
    const size = renderer.getSize(new THREE.Vector2());
    if (size.x !== w || size.y !== h) renderer.setSize(w, h, false);
    shared.uResolution.value.set(canvas.width, canvas.height);
    passes.forEach(p => p.resize?.());
  };

  const draw = (dt: number) => {
    if (needsResize) applySize();
    shared.uTime.value += dt;
    const k = 1 - Math.pow(0.001, dt);
    shared.uMouse.value.lerp(mouseTarget, dt > 0 ? k : 1);
    renderer.setRenderTarget(null);
    renderer.clear(true, false, false);
    for (const pass of passes) pass.render(renderer, shared, dt);
  };

  const tick = (_time: number, deltaMs: number) => {
    if (!visible || lost || disposed) return;
    draw(Math.min(Math.max(deltaMs / 1000, 0), 0.1));
  };

  const io = new IntersectionObserver(([entry]) => { visible = !!entry?.isIntersecting; }, { rootMargin });
  io.observe(canvas);
  const ro = new ResizeObserver(() => {
    needsResize = true;
    if (!animate && !lost && !disposed) draw(0);
  });
  ro.observe(canvas);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    onLost?.();
  };
  const onContextRestored = () => {
    // Three re-initialises its GPU caches and re-uploads lazily.
    lost = false;
    needsResize = true;
    onRestored?.();
    if (!animate) draw(0);
  };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  if (animate) gsap.ticker.add(tick);

  return {
    renderer,
    shared,
    canvas,
    get visible() { return visible; },
    get lost() { return lost; },
    add(pass) {
      passes.push(pass);
      needsResize = true;
    },
    renderOnce(dt = 0) {
      if (!lost && !disposed) draw(dt);
    },
    setPointer(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      mouseTarget.set((clientX - r.left) / Math.max(r.width, 1), (clientY - r.top) / Math.max(r.height, 1));
    },
    setPointerUV(x, y) {
      mouseTarget.set(x, y);
    },
    pixelRatio() {
      return canvas.width / Math.max(canvas.clientWidth, 1);
    },
    syncSize() {
      if (!disposed) applySize();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      passes.splice(0).forEach(p => p.dispose());
      renderer.dispose();
    },
  };
}

/* ---------------------------------------------------------------- quads */

export type Quad = {
  /** draws material over the whole target (null = the canvas) */
  draw(renderer: THREE.WebGLRenderer, material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null): void;
  dispose(): void;
};

export function createQuad(): Quad {
  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry);
  mesh.frustumCulled = false; // the vertex shader writes clip space directly
  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.Camera();
  return {
    draw(renderer, material, target) {
      mesh.material = material;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose();
    },
  };
}

/** A fullscreen-quad material in the project's shader convention, written without blending. */
export function quadMaterial(fragmentShader: string, uniforms: Record<string, THREE.IUniform>) {
  return new THREE.ShaderMaterial({
    vertexShader: QUAD_VERTEX,
    fragmentShader,
    uniforms,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
  });
}

/**
 * Compiles and links every material now, so a broken shader shows up at
 * creation (and the component can keep its DOM version) instead of as a
 * blank canvas later. Returns false if any failed.
 */
export function compileMaterials(renderer: THREE.WebGLRenderer, materials: THREE.ShaderMaterial[]): boolean {
  const quad = createQuad();
  const scratch = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  let ok = true;
  try {
    for (const material of materials) {
      quad.draw(renderer, material, scratch);
      const program = (renderer.properties.get(material) as { currentProgram?: { diagnostics?: { runnable: boolean } } })
        .currentProgram;
      if (!program || program.diagnostics?.runnable === false) ok = false;
    }
  } catch {
    ok = false;
  } finally {
    renderer.setRenderTarget(null);
    scratch.dispose();
    quad.dispose();
  }
  return ok;
}

/** A fullscreen shader drawn straight to the canvas. update() runs first and may return false to skip the frame. */
export function createShaderPass(
  shared: Shared,
  {
    fragmentShader,
    uniforms = {},
    update,
  }: {
    fragmentShader: string;
    uniforms?: Record<string, THREE.IUniform>;
    update?(dt: number): boolean | void;
  },
) {
  const quad = createQuad();
  // Shared uniforms are linked by reference; a pass may override one by name.
  const material = quadMaterial(fragmentShader, {
    uTime: shared.uTime,
    uResolution: shared.uResolution,
    uMouse: shared.uMouse,
    ...uniforms,
  });
  const pass: Pass & { material: THREE.ShaderMaterial } = {
    material,
    render(renderer, _shared, dt) {
      if (update?.(dt) === false) return;
      quad.draw(renderer, material, null);
    },
    dispose() {
      material.dispose();
      quad.dispose();
    },
  };
  return pass;
}

/* ---------------------------------------------------------- float targets */

export function supportsFloatTargets(renderer: THREE.WebGLRenderer) {
  return renderer.extensions.has("EXT_color_buffer_float");
}

export function floatTarget(w: number, h: number) {
  return new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export type Pair = {
  readonly read: THREE.WebGLRenderTarget;
  readonly write: THREE.WebGLRenderTarget;
  swap(): void;
  all(): THREE.WebGLRenderTarget[];
  dispose(): void;
};

export function floatPair(w: number, h: number): Pair {
  let a = floatTarget(w, h);
  let b = floatTarget(w, h);
  return {
    get read() { return a; },
    get write() { return b; },
    swap() { [a, b] = [b, a]; },
    all: () => [a, b],
    dispose() { a.dispose(); b.dispose(); },
  };
}

export function clearTarget(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null) {
  renderer.setRenderTarget(target);
  renderer.clear(true, false, false);
}
