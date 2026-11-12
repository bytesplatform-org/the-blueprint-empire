import { ecosystem, sheets } from "@/lib/content/site";
import SheetHead from "@/components/site/SheetHead";
import EcosystemOrbit from "./EcosystemOrbit";
import ArcBg from "@/components/site/ArcBg";

export default function Ecosystem() {
  const { id, sheet } = sheets.ecosystem;
  return (
    <section className="sheet vellum arc" id={id} data-sheet={sheet}>
      <ArcBg />
      <div className="wrap">
        <SheetHead heading={ecosystem.heading} body={ecosystem.body} />
        <div className="eco">
          <EcosystemOrbit brands={ecosystem.brands} core={ecosystem.core}>
            <div className="nsba" data-reveal="settle">
              <span className="seal">{ecosystem.nsba.seal}</span>
              <p>{ecosystem.nsba.body}</p>
            </div>
          </EcosystemOrbit>
        </div>
      </div>
    </section>
  );
}
