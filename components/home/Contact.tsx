import type { CSSProperties } from "react";
import { contact, sheets } from "@/lib/content/site";
import { MaskLines } from "@/components/site/SheetHead";
import CopyButton from "@/components/site/CopyButton";
import InquiryForm from "./InquiryForm";
import ArcBg from "@/components/site/ArcBg";

export default function Contact() {
  const { id, sheet } = sheets.contact;
  return (
    <section className="sheet vellum arc" id={id} data-sheet={sheet}>
      <ArcBg />
      <div className="wrap">
        <div className="contact">
          <div>
            <h2 data-reveal="mask">
              <MaskLines lines={contact.heading} />
            </h2>
            <p data-reveal="settle" style={{ marginTop: 18, color: "var(--graphite-dim)", maxWidth: "46ch" }}>
              {contact.body}
            </p>
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
      </div>
    </section>
  );
}
