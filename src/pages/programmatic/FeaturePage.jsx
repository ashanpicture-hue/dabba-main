import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { setPageSEO } from "../../lib/seo.js";
import { organizationSchema, breadcrumbListSchema, faqPageSchema } from "../../lib/schema.js";
import Feedback from "../../components/Feedback.jsx";

const FEATURES = {
  "daily-slot-limit": {
    name: "Daily Slot Limit",
    keyword: "daily slot limit bakery",
    description: "Set how many orders you can bake per day. Full days close themselves automatically. Add extra slots for Eid and holidays.",
    intro: "Never overbook your oven again. Dabba's daily slot limit lets home bakers set exactly how many orders they can take per day, with days of notice and special days for Eid, Chand Raat, and holidays.",
    benefits: [
      "Set slots per day based on your oven capacity",
      "Full days close themselves automatically",
      "Add extra slots for Eid, Chand Raat and holidays",
      "Set days of notice so you're never caught off guard",
      "Weekly days off for rest days",
    ],
  },
  "custom-cake-quote": {
    name: "Custom Cake Quote",
    keyword: "custom cake quote tool",
    description: "Customers send occasion, servings, flavour and up to 3 inspiration photos. You send a price that holds for 24–72 hours.",
    intro: "Turn custom cake inquiries into booked orders. Customers share their idea, photos, occasion and servings. You send a price that holds for 24 to 72 hours. The date is booked only when they accept and pay.",
    benefits: [
      "Inspiration photos stay private to you",
      "Prices expire so dates don't sit on hold",
      "Quote holds for 24–72 hours",
      "Customer accepts and pays to book the date",
      "Clear note: similar to the photo, not a copy",
    ],
  },
  "advance-payment": {
    name: "Advance Payment",
    keyword: "advance payment cake orders",
    description: "Ask for 50% or full payment upfront. Customers pay by Raast, bank, Easypaisa or JazzCash and upload the screenshot.",
    intro: "Money first, then baking. Ask for a deposit or full payment upfront. Customers pay by Raast, bank, Easypaisa or JazzCash and upload the screenshot with their order. Dabba never touches the money.",
    benefits: [
      "No more no-shows on preorders",
      "Payment screenshot attached to each order",
      "One-tap 'payment received' or 'not found'",
      "Customers pay you directly — Dabba takes no commission",
      "Works with Raast, bank transfer, Easypaisa, JazzCash",
    ],
  },
  "whatsapp-replies": {
    name: "WhatsApp Replies",
    keyword: "WhatsApp message templates bakers",
    description: "Ready-written WhatsApp messages for order confirmations, reminders, out for delivery, and thank you.",
    intro: "Reply to customers in one tap. Every action opens WhatsApp with the message already written — order confirmation, payment reminder, out for delivery, thank you. Plus a tracking link in every confirmation.",
    benefits: [
      "Ready-written WhatsApp messages for every step",
      "Order confirmation with tracking link",
      "Payment reminder with one tap",
      "Out for delivery and thank you messages",
      "Customers can message you from their order page",
    ],
  },
  "baking-list": {
    name: "Baking List",
    keyword: "baking list generator",
    description: "The baking list adds up every order for the day, split by size and flavour. Know exactly what to bake each morning.",
    intro: "Know what to bake every morning. The baking list adds up every order for the day, split by size and flavour. Messages to pipe are listed per order, so nothing gets missed.",
    benefits: [
      "Daily totals by size and flavour",
      "Messages to pipe, listed per order",
      "See the full day's production at a glance",
      "Split by pickup and delivery",
      "Mark items as baked as you go",
    ],
  },
  "recipe-costing": {
    name: "Recipe Costing",
    keyword: "recipe costing calculator",
    description: "Turn today's ingredient prices into cost and profit per item. Know your margin at current prices.",
    intro: "Know what you earn on every item. The costing tool turns today's ingredient prices into cost and profit per item. See your margin at current prices and adjust your menu accordingly.",
    benefits: [
      "Cost and profit per item at today's prices",
      "Margin percentage on every menu item",
      "Update ingredient prices as they change",
      "See which items are most profitable",
      "Price your menu with confidence",
    ],
  },
};

const featureFaqs = [
  ["Do I need technical skills?", "No. Dabba works in any phone browser. No app to install, no code to write."],
  ["Can I try it free?", "Yes. Starter is free for up to 20 orders/month during and after the pilot."],
  ["Does Dabba take commission?", "No. Customers pay you directly. Dabba charges only the monthly plan."],
  ["Can I change my settings later?", "Yes. Edit your menu, slots, and prices anytime from the dashboard."],
];

export default function FeaturePage() {
  const { feature } = useParams();
  const f = FEATURES[feature];

  if (!f) {
    return (
      <div className="page-wrap" style={{ paddingBlock: 40 }}>
        <div className="wrap narrow">
          <Link to="/" className="logo">Dabba</Link>
          <h1>Feature not found</h1>
          <p>Check the link, or go back to the <Link to="/">Dabba home page</Link>.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    setPageSEO({
      title: `${f.name} · Dabba Preorders for Home Bakers`,
      description: f.description,
      canonical: `https://dabba.devs.surf/features/${feature}`,
      ogImage: "https://dabba.devs.surf/img/tart.webp",
    });
  }, [feature, f]);

  const breadcrumbs = [
    { name: "Home", url: "https://dabba.devs.surf/" },
    { name: "Features", url: "https://dabba.devs.surf/features" },
    { name: f.name, url: `https://dabba.devs.surf/features/${feature}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }} />

      <div className="page-wrap" style={{ paddingBlock: "40px 24px" }}>
        <div className="wrap narrow stack" style={{ gap: 24 }}>
          <Link to="/" className="logo">Dabba</Link>
          <nav style={{ marginBottom: 16 }}>
            <ol style={{ display: "flex", gap: 8, listStyle: "none", padding: 0, margin: 0, fontSize: 14, color: "#666" }}>
              {breadcrumbs.map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && <span style={{ margin: "0 6px", color: "#999" }}>/</span>}
                  <a href={b.url} style={{ color: "#7a1f3d", textDecoration: "none" }}>{b.name}</a>
                </li>
              ))}
            </ol>
          </nav>

          <h1 style={{ fontSize: "2rem", margin: "0 0 8px 0" }}>{f.name}</h1>
          <p className="muted" style={{ fontSize: "1.1rem", margin: "0 0 24px 0" }}>{f.intro}</p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>How it works</h2>
            <p style={{ lineHeight: 1.8, margin: "0 0 16px 0" }}>{f.description}</p>
            <ul style={{ margin: "0 0 0 20px", lineHeight: 1.8 }}>
              {f.benefits.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Start using {f.name}</h2>
            <p>Add {f.name.toLowerCase()} to your Dabba order link in minutes. No card needed. Start taking better orders today.</p>
            <Link to="/login" className="lp-btn solid" style={{ display: "inline-block", marginTop: 8 }}>Create your free order link</Link>
          </section>

          <section id="faq-feature" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Good to know</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {featureFaqs.map(([q, a]) => (
                <details key={q} style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: 12 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary>
                  <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#555" }}>{a}</p>
                </details>
              ))}
            </div>
          </section>

          <Feedback role="visitor" prompt={`Would ${f.name} help your bakery?`} />
        </div>
      </div>
    </>
  );
}