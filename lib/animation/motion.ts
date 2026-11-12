/**
 * Whether the page runs with motion. The before-paint script in app/layout
 * sets html.motion unless the reader prefers reduced motion; reading the class
 * (rather than re-querying the media) keeps every component in step with the
 * CSS that keys off it.
 */
export function motionAllowed() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("motion");
}
