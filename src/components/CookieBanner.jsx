import { Link } from "react-router-dom";
import { setConsent, closeCookieSettings, useConsent } from "../lib/consent.js";

/** One choice, two equal buttons. Nothing optional runs until the person accepts. */
export default function CookieBanner() {
  const { choice, open } = useConsent();
  if (!open) return null;
  return (
    <section className="cookie" role="dialog" aria-modal="false" aria-labelledby="cookie-h" aria-describedby="cookie-p">
      <h2 id="cookie-h">Cookies and analytics</h2>
      <p id="cookie-p">
        We count page visits with Vercel Analytics, anonymously, to see where people get stuck. No advertising trackers. <Link to="/privacy#cookies">What else is stored</Link>
      </p>
      <div className="row">
        <button type="button" className="btn" onClick={() => setConsent(false)}>Decline</button>
        <button type="button" className="btn primary" onClick={() => setConsent(true)}>Accept analytics</button>
      </div>
      {choice && <button type="button" className="cookie-x" onClick={closeCookieSettings}>Keep my current choice ({choice.analytics ? "accepted" : "declined"})</button>}
    </section>
  );
}
