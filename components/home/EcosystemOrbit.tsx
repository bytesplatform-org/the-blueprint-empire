"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motionAllowed } from "@/lib/animation/motion";

type Brand = { short: string; name: string; tag: string };

const C = 250;
const R = 190;
const HUB = 54;
const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * The orbit and the brand list share one active index: it cycles every 2.2 s
 * (with motion), and hovering a brand holds it until the pointer leaves.
 */
export default function EcosystemOrbit({ brands, core, head, children }: { brands: Brand[]; core: string; head?: ReactNode; children?: ReactNode }) {
  const [active, setActive] = useState(0);
  const next = useRef(1);
  const timer = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!motionAllowed() || timer.current !== null) return;
    timer.current = window.setInterval(() => {
      setActive(next.current);
      next.current = (next.current + 1) % brands.length;
    }, 2200);
  }, [brands.length]);
  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    start();
    return stop;
  }, [start]);

  const nodes = brands.map((b, i) => {
    const a = (i / brands.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...b,
      x: round(C + R * Math.cos(a)),
      y: round(C + R * Math.sin(a)),
      sx: round(C + HUB * Math.cos(a)),
      sy: round(C + HUB * Math.sin(a)),
    };
  });

  return (
    <>
      <div className="orbit" data-reveal="settle" aria-hidden="true">
        <svg viewBox="0 0 500 500">
          <circle className="orbit-ring" cx="250" cy="250" r="190" />
          <circle className="orbit-ring d" cx="250" cy="250" r="120" />
          <circle className="orbit-ring d" cx="250" cy="250" r="236" />
          <g className="spin">
            {nodes.map((n, i) => (
              <g key={n.short}>
                <line className={i === active ? "spoke on" : "spoke"} x1={n.sx} y1={n.sy} x2={n.x} y2={n.y} />
                <g className={i === active ? "node on" : "node"}>
                  <g className="counter">
                    <circle cx={n.x} cy={n.y} r="30" />
                    <text x={n.x} y={round(n.y + 4)}>{n.short}</text>
                  </g>
                </g>
              </g>
            ))}
          </g>
          <g className="core">
            <rect x="196" y="196" width="108" height="108" />
            <text x="250" y="258">{core}</text>
          </g>
        </svg>
      </div>
      <div>
        {head}
        <ol className="brands">
          {brands.map((b, i) => (
            <li
              key={b.short}
              data-reveal="settle"
              className={i === active ? "on" : undefined}
              style={i ? ({ "--i": i } as CSSProperties) : undefined}
              onMouseEnter={() => {
                stop();
                setActive(i);
                next.current = i;
              }}
              onMouseLeave={start}
            >
              <h3>{b.name}</h3>
              <span className="t">{b.tag}</span>
            </li>
          ))}
        </ol>
        {children}
      </div>
    </>
  );
}
