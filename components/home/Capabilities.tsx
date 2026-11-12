import type { CSSProperties, ReactNode } from "react";
import { capabilities, sheets, type IconName } from "@/lib/content/site";
import SheetHead from "@/components/site/SheetHead";
import ArcBg from "@/components/site/ArcBg";

const ICONS: Record<IconName, ReactNode> = {
  design: (<><path d="M4 4h12l4 4v12H4z" /><path d="M8 10h8M8 14h8M8 18h5" /></>),
  digital: (<><rect x="3" y="4" width="18" height="12" /><path d="M8 20h8M12 16v4" /><path d="M10 8l4 2-4 2z" /></>),
  startup: (<><path d="M3 20h18M6 20V10l6-5 6 5v10" /><path d="M10 20v-5h4v5" /></>),
  workforce: (<><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 2 6 5.5" /></>),
  coordination: (<><path d="M4 6h16M4 12h10M4 18h7" /><path d="M16 15l2 2 4-4" /></>),
  admin: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

export default function Capabilities() {
  const { id, sheet } = sheets.capabilities;
  return (
    <section className="sheet vellum arc" id={id} data-sheet={sheet}>
      <ArcBg />
      <div className="wrap">
        <SheetHead heading={capabilities.heading} body={capabilities.body} />
        <div className="caps">
          {capabilities.items.map((cap, i) => (
            <div className="cap" data-reveal="settle" key={cap.title} style={i % 3 ? ({ "--i": i % 3 } as CSSProperties) : undefined}>
              <span className="ic">
                <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[cap.icon]}</svg>
              </span>
              <h3>{cap.title}</h3>
              <p>{cap.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
