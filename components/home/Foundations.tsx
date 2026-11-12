import { sheets } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import FoundationsStory from "./FoundationsStory";

export default function Foundations() {
  const { id, sheet } = sheets.pillars;
  return (
    <section className="sheet vellum arc fs-section" id={id} data-sheet={sheet}>
      <ArcBg />
      <FoundationsStory />
    </section>
  );
}
