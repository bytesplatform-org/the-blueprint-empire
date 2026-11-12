/**
 * Curved section top. Paints an ivory sheet whose top edge is a shallow arc,
 * --arc-depth tall. Its section (class "arc") overlaps the one before it by
 * that depth, so the black section shows beside the curve. First child of the
 * section; the section reserves the space with .arc padding.
 */
export default function ArcBg() {
  return (
    <div className="arc-bg" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100 Q50 -100 100 100 Z" />
      </svg>
    </div>
  );
}
