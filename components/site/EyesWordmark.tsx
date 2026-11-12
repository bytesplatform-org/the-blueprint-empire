"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motionAllowed } from "@/lib/animation/motion";
import { isTouchFirst } from "@/lib/animation/prefs";

type Eye = { x: number; y: number; r: number; gx: number; gy: number };

/**
 * The footer wordmark with eyes. Its lines are set huge and cropped at the
 * bottom; every enclosed counter (the bowls of B, P and R) becomes an eye:
 * the counter is filled in and a dark pupil sits inside it, sliding toward
 * the pointer and blinking now and then. On touch screens the eyes wander.
 *
 * The counters are found from the rendered type itself: flood-fill the
 * background in from the edges, and what's left enclosed is a counter; a
 * distance transform gives each one's largest inscribed circle, the pupil's
 * range. So it works for any face and size. The DOM text stays as the layout
 * and the accessible name, and shows as-is without motion or canvas.
 */
export default function EyesWordmark({ lines, label }: { lines: string[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = ref.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!box || !canvas || !ctx || !motionAllowed()) return;
    const lineEls = [...box.querySelectorAll<HTMLElement>("[data-eye-line]")];
    const touch = isTouchFirst();

    let text: HTMLCanvasElement | null = null;
    let fill: HTMLCanvasElement | null = null;
    let eyes: Eye[] = [];
    let pr = 1;
    /** box width at the last build: only a width change warrants a rebuild */
    let builtWidth = -1;
    let ink = "#0e0e0e";
    let visible = false;
    let disposed = false;
    const pointer = { x: 0, y: 0, has: false };

    // Size the type so the widest line fills the box.
    const fit = () => {
      box.style.fontSize = "100px";
      const widest = Math.max(...lineEls.map(l => l.getBoundingClientRect().width));
      const avail = box.clientWidth;
      if (widest > 0) box.style.fontSize = `${(100 * avail) / widest}px`;
    };

    const drawText = (c: CanvasRenderingContext2D, color: string) => {
      const br = box.getBoundingClientRect();
      c.fillStyle = color;
      c.textBaseline = "alphabetic";
      for (const line of lineEls) {
        const cs = getComputedStyle(line);
        const size = parseFloat(cs.fontSize) * pr;
        c.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
        const tracking = (parseFloat(cs.letterSpacing) || 0) * pr;
        const raw = (line.firstChild?.textContent ?? "").trim();
        const str = cs.textTransform === "uppercase" ? raw.toUpperCase() : raw;
        const left = (line.getBoundingClientRect().left - br.left) * pr;
        const base = (line.querySelector<HTMLElement>("[data-baseline]")!.getBoundingClientRect().bottom - br.top) * pr;
        const chars = [...str];
        chars.forEach((ch, i) => c.fillText(ch, left + c.measureText(chars.slice(0, i).join("")).width + tracking * i, base));
      }
    };

    const build = () => {
      if (disposed) return;
      builtWidth = box.clientWidth;
      fit();
      // sharp on high-density screens; this runs once per width, not per frame
      pr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(box.clientWidth * pr));
      const h = Math.max(1, Math.round(box.clientHeight * pr));
      canvas.width = w;
      canvas.height = h;
      // pupils in the panel's colour, type in its text colour (computed, so always rgb())
      const panel = getComputedStyle(box.closest(".ftr-panel") ?? box);
      ink = panel.backgroundColor || ink;
      const color = panel.color || "rgb(242, 237, 228)";

      text = document.createElement("canvas");
      text.width = w;
      text.height = h;
      const tc = text.getContext("2d", { willReadFrequently: true })!;
      drawText(tc, color);

      // ---- find the counters
      const a = tc.getImageData(0, 0, w, h).data;
      const n = w * h;
      const solid = new Uint8Array(n);
      for (let i = 0; i < n; i++) solid[i] = a[i * 4 + 3] >= 128 ? 1 : 0;
      const outside = new Uint8Array(n);
      const queue = new Int32Array(n);
      let qh = 0;
      let qt = 0;
      const seed = (i: number) => { if (!solid[i] && !outside[i]) { outside[i] = 1; queue[qt++] = i; } };
      for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
      for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
      while (qh < qt) {
        const i = queue[qh++];
        const x = i % w;
        if (x > 0) seed(i - 1);
        if (x < w - 1) seed(i + 1);
        if (i >= w) seed(i - w);
        if (i < n - w) seed(i + w);
      }
      // distance (px) from each enclosed pixel to the nearest non-enclosed one
      const INF = 1e9;
      const dist = new Float32Array(n);
      for (let i = 0; i < n; i++) dist[i] = !solid[i] && !outside[i] ? INF : 0;
      const D = Math.SQRT2;
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (!dist[i]) continue;
        dist[i] = Math.min(dist[i], dist[i - 1] + 1, dist[i - w] + 1, dist[i - w - 1] + D, dist[i - w + 1] + D);
      }
      for (let y = h - 2; y > 0; y--) for (let x = w - 2; x > 0; x--) {
        const i = y * w + x;
        if (!dist[i]) continue;
        dist[i] = Math.min(dist[i], dist[i + 1] + 1, dist[i + w] + 1, dist[i + w + 1] + D, dist[i + w - 1] + D);
      }
      // label each counter; keep the real ones (not hairline gaps in serifs)
      const label = new Int32Array(n);
      const minR = parseFloat(getComputedStyle(lineEls[0]).fontSize) * pr * 0.035;
      const found: Eye[] = [];
      const fillData = tc.createImageData(w, h);
      const [fr, fg, fb] = color.match(/\d+/g)?.map(Number) ?? [242, 237, 228];
      let next = 0;
      for (let s = 0; s < n; s++) {
        if (dist[s] === 0 || label[s]) continue;
        next++;
        let best = s;
        const members: number[] = [];
        qh = qt = 0;
        queue[qt++] = s;
        label[s] = next;
        while (qh < qt) {
          const i = queue[qh++];
          members.push(i);
          if (dist[i] > dist[best]) best = i;
          const x = i % w;
          const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w];
          for (const j of nb) if (j >= 0 && j < n && dist[j] > 0 && !label[j]) { label[j] = next; queue[qt++] = j; }
        }
        if (dist[best] < minR) continue;
        found.push({ x: (best % w) / pr, y: Math.floor(best / w) / pr, r: dist[best] / pr, gx: 0, gy: 0 });
        // fill the counter in (and 2 px past its edge, ivory on ivory) so no outline remains
        for (const i of members) {
          const x = i % w;
          const y = (i / w) | 0;
          for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
            const k = (yy * w + xx) * 4;
            fillData.data[k] = fr; fillData.data[k + 1] = fg; fillData.data[k + 2] = fb; fillData.data[k + 3] = 255;
          }
        }
      }
      fill = document.createElement("canvas");
      fill.width = w;
      fill.height = h;
      fill.getContext("2d")!.putImageData(fillData, 0, 0);
      eyes = found;
      box.toggleAttribute("data-eyes", eyes.length > 0);
    };

    // blinks: every few seconds one eye (sometimes all) closes for a moment
    let blinkAt = performance.now() + 2500;
    let blinkUntil = 0;
    let blinkWho = -1;

    const tick = (_t: number, deltaMs: number) => {
      if (!visible || !text || !fill) return;
      const dt = Math.min(deltaMs / 1000, 0.1);
      const now = performance.now();
      if (now > blinkAt) {
        blinkUntil = now + 140;
        blinkWho = Math.random() < 0.35 ? -2 : Math.floor(Math.random() * eyes.length);
        blinkAt = now + 2200 + Math.random() * 3500;
      }
      const br = box.getBoundingClientRect();
      const t = now / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(text, 0, 0);
      ctx.drawImage(fill, 0, 0);
      ctx.setTransform(pr, 0, 0, pr, 0, 0);
      ctx.fillStyle = ink;
      const k = 1 - Math.pow(0.002, dt);
      eyes.forEach((e, i) => {
        const pupil = e.r * 0.56;
        const reach = (e.r - pupil) * 0.92;
        let tx: number;
        let ty: number;
        if (pointer.has && !touch) {
          tx = pointer.x - (br.left + e.x);
          ty = pointer.y - (br.top + e.y);
        } else {
          tx = Math.sin(t * 0.6 + i) * 100;
          ty = Math.cos(t * 0.45 + i * 1.7) * 60;
        }
        const len = Math.hypot(tx, ty) || 1;
        const amount = Math.min(1, len / (e.r * 5));
        e.gx += ((tx / len) * reach * amount - e.gx) * k;
        e.gy += ((ty / len) * reach * amount - e.gy) * k;
        const closed = now < blinkUntil && (blinkWho === -2 || blinkWho === i);
        ctx.beginPath();
        ctx.ellipse(e.x + e.gx, e.y + e.gy, pupil, closed ? pupil * 0.12 : pupil, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const onMove = (e: PointerEvent) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.has = true; };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([en]) => { visible = !!en?.isIntersecting; });
    io.observe(box);
    let resizeTimer = 0;
    // Only a width change rebuilds. Building refits the type, which changes
    // the box's height; reacting to that would rebuild forever.
    const ro = new ResizeObserver(() => {
      if (box.clientWidth === builtWidth) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    });

    const specs = lineEls.map(l => {
      const cs = getComputedStyle(l);
      return `${cs.fontStyle} ${cs.fontWeight} 100px ${cs.fontFamily}`;
    });
    Promise.all(specs.map(s => document.fonts.load(s).catch(() => [])))
      .then(() => document.fonts.ready)
      .then(() => {
        if (disposed) return;
        build();
        ro.observe(box);
        gsap.ticker.add(tick);
      });

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      box.removeAttribute("data-eyes");
      box.style.fontSize = "";
    };
  }, []);

  return (
    <div className="ftr-mark" ref={ref} role="img" aria-label={label}>
      {lines.map(line => (
        <span className="eye-line" data-eye-line key={line} aria-hidden="true">
          {line}
          <span className="bl" data-baseline />
        </span>
      ))}
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
