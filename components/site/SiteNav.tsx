"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { brand, nav } from "@/lib/content/site";

/**
 * Floating capsule nav. Whichever [data-sheet] section crosses the middle band
 * of the viewport lights its link. Below 1060 px the links fold into a menu.
 */
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-sheet]")];
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (!e.isIntersecting) return;
        setActive((e.target as HTMLElement).id);
      }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, []);

  // A menu left open shouldn't greet the reader when this page is shown again.
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <header className={`nav${open ? " open" : ""}`} id="nav">
      <div className="wrap">
        <a className="brand" href="#top" aria-label={brand.homeLabel}>
          <span className="mark" aria-hidden="true">{brand.mark}</span>
          <span className="brand-name">
            {brand.name}
            <small>{brand.sub}</small>
          </span>
        </a>
        <ul className="nav-links" id="navlinks">
          {nav.links.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                className={active && link.href === `#${active}` ? "on" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a className="btn" href={nav.cta.href}>{nav.cta.label}</a>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="navlinks"
          onClick={() => setOpen(o => !o)}
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </div>
    </header>
  );
}
