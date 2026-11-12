"use client";

import { useEffect, useRef } from "react";
import { motionAllowed } from "@/lib/animation/motion";
import { isTouchFirst } from "@/lib/animation/prefs";
import { onBootDone } from "@/lib/boot";
import { createFilmTrail } from "@/lib/gl/filmTrail";

/**
 * The pointer's liquid-film trail over the whole page. Fine pointers with
 * motion only, starting once the page has booted. Sits above the content and
 * below the nav, and never takes pointer events.
 */
export default function FilmTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !motionAllowed() || isTouchFirst()) return;
    let film: { dispose(): void } | null = null;
    let cancelled = false;
    const off = onBootDone(() => {
      if (!cancelled) film = createFilmTrail(canvas);
    });
    return () => {
      cancelled = true;
      off();
      film?.dispose();
    };
  }, []);

  return <canvas ref={ref} className="film-gl" aria-hidden="true" />;
}
