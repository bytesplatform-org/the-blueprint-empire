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
        <SheetHead label={ecosystem.label} heading={ecosystem.heading} body={ecosystem.body} />
        <div className="eco">
          <EcosystemOrbit
            brands={ecosystem.brands}
            core={ecosystem.core}
            head={
              <div className="brands-head" data-reveal="settle">
                <h3>{ecosystem.brandsHeading}</h3>
                <p>{ecosystem.brandsSub}</p>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
