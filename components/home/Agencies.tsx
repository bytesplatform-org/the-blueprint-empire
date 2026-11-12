import type { CSSProperties } from "react";
import { agencies, brand, sheets } from "@/lib/content/site";
import SheetHead from "@/components/site/SheetHead";
import CopyButton from "@/components/site/CopyButton";
import CredentialSeal from "./CredentialSeal";

export default function Agencies() {
  const { id, sheet } = sheets.agencies;
  const { spec } = agencies;
  return (
    <section className="sheet on-dark" id={id} data-sheet={sheet}>
      <div className="wrap">
        <SheetHead heading={agencies.heading} body={agencies.body} />

        <figure className="fig-plate">
          <CredentialSeal ring={agencies.seal.ring} mark={brand.mark} tags={agencies.seal.tags} />
          <figcaption>{agencies.seal.caption}</figcaption>
        </figure>

        <div className="agency">
          <div className="spec" data-reveal="settle">
            <div className="spec-row"><div className="k">Legal entity</div><div>{spec.legalEntity}</div></div>
            <div className="spec-row">
              <div className="k">UEI</div>
              <div className="uei">
                <code>{spec.uei}</code>
                <CopyButton value={spec.uei} />
              </div>
            </div>
            <div className="spec-row"><div className="k">Contracting contact</div><div>{spec.contractingContact}</div></div>
            <div className="spec-row">
              <div className="k">NAICS</div>
              <div>
                <ul className="naics">
                  {spec.naics.map(n => (
                    <li key={n.code}>
                      <b>{n.code}</b>
                      {n.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="spec-row"><div className="k">Capabilities</div><div>{spec.capabilities}</div></div>
            <div className="spec-row"><div className="k">Membership</div><div>{spec.membership}</div></div>
          </div>
          <div data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
            <ol className="process">
              {agencies.process.map(step => (
                <li key={step.title}>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="docs">
              {agencies.documents.map(doc => (
                <a className={doc.primary ? "btn" : "btn ghost"} href={doc.href} target="_blank" rel="noopener" key={doc.href}>
                  {doc.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
