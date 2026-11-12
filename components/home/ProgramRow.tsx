"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * One schedule row: the header is the toggle, the detail opens by animating
 * grid-template-rows 0fr → 1fr. Page height changes, so ScrollTrigger
 * re-measures once the transition is done.
 */
export default function ProgramRow({
  id,
  defaultOpen = false,
  head,
  children,
}: {
  id: string;
  defaultOpen?: boolean;
  head: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const toggle = () => {
    setOpen(o => !o);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => ScrollTrigger.refresh(), 600);
  };

  return (
    <div className="sch-row">
      <button type="button" className="sch-btn" aria-expanded={open} aria-controls={id} onClick={toggle}>
        {head}
      </button>
      <div className="sch-detail" id={id}>
        <div>{children}</div>
      </div>
    </div>
  );
}
