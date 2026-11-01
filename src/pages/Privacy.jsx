import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "./Landing.jsx";
import Feedback from "../components/Feedback.jsx";
import { openCookieSettings, useConsent } from "../lib/consent.js";

/** Plain-language privacy summary. Not legal advice; to be reviewed before charging customers. */
export default function Privacy() {
  const { choice } = useConsent();
  useEffect(() => {
    document.title = "Privacy · Dabba";
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, []);
  const S = ({ h, id, children }) => <section id={id} className="stack" style={{ gap: 6, scrollMarginTop: 24 }}><h2 style={{ fontSize: "1.35rem", margin: 0 }}>{h}</h2>{children}</section>;
  return (
    <>
      <div className="wrap narrow stack" style={{ paddingBlock: "28px 56px", gap: 22 }}>
        <Link to="/" className="logo">Dabba</Link>
        <div>
          <h1 style={{ marginBottom: 6 }}>Privacy</h1>
          <p className="muted" style={{ margin: 0 }}>Last updated 1 November 2026. Dabba is in early testing; this page will be updated as the service changes.</p>
        </div>
        <S h="What we collect">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li><b>Bakers:</b> email for sign-in, bakery name, WhatsApp number, menu, prices, payment details you choose to show, and settings.</li>
            <li><b>Customers:</b> name, WhatsApp number, delivery address if needed, order details, payment screenshots and custom cake photos you upload.</li>
            <li><b>Feedback:</b> anything you write in the feedback form, and contact details only if you add them.</li>
            <li><b>Usage:</b> anonymous page visit counts through Vercel Analytics, only if you accept analytics in the cookie banner. No advertising trackers.</li>
            <li><b>Addresses:</b> when you enter a delivery address it is checked against a map service. See "Address checks" below.</li>
          </ul>
        </S>
        <S h="Who can see it">
          <p className="muted" style={{ margin: 0 }}>Order details, payment screenshots and inspiration photos are visible only to the bakery you ordered from. Order tracking pages show your first name, the items and the order status, never your phone number or address. We don't sell personal data.</p>
        </S>
        <S h="Cookies and local storage" id="cookies">
          <p className="muted" style={{ margin: 0 }}>Analytics is off until you accept it. If you decline, we count nothing. Separately, the site keeps what it needs to work in your browser: your sign-in session if you are a baker, your cookie choice, and in demo mode the sample data you enter. These are not used for tracking.</p>
          <div className="row" style={{ gap: 12 }}>
            <button type="button" className="btn sm" onClick={openCookieSettings}>Change cookie choice</button>
            <span className="small muted">{choice ? `Currently ${choice.analytics ? "accepted" : "declined"}` : "No choice made yet"}</span>
          </div>
        </S>
        <S h="Address checks">
          <p className="muted" style={{ margin: 0 }}>When you type a delivery address, the address text alone is sent to OpenStreetMap's Nominatim search service to see whether it matches a real place in the baker's city. Your name and phone number are not sent. OpenStreetMap handles requests under its own privacy policy. The result is only a hint; you can place the order either way.</p>
        </S>
        <S h="Money">
          <p className="muted" style={{ margin: 0 }}>Customers pay bakers directly by bank, Raast or wallet. Dabba never receives, holds or moves money, and never asks for card numbers.</p>
        </S>
        <S h="Where data is stored">
          <p className="muted" style={{ margin: 0 }}>The website runs on Vercel. Order data, files and sign-in run on Supabase. Both may store data outside Pakistan.</p>
        </S>
        <S h="Your choices">
          <p className="muted" style={{ margin: 0 }}>Ask the bakery to correct or delete your order, or use the feedback button to ask us to delete your data. Bakers can delete menu items and close their shop at any time.</p>
        </S>
      </div>
      <SiteFooter />
      <Feedback role="visitor" prompt="Questions about your data?" />
    </>
  );
}
