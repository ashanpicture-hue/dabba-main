import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "./Landing.jsx";
import Feedback from "../components/Feedback.jsx";
import { openCookieSettings, useConsent } from "../lib/consent.js";
import { setPageSEO } from "../lib/seo.js";

/**
 * Dabba Privacy Policy.
 *
 * Drafted from the code audit at specs/legal/audit-2026-11-02.md.
 * Every claim is supported by source code; nothing is inferred beyond what the code shows.
 *
 * ATTORNEY REVIEW: None. No lawyer has read or approved this document.
 * This is a draft for attorney review, not legal advice.
 */
export default function Privacy() {
  const { choice } = useConsent();
  useEffect(() => {
    setPageSEO({
      title: "Privacy Policy · Dabba Preorders for Home Bakers",
      description: "How Dabba collects, uses, and protects your data. Covers baker accounts, customer orders, payment screenshots, analytics consent, and your rights.",
      canonical: "https://dabba.devs.surf/privacy",
      ogImage: "https://dabba.devs.surf/img/tart.webp",
    });
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, []);
  const S = ({ h, id, children }) => <section id={id} className="stack" style={{ gap: 6, scrollMarginTop: 24 }}><h2 style={{ fontSize: "1.35rem", margin: 0 }}>{h}</h2>{children}</section>;
  return (
    <>
      <div className="wrap narrow stack" style={{ paddingBlock: "28px 56px", gap: 22 }}>
        <Link to="/" className="logo">Dabba</Link>
        <div>
          <h1 style={{ marginBottom: 6 }}>Privacy Policy</h1>
          <p className="muted" style={{ margin: 0 }}>Last updated: 2 November 2026. Dabba is in demo mode; this policy will be updated as the service changes.</p>
        </div>

        {/* Key changes block */}
        <section className="card stack" style={{ gap: 8 }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Key changes in this update</h3>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Rewritten to match what the code actually does.</li>
            <li>Adds controller identification, contact details, subprocessors, retention, and user-rights sections.</li>

            <li>No attorney review has been performed.</li>
          </ul>
        </section>

        {/* Important notice */}
        <section className="card stack" style={{ gap: 8 }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Important notice</h3>
          <p className="muted" style={{ margin: 0 }}>
            This privacy policy is a draft written by the developer. <b>No lawyer has reviewed or approved it.</b>
            Dabba is operated by an independent developer based in Pakistan. There is no company, no company email,
            and no physical postal address yet. Do not rely on this document until a qualified lawyer has reviewed it.
          </p>
        </section>

        <S h="1. Who we are">
          <p className="muted" style={{ margin: 0 }}>
            Dabba (<a href="https://dabba.devs.surf" target="_blank" rel="noreferrer">dabba.devs.surf</a>) is operated by an independent developer based in Pakistan.
          </p>
          <p className="muted" style={{ margin: 0 }}>
            <b>Controller:</b> not yet established as a company.
          </p>
        </S>

        <S h="2. What information we collect">
          <p className="muted" style={{ margin: 0 }}>We collect different information depending on whether you are a baker, a customer, or a visitor.</p>

          <h4 style={{ margin: "12px 0 4px 0", fontSize: "1rem" }}>Bakers (shop owners)</h4>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Email address - used for sign-in via a one-time sign-in link (no password).</li>
            <li>Bakery name, slug, tagline, Instagram handle, WhatsApp number, city.</li>
            <li>Payment details you choose to display (bank, Raast, or wallet information) - shown to customers so they can pay you directly.</li>
            <li>Pickup address (optional).</li>
            <li>Shop settings: capacity, lead days, closed days, delivery zones, deposit percentage.</li>
          </ul>

          <h4 style={{ margin: "12px 0 4px 0", fontSize: "1rem" }}>Customers (ordering from a bakery)</h4>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Name and WhatsApp phone number.</li>
            <li>Delivery address (only if you choose delivery instead of pickup).</li>
            <li>Order details: items, quantities, date, fulfilment type, notes.</li>
            <li>Payment screenshot (image) - uploaded so the baker can verify your bank/Raast/wallet payment. Dabba never sees card numbers and never handles money.</li>
            <li>Custom cake requests: occasion, servings, flavour, design details, and up to 3 inspiration photos.</li>
          </ul>

          <h4 style={{ margin: "12px 0 4px 0", fontSize: "1rem" }}>Feedback (anyone)</h4>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Rating (1–5 stars) and a text message.</li>
            <li>Optional contact details (WhatsApp or email) if you want a reply.</li>
            <li>Which page you were on when you sent feedback.</li>
          </ul>

          <h4 style={{ margin: "12px 0 4px 0", fontSize: "1rem" }}>Analytics (visitors, only with your consent)</h4>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Anonymous page visits and interactions - only if you accept analytics in the cookie banner.</li>
            <li>No names, phone numbers, or addresses are sent to analytics.</li>
            <li>IP addresses are anonymized.</li>
            <li>Providers: Vercel Analytics and Google Analytics 4 (GA4).</li>
          </ul>

          <h4 style={{ margin: "12px 0 4px 0", fontSize: "1rem" }}>Address checks</h4>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>When you enter a delivery address, the address text alone is sent to Geoapify's geocoding service to check whether it matches a real place.</li>
            <li>Your name and phone number are <b>not</b> sent.</li>
          </ul>
        </S>

        <S h="3. How we use your information">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li><b>To run your shop and orders:</b> store your shop profile, menu, orders, and payment screenshots so you and your customers can track preorders.</li>
            <li><b>To let customers pay you:</b> display your payment details (bank, Raast, wallet) so customers can pay you directly. Dabba never receives, holds, or moves money.</li>
            <li><b>To contact you:</b> send sign-in links to bakers; optionally reply to feedback if you leave contact details.</li>
            <li><b>Analytics (with your consent):</b> count anonymous page visits to understand where people get stuck. Nothing is sent if you decline.</li>
            <li><b>Security and fraud prevention:</b> validate prices, dates, and capacity on the server before confirming orders.</li>
          </ul>
        </S>

        <S h="4. Who can see your information">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li><b>Your bakery:</b> order details, payment screenshots, and custom cake photos are visible only to the bakery you ordered from.</li>
            <li><b>Dabba (the developer):</b> can access all data to operate, secure, and improve the service.</li>
            <li><b>Other customers:</b> cannot see your personal data. Order tracking pages show only your first name, items, and status - never your phone number or address.</li>
            <li><b>We do not sell personal data.</b> This is an aspirational statement consistent with the code; no data-selling feature exists in the codebase.</li>
          </ul>
        </S>

        <S h="5. Third-party services we use (subprocessors)">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", marginTop: 8 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th scope="col" style={{ borderBottom: "1px solid var(--line)", padding: "6px 8px" }}>Service</th>
                <th scope="col" style={{ borderBottom: "1px solid var(--line)", padding: "6px 8px" }}>Purpose</th>
                <th scope="col" style={{ borderBottom: "1px solid var(--line)", padding: "6px 8px" }}>Data shared</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}><b>Supabase</b></td>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}>Database, user sign-in, file storage</td>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}>Baker emails, shop profiles, orders, feedback, uploaded files</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}><b>Vercel</b></td>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}>Website hosting and edge network</td>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}>Page visits (and analytics events if you accept)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}><b>Google (GA4)</b></td>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}>Anonymous analytics</td>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}>Page views, custom events (IP anonymized, only with consent)</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}><b>Geoapify</b></td>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}>Address verification</td>
                <td style={{ padding: "6px 8px", fontSize: "0.875rem" }}>Address text only (name and phone not sent)</td>
              </tr>
            </tbody>
          </table>
          <p className="muted" style={{ margin: "8px 0 0 0", fontSize: "0.875rem" }}>
            No Data Processing Agreements (DPAs) are currently in place with these providers. This is a gap to close before charging customers.
          </p>
        </S>

        <S h="6. Where your data is stored">
          <p className="muted" style={{ margin: 0 }}>
            The website runs on Vercel. Order data, files, and sign-in run on Supabase. Both may store data outside Pakistan.
            The exact country depends on the region chosen when the Supabase project is created and on Vercel's infrastructure.
            Google (GA4) is based in the US.
          </p>
          <p className="muted" style={{ margin: "8px 0 0 0" }}>
            No Standard Contractual Clauses or other transfer mechanism are currently in place. This is a gap to close if you have EU or UK users.
          </p>
        </S>

        <S h="7. How long we keep your information">
          <p className="muted" style={{ margin: 0 }}>
            The code does not implement fixed retention periods or automatic deletion. We keep your information while your account or shop is active.
          </p>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Baker shops and orders: kept while the shop is active. You can close your shop at any time from the dashboard.</li>
            <li>Customer orders: kept as part of the bakery's order record. Ask the bakery to correct or delete your order.</li>
            <li>Feedback: kept to help us decide what to build next.</li>
            <li>Analytics consent: stored for 1 year, then you are asked again.</li>
            <li>Demo-mode data: kept in your browser only; clearing localStorage removes it.</li>
          </ul>
          <p className="muted" style={{ margin: "8px 0 0 0" }}>
            <b>No specific retention period can be promised</b> because the code does not enforce one. This is a gap to close before launch.
          </p>
        </S>

        <S h="8. Your rights and choices">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li><b>Access:</b> Ask the bakery for a copy of your order details, or use the Feedback button to ask us about your data.</li>
            <li><b>Correction:</b> Ask the bakery to correct your order details, or update your shop profile from the dashboard.</li>
            <li><b>Deletion:</b> Ask the bakery to delete your order, or use the Feedback button to ask us to delete your data. Bakers can delete menu items and close their shop at any time.</li>
            <li><b>Analytics:</b> Accept or decline analytics in the cookie banner. Change your choice anytime using the "Change cookie choice" button on this page.</li>
            <li><b>No self-service export or deletion:</b> There is no automated download-my-data or delete-my-account feature. Requests are handled manually by contacting us.</li>
          </ul>
          <p className="muted" style={{ margin: "8px 0 0 0" }}>
            Or use the Feedback button on any page.
          </p>
        </S>

        <S h="9. Cookies and analytics" id="cookies">
          <p className="muted" style={{ margin: 0 }}>
            We count anonymous page visits with Vercel Analytics and Google Analytics 4 (GA4). Nothing is sent until you accept analytics in the cookie banner.
            If you decline, we count nothing. IP addresses are anonymized. No names, phone numbers, or addresses are sent to analytics.
          </p>
          <div className="row" style={{ gap: 12 }}>
            <button type="button" className="btn sm" onClick={openCookieSettings}>Change cookie choice</button>
            <span className="small muted">{choice ? `Currently ${choice.analytics ? "accepted" : "declined"}` : "No choice made yet"}</span>
          </div>
        </S>

        <S h="10. Children's data">
          <p className="muted" style={{ margin: 0 }}>
            Dabba is not directed at children. The service is for home bakers and their customers. Users should be at least 13 years old;
            bakers who accept payments should be 18 or older. We do not knowingly collect personal data from children under 13.
          </p>
        </S>

        <S h="11. Security">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Order data and sign-in run on Supabase with row-level security, so bakers can only see their own shops and orders.</li>
            <li>Payment screenshots and custom cake photos are stored in a private storage bucket with signed URLs that expire after 10 minutes.</li>
            <li>Dabba never receives, holds, or moves money, and never asks for card numbers.</li>
            <li>Prices, dates, and capacity are re-validated on the server before orders are confirmed.</li>
          </ul>
          <p className="muted" style={{ margin: "8px 0 0 0" }}>
            <b>No admin access log or security-monitoring process is currently implemented.</b> This is a gap to close before launch.
          </p>
        </S>

        <S h="12. Changes to this policy">
          <p className="muted" style={{ margin: 0 }}>
            We may update this policy as the service changes. The "Last updated" date at the top reflects the most recent revision.
            Check this page periodically for changes.
          </p>
        </S>

        <S h="13. Contact us">
          <p className="muted" style={{ margin: 0 }}>
            <b>Feedback:</b> Use the Feedback button on any page.
          </p>
          <p className="muted" style={{ margin: "8px 0 0 0" }}>
            Pakistan does not currently have a comprehensive data protection law in force. If you are in the EU or UK and believe your
            data protection rights have been affected, you may contact your local supervisory authority (for example, the ICO in the UK
            or your national data protection authority in the EU).
          </p>
        </S>

        <S h="14. Attorney review status">
          <p className="muted" style={{ margin: 0 }}>
            <b>No lawyer has reviewed or approved this privacy policy.</b> It was drafted by the developer from the codebase
            and has not been vetted by legal counsel. Do not rely on this document for legal compliance until a qualified lawyer
            in your jurisdiction has reviewed it.
          </p>
        </S>

        <Feedback role="visitor" prompt="Questions about your data?" />
      </div>
      <SiteFooter />
    </>
  );
}
