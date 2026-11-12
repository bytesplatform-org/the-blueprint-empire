import { footer } from "@/lib/content/site";
import SignalWordmark from "./SignalWordmark";

export default function SiteFooter() {
  const [first, second] = footer.words;
  return (
    <footer className="site-footer" id="footer">
      <div className="wrap">
        <SignalWordmark>
          <div className="foot-big" aria-label={footer.label} role="img">
            <span className="fl">
              <span className="fw" data-atlas-word data-hollow={first.hollow ? "" : undefined}>{first.text}</span>{" "}
              <span className="fw" data-atlas-word data-hollow={second.hollow ? "" : undefined}>{second.text}</span>
              <span className="bl" data-baseline />
            </span>
          </div>
        </SignalWordmark>
        <div className="foot-row mono">
          <span>{footer.legal}</span>
          <nav aria-label="Social">
            {footer.social.map(link => (
              <a href={link.href} target="_blank" rel="noopener" key={link.href}>{link.label}</a>
            ))}
            <a href={footer.back.href}>{footer.back.label}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
