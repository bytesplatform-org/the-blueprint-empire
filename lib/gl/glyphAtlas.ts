/**
 * Display type for GL: each [data-atlas-word] is rasterised once into an
 * atlas (alpha = coverage), then placed every frame from the live DOM, so
 * whatever moves the DOM words (GSAP drift, lean, entrances) carries into GL.
 */

import * as THREE from "three";
import { fontsReady } from "@/lib/animation/prefs";

export type AtlasWord = { word: HTMLElement; baseline: HTMLElement };

export type Atlas = {
  fill: HTMLCanvasElement;
  rows: { ay: number; w: number; h: number; ascent: number }[];
  pad: number;
  /** outline radius in atlas px for hollow words, else 0 */
  outline: number[];
};

/**
 * GLSL for sampling the atlas: glyph(p) returns (shown, fill) at canvas px p
 * (y down). Hollow words show only their outline (a max−min dilation ring);
 * glyphWord / glyphLocal / glyphHollow describe the word that was hit.
 */
export const glyphChunk = (n: number) => /* glsl */ `
uniform sampler2D uFill; uniform vec2 uAtlasSize; uniform vec4 uWords[${n}]; uniform vec3 uAtlas[${n}];
float glyphWord=-1.0; vec2 glyphLocal=vec2(0.0); float glyphHollow=0.0;
vec2 glyph(vec2 p){
  vec2 g=vec2(0.0); glyphWord=-1.0; glyphHollow=0.0;
  for(int i=0;i<${n};i++){
    vec2 q=p-uWords[i].xy;
    if(q.x>=0.0&&q.y>=0.0&&q.x<uWords[i].z&&q.y<uWords[i].w){
      vec2 at=uAtlas[i].xy+q;
      float f=textureLod(uFill,at/uAtlasSize,0.0).a; float shown=f; float r=uAtlas[i].z;
      if(r>0.0){
        float hi=f, lo=f;
        for(int k=0;k<8;k++){float ang=float(k)*0.7853982;float s=textureLod(uFill,(at+vec2(cos(ang),sin(ang))*r)/uAtlasSize,0.0).a;hi=max(hi,s);lo=min(lo,s);}
        shown=clamp(hi-lo,0.0,1.0);
      }
      if(max(shown,f)>0.0||glyphWord<0.0){glyphWord=float(i);glyphLocal=q/uWords[i].zw;glyphHollow=r>0.0?1.0:0.0;}
      g=max(g,vec2(shown,f));
    }
  }
  return g;
}`;

export function atlasWords(root: ParentNode): AtlasWord[] {
  return [...root.querySelectorAll<HTMLElement>("[data-atlas-word]")].map(word => ({
    word,
    baseline: word.parentElement!.querySelector<HTMLElement>("[data-baseline]")!,
  }));
}

/**
 * Waits for the exact faces the words use. next/font renames families
 * (e.g. "__bigShoulders_1a2b3c"), and canvas text silently falls back to
 * another face when the real one isn't loaded yet, so each word's computed
 * family and weight is loaded explicitly before rasterising.
 */
export async function loadAtlasFonts(words: AtlasWord[]) {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const specs = new Set(
    words.map(({ word }) => {
      const cs = getComputedStyle(word);
      return `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) || 16}px ${cs.fontFamily}`;
    }),
  );
  await Promise.all([...specs].map(spec => document.fonts.load(spec).catch(() => [])));
  await fontsReady(3500);
}

export function buildAtlas(words: AtlasWord[], pr: number): Atlas {
  const pad = Math.ceil(16 * pr);
  const sc = document.createElement("canvas").getContext("2d")!;
  const specs = words.map(({ word }) => {
    const cs = getComputedStyle(word);
    const size = parseFloat(cs.fontSize) * pr;
    const font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    const tracking = (parseFloat(cs.letterSpacing) || 0) * pr;
    const raw = (word.textContent || "").trim();
    const text = cs.textTransform === "uppercase" ? raw.toUpperCase() : raw;
    const hollow = word.hasAttribute("data-hollow");
    const stroke = (parseFloat(cs.getPropertyValue("-webkit-text-stroke-width")) || 1.5) * pr;
    sc.font = font;
    const chars = [...text];
    const xs = chars.map((_, i) => sc.measureText(chars.slice(0, i).join("")).width + tracking * i);
    const m = sc.measureText(text);
    const width = m.width + tracking * chars.length;
    const ascent = Math.ceil(m.fontBoundingBoxAscent ?? size);
    const descent = Math.ceil(m.fontBoundingBoxDescent ?? size * 0.25);
    return { font, chars, xs, width, ascent, descent, hollow, stroke };
  });
  const w = Math.ceil(Math.max(...specs.map(s => s.width)) + pad * 2);
  const rows: Atlas["rows"] = [];
  let y = 0;
  specs.forEach(s => {
    const h = s.ascent + s.descent + pad * 2;
    rows.push({ ay: y, w, h, ascent: s.ascent });
    y += h;
  });
  const fill = document.createElement("canvas");
  fill.width = w;
  fill.height = Math.ceil(y);
  const fc = fill.getContext("2d")!;
  fc.fillStyle = "#fff";
  fc.textBaseline = "alphabetic";
  specs.forEach((s, i) => {
    const base = rows[i].ay + pad + s.ascent;
    fc.font = s.font;
    s.chars.forEach((ch, j) => fc.fillText(ch, pad + s.xs[j], base));
  });
  return { fill, rows, pad, outline: specs.map(s => (s.hollow ? s.stroke / 2 : 0)) };
}

/** Writes each word's atlas rect into W (vec4 per word, canvas px) and A (vec3: atlas origin + outline). */
export function placeWords(words: AtlasWord[], atlas: Atlas, cr: DOMRect, pr: number, W: Float32Array, A: Float32Array) {
  words.forEach(({ word, baseline }, i) => {
    const r = atlas.rows[i];
    const left = word.getBoundingClientRect().left - cr.left;
    const base = baseline.getBoundingClientRect().bottom - cr.top;
    W.set([left * pr - atlas.pad, base * pr - r.ascent - atlas.pad, r.w, r.h], i * 4);
    A.set([0, r.ay, atlas.outline[i]], i * 3);
  });
}

/** Uploads the atlas as a texture laid out the way the shader reads it. */
export function atlasTexture(atlas: Atlas) {
  const texture = new THREE.CanvasTexture(atlas.fill);
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.NoColorSpace;
  texture.premultiplyAlpha = false;
  return texture;
}
