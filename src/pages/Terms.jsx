import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "./Landing.jsx";
import Feedback from "../components/Feedback.jsx";
import { setPageSEO } from "../lib/seo.js";

/**
 * Dabba Terms of Service.
 *
 * Drafted from the code audit at specs/legal/audit-2026-11-02.md.
 * Every claim is supported by source code; nothing is inferred beyond what the code shows.
 *
 * ATTORNEY REVIEW: None. No lawyer has read or approved this document.
 * This is a draft for attorney review, not legal advice.
 */
export default function Terms() {
  useEffect(() => {
    setPageSEO({
      title: "Terms of Service · Dabba Preorders for Home Bakers",
      description: "Terms of service for Dabba preorder platform. Covers baker accounts, customer orders, payments, user content, prohibited uses, warranties, liability, and governing law (Pakistan).",
      canonical: "https://dabba.devs.surf/terms",
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
          <h1 style={{ marginBottom: 6 }}>Terms of Service</h1>
          <p className="muted" style={{ margin: 0 }}>Last updated: 2 November 2026. Dabba is in demo mode; these terms will be updated as the service changes.</p>
        </div>

        {/* Key changes block */}
        <section className="card stack" style={{ gap: 8 }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Key changes in this update</h3>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>First version of Terms of Service for Dabba - no terms page existed before.</li>
            <li>Drafted to match what the code actually does.</li>

            <li>No attorney review has been performed.</li>
          </ul>
        </section>

        {/* Important notice */}
        <section className="card stack" style={{ gap: 8 }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Important notice</h3>
          <p className="muted" style={{ margin: 0 }}>
            These terms of service are a draft written by the developer. <b>No lawyer has reviewed or approved them.</b>
            Dabba is operated by an independent developer based in Pakistan. There is no company, no company email,
            and no physical postal address yet. Do not rely on this document until a qualified lawyer has reviewed it.
          </p>
        </section>

        <S h="1. Acceptance of terms">
          <p className="muted" style={{ margin: 0 }}>
            By accessing or using Dabba (<a href="https://dabba.devs.surf" target="_blank" rel="noreferrer">dabba.devs.surf</a>), you agree to these Terms of Service.
            If you do not agree, do not use the service.
          </p>
        </S>

        <S h="2. About Dabba">
          <p className="muted" style={{ margin: 0 }}>
            Dabba is a preorder platform for home bakers in Pakistan. Bakers share one link in their Instagram bio.
            Customers see the menu with prices, book an open date, pay an advance by bank, Raast, or wallet,
            and upload a screenshot. The baker gets an order list, a daily baking list, and one-tap WhatsApp messages.
          </p>
          <p className="muted" style={{ margin: 0 }}>
            <b>Operator:</b> an independent developer based in Pakistan. Not yet established as a company.
          </p>
        </S>

        <S h="3. Baker accounts">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Bakers sign in with an email address via a one-time sign-in link. No password is used.</li>
            <li>Bakers are responsible for their shop content: menu items, prices, photos, descriptions, payment details, and shop settings.</li>
            <li>Bakers must keep their email secure. Dabba is not responsible for unauthorized access to a baker's account.</li>
            <li>Bakers can close their shop at any time from the dashboard.</li>
          </ul>
        </S>

        <S h="4. Customer orders">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Customers place orders directly with a bakery. The contract for the cake is between the customer and the baker, not Dabba.</li>
            <li>Customers provide their name, WhatsApp number, and (for delivery) an address. Custom cake requests may include occasion, servings, flavour, design details, and up to 3 inspiration photos.</li>
            <li>Customers pay the baker directly by bank, Raast, or wallet. Dabba never receives, holds, or moves money, and never asks for card numbers.</li>
            <li>Payment screenshots are uploaded so the baker can verify payment. Dabba stores the screenshot but does not verify the payment itself.</li>
            <li>Order tracking pages show the customer's first name, items, and status - never their phone number or address to other customers.</li>
          </ul>
        </S>

        <S h="5. Payments and pricing">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li><b>Dabba does not handle payments.</b> Customers pay bakers directly by bank, Raast, or wallet.</li>
            <li><b>Dabba charges no commission on orders.</b> Revenue comes only from monthly subscription plans (when paid plans begin after the pilot).</li>
            <li>During the pilot, all features are free. After the pilot, plans are: Starter (free, up to 20 orders/month), Baker (Rs 1,499/month), Bakery (Rs 3,499/month).</li>
            <li>Dabba will give 30 days' notice before any charge begins.</li>
            <li>No card is needed to start. Bakers can cancel any time.</li>
            <li>Prices exclude tax.</li>
          </ul>
        </S>

        <S h="6. User content and license">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Bakers retain ownership of their menu items, photos, and shop content.</li>
            <li>By uploading content to Dabba, bakers grant Dabba a license to store, display, and operate the service using that content.</li>
            <li>Customers retain ownership of their custom cake photos and request details.</li>
            <li>Dabba does not use customer or baker content to train AI models.</li>
          </ul>
        </S>

        <S h="7. Prohibited uses">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Do not use Dabba for fraudulent orders or payments.</li>
            <li>Do not upload illegal, infringing, or harmful content.</li>
            <li>Do not attempt to access other users' accounts or data.</li>
            <li>Do not use automated means to scrape or harvest data from the service.</li>
          </ul>
          <p className="muted" style={{ margin: "8px 0 0 0" }}>
            Dabba may suspend or terminate accounts that violate these terms.
          </p>
        </S>

        <S h="8. Disclaimer of warranties">
          <p className="muted" style={{ margin: 0 }}>
            Dabba is provided "as is" and "as available," without warranties of any kind, express or implied.
            Dabba does not guarantee that bakers will fulfill orders, that prices are accurate, or that the service will be error-free or uninterrupted.
          </p>
        </S>

        <S h="9. Limitation of liability">
          <p className="muted" style={{ margin: 0 }}>
            To the fullest extent permitted by law, Dabba is not liable for indirect, incidental, or consequential damages arising from your use of the service,
            including disputes between customers and bakers over orders, payments, or refunds.
          </p>
        </S>

        <S h="10. Termination">
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>Bakers can close their shop at any time from the dashboard.</li>
            <li>Dabba may suspend or terminate accounts that violate these terms or applicable law.</li>
            <li>Upon termination, access to the service and associated data ends.</li>
          </ul>
        </S>

        <S h="11. Governing law">
          <p className="muted" style={{ margin: 0 }}>
            These terms are governed by the laws of Pakistan, without regard to conflict-of-law principles.
            Disputes will be resolved in the courts of Pakistan.
          </p>
        </S>

        <S h="12. Changes to these terms">
          <p className="muted" style={{ margin: 0 }}>
            We may update these terms as the service changes. The "Last updated" date at the top reflects the most recent revision.
            Continued use of the service after changes are posted constitutes acceptance of the new terms.
          </p>
        </S>

        <S h="13. Contact us">
          <p className="muted" style={{ margin: 0 }}>
            <b>Feedback:</b> Use the Feedback button on any page.
          </p>
        </S>

        <S h="14. Attorney review status">
          <p className="muted" style={{ margin: 0 }}>
            <b>No lawyer has reviewed or approved these terms of service.</b> They were drafted by the developer from the codebase
            and have not been vetted by legal counsel. Do not rely on this document for legal compliance until a qualified lawyer
            in your jurisdiction has reviewed it.
          </p>
        </S>

        <Feedback role="visitor" prompt="Questions about these terms?" />
      </div>
      <SiteFooter />
    </>
  );
}
