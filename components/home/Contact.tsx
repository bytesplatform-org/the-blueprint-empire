import type { CSSProperties } from "react";
import { contact, sheets } from "@/lib/content/site";
import { MaskLines, SheetLabel } from "@/components/site/SheetHead";
import CopyButton from "@/components/site/CopyButton";
import InquiryForm from "./InquiryForm";
import ArcBg from "@/components/site/ArcBg";

export default function Contact() {
  const { id, sheet } = sheets.contact;
  const { visit } = contact;
  return (
    <section className="sheet vellum arc" id={id} data-sheet={sheet}>
      <ArcBg />
      <div className="wrap">
        <div className="contact">
          <div>
            <SheetLabel>{contact.label}</SheetLabel>
            <h2 data-reveal="mask">
              <MaskLines lines={contact.heading} />
            </h2>
            <p data-reveal="settle" style={{ marginTop: 18, color: "var(--graphite-dim)", maxWidth: "46ch" }}>
              {contact.body}
            </p>
            <p className="contact-cheer" data-reveal="settle">{contact.cheer}</p>
            <div className="lines" data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
              <div className="cline">
                <span className="k">Email</span>
                <span className="v">{contact.email}</span>
                <CopyButton value={contact.email} />
              </div>
              <div className="cline">
                <span className="k">Phone</span>
                <span className="v">{contact.phone}</span>
                <CopyButton value={contact.phone} />
              </div>
              <div className="cline">
                <span className="k">Offices</span>
                {/* TODO(client): confirm primary address (see lib/content/site.ts). */}
                <span className="v plain">{contact.offices}</span>
                <span />
              </div>
              <div className="cline">
                <span className="k">Hours</span>
                <span className="v plain">{contact.hours}</span>
                <span />
              </div>
            </div>
            <div className="dl-row" style={{ marginTop: 22 }}>
              <a className="dl" href={contact.referral.href} target="_blank" rel="noopener">{contact.referral.label}</a>
            </div>
          </div>
          <InquiryForm />
        </div>

        <div className="visit" data-reveal="settle">
          <div className="visit-copy">
            <h3>{visit.name}</h3>
            <p className="visit-addr">{visit.address}</p>
            <p>{visit.servicing}</p>
            <p>{visit.delivery}</p>
            <a className="btn" href={visit.directions.href} target="_blank" rel="noopener">{visit.directions.label}</a>
          </div>
          {/* The map is a picture here (no pointer events), so it never swallows
              the page's scroll; clicking it opens Google Maps. */}
          <a className="visit-map" href={visit.map.href} target="_blank" rel="noopener" aria-label={visit.map.title}>
            <iframe src={visit.map.src} title={visit.map.title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={-1} />
          </a>
        </div>
      </div>
    </section>
  );
}
