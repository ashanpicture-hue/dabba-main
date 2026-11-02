import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { setPageSEO } from "../../lib/seo.js";
import { organizationSchema, breadcrumbListSchema, faqPageSchema } from "../../lib/schema.js";
import Feedback from "../../components/Feedback.jsx";

const COMPARISONS = {
  "instagram-dms": {
    competitor: "Instagram DMs",
    keyword: "Dabba vs Instagram DMs",
    description: "Dabba vs Instagram DMs for home bakery preorders. One order link vs message chaos.",
    intro: "Instagram DMs work for your first few orders. But at 10–15 orders a week, DMs break down. Dabba gives you one order link that collects the full order — price, size, date, address — in one go.",
    rows: [
      ["Menu and prices without asking", "No", "Yes"],
      ["Daily limits and special days", "No", "Yes"],
      ["Advance payment proof on the order", "No", "Yes"],
      ["Custom cake request, quote, accept", "Manual", "Yes"],
      ["Customer tracking page", "No", "Yes"],
      ["Baking list by size and flavour", "Manual", "Yes"],
      ["Ready-written WhatsApp replies", "No", "Yes"],
    ],
    verdict: "Dabba wins for bakers taking more than a few orders a week. Instagram DMs are fine for starting out, but Dabba scales with you.",
  },
  "whatsapp-business": {
    competitor: "WhatsApp Business",
    keyword: "Dabba vs WhatsApp Business",
    description: "Dabba vs WhatsApp Business for home bakery orders. Order link vs catalog messages.",
    intro: "WhatsApp Business is great for chatting, but it's not an order system. Dabba gives you one link with a menu, prices, slots, and advance payments — all in one place.",
    rows: [
      ["Menu and prices without asking", "Catalog only", "Yes"],
      ["Daily limits and special days", "No", "Yes"],
      ["Advance payment proof on the order", "No", "Yes"],
      ["Custom cake request, quote, accept", "Manual", "Yes"],
      ["Customer tracking page", "No", "Yes"],
      ["Baking list by size and flavour", "No", "Yes"],
      ["Ready-written WhatsApp replies", "No", "Yes"],
    ],
    verdict: "Use WhatsApp Business for conversations. Use Dabba for taking orders. They work together — Dabba links go in your WhatsApp status and bio.",
  },
  "google-forms": {
    competitor: "Google Forms",
    keyword: "Dabba vs Google Forms orders",
    description: "Dabba vs Google Forms for home bakery preorders. Order link vs form.",
    intro: "Google Forms can collect orders, but it's not built for bakeries. No daily slot limits, no advance payments, no WhatsApp integration, no customer tracking. Dabba is built specifically for home bakers.",
    rows: [
      ["Menu and prices without asking", "Yes", "Yes"],
      ["Daily limits and special days", "No", "Yes"],
      ["Advance payment proof on the order", "No", "Yes"],
      ["Custom cake request, quote, accept", "No", "Yes"],
      ["Customer tracking page", "No", "Yes"],
      ["Baking list by size and flavour", "No", "Yes"],
      ["Ready-written WhatsApp replies", "No", "Yes"],
    ],
    verdict: "Google Forms is free but not built for bakeries. Dabba has daily slots, advance payments, WhatsApp, and tracking — everything a home bakery needs.",
  },
  "indolj": {
    competitor: "Indolj",
    keyword: "Indolj alternatives home bakery Pakistan",
    description: "Dabba vs Indolj for home bakery preorders in Pakistan. Order link vs Indolj.",
    intro: "Indolj is a food delivery platform, but it's not built for home bakers who want their own preorder link. Dabba gives you one order link with your menu, prices, daily slots, and advance payments — no commission on your sales.",
    rows: [
      ["Your own preorder link", "No", "Yes"],
      ["Menu and prices without asking", "Partial", "Yes"],
      ["Daily limits and special days", "No", "Yes"],
      ["Advance payment proof on the order", "No", "Yes"],
      ["Custom cake request, quote, accept", "No", "Yes"],
      ["Customer tracking page", "No", "Yes"],
      ["Commission on orders", "Yes", "No"],
      ["Ready-written WhatsApp replies", "No", "Yes"],
    ],
    verdict: "Indolj is a marketplace that takes commission and controls the customer relationship. Dabba gives you your own order link, no commission, and you own the customer.",
  },
  "linktree": {
    competitor: "Linktree",
    keyword: "Linktree alternatives for bakers Pakistan",
    description: "Dabba vs Linktree for home bakers. Order link vs bio link.",
    intro: "Linktree is a bio link tool, not an order system. It has no menu, no prices, no daily slots, no advance payments. Dabba is built specifically for home bakers who want to take preorders, not just share links.",
    rows: [
      ["Menu and prices without asking", "No", "Yes"],
      ["Daily limits and special days", "No", "Yes"],
      ["Advance payment proof on the order", "No", "Yes"],
      ["Custom cake request, quote, accept", "No", "Yes"],
      ["Customer tracking page", "No", "Yes"],
      ["Commission on orders", "No", "No"],
      ["Ready-written WhatsApp replies", "No", "Yes"],
    ],
    verdict: "Linktree is fine for sharing links. Dabba is built for taking orders — with menus, prices, slots, payments, and tracking.",
  },
};

