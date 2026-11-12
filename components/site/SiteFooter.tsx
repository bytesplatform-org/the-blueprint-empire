import { contact, footer } from "@/lib/content/site";
import EyesWordmark from "./EyesWordmark";

/**
 * A dark panel inset in the ivory page, under a short centred line: three
 * small columns (who and where, how to work with us, links), then the
 * wordmark set huge and cropped at the bottom, with eyes.
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <p className="ftr-lead">
        {footer.lead.text}
        <br />
        {footer.lead.follow} <a href={footer.lead.href} target="_blank" rel="noopener">{footer.lead.handle}</a>
      </p>
      <div className="ftr-panel">
        <div className="ftr-cols">
          <div>
            <h4 className="mono">{footer.legal}</h4>
            {footer.info.map(line => <p key={line}>{line}</p>)}
          </div>
          <div>
            <h4 className="mono">{footer.work.title}</h4>
            <p>{footer.work.body}</p>
            <a className="ftr-mail" href={`mailto:${contact.email}`}>
              <span>{contact.email}</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
          <nav aria-label="Elsewhere">
            <h4 className="mono">{footer.hello}</h4>
            <a href="#contact">Contact</a>
            {footer.social.map(link => (
              <a href={link.href} target="_blank" rel="noopener" key={link.href}>{link.label}</a>
            ))}
            <a href={footer.back.href}>{footer.back.label}</a>
          </nav>
        </div>
        <EyesWordmark lines={footer.wordmark} label={footer.label} />
      </div>
    </footer>
  );
}