const compareFaqs = [
  ["Can I use both?", "Yes. Many bakers use Dabba for orders and WhatsApp/Instagram for conversations."],
  ["Does Dabba take commission?", "No. Customers pay you directly. Dabba charges only the monthly plan."],
  ["Can I try it free?", "Yes. Starter is free for up to 20 orders/month."],
  ["Do customers need an app?", "No. They open your link in their phone browser."],
];

export default function ComparisonPage() {
  const { competitor } = useParams();
  const c = COMPARISONS[competitor];

  if (!c) {
    return (
      <div className="page-wrap" style={{ paddingBlock: 40 }}>
        <div className="wrap narrow">
          <Link to="/" className="logo">Dabba</Link>
          <h1>Comparison not found</h1>
          <p>Check the link, or go back to the <Link to="/">Dabba home page</Link>.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    setPageSEO({
      title: `Dabba vs ${c.competitor} · Home Bakery Preorders`,
      description: c.description,
      canonical: `https://dabba.devs.surf/compare/${competitor}`,
      ogImage: "https://dabba.devs.surf/img/tart.webp",
    });
  }, [competitor, c]);

  const breadcrumbs = [
    { name: "Home", url: "https://dabba.devs.surf/" },
    { name: "Comparisons", url: "https://dabba.devs.surf/compare" },
    { name: `Dabba vs ${c.competitor}`, url: `https://dabba.devs.surf/compare/${competitor}` },
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

          <h1 style={{ fontSize: "2rem", margin: "0 0 8px 0" }}>Dabba vs {c.competitor}</h1>
          <p className="muted" style={{ fontSize: "1.1rem", margin: "0 0 24px 0" }}>{c.intro}</p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Feature comparison</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #7a1f3d" }}>
                  <th style={{ padding: "8px 4px", textAlign: "left" }}>Feature</th>
                  <th style={{ padding: "8px 4px", textAlign: "left", color: "#999" }}>{c.competitor}</th>
                  <th style={{ padding: "8px 4px", textAlign: "left", color: "#7a1f3d" }}>Dabba</th>
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e5e5e5" }}>
                    <td style={{ padding: "8px 4px", fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: "8px 4px", color: "#666" }}>{row[1]}</td>
                    <td style={{ padding: "8px 4px", color: "#7a1f3d", fontWeight: 600 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>The verdict</h2>
            <p style={{ lineHeight: 1.8 }}>{c.verdict}</p>
            <Link to="/login" className="lp-btn solid" style={{ display: "inline-block", marginTop: 16 }}>Create your free order link</Link>
          </section>

          <section id="faq-compare" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Good to know</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {compareFaqs.map(([q, a]) => (
                <details key={q} style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: 12 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary>
                  <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#555" }}>{a}</p>
                </details>
              ))}
            </div>
          </section>

          <Feedback role="visitor" prompt={`Would switching from ${c.competitor} to Dabba help your bakery?`} />
        </div>
      </div>
    </>
  );
}