import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { setPageSEO } from "../../lib/seo.js";
import { organizationSchema, breadcrumbListSchema, faqPageSchema } from "../../lib/schema.js";
import Feedback from "../../components/Feedback.jsx";

const TOOLS = {
  "cake-pricing-calculator": {
    name: "Cake Pricing Calculator",
    keyword: "cake pricing calculator Pakistan",
    description: "Price your cakes for profit. Enter ingredient costs, packaging, delivery, and your time to see cost, profit, and margin per item.",
    intro: "Stop guessing your cake prices. The Dabba Cake Pricing Calculator helps home bakers in Pakistan price for profit. Enter your ingredient costs, packaging, delivery, and time — see cost, profit, and margin per item instantly.",
    howTo: [
      "Enter your ingredient costs per item",
      "Add packaging and delivery costs",
      "Enter your time and hourly rate",
      "See cost, profit, and margin per item",
      "Adjust prices until your margin works",
    ],
  },
  "recipe-costing-calculator": {
    name: "Recipe Costing Calculator",
    keyword: "recipe costing calculator",
    description: "Calculate the cost of your recipes. See profit per item at today's ingredient prices.",
    intro: "Know your true recipe costs. Enter ingredients, quantities, and prices to see the cost per batch and per item. Track your margins as ingredient prices change.",
    howTo: [
      "Enter your recipe ingredients and quantities",
      "Add current ingredient prices",
      "Include packaging and utility costs",
      "See cost per batch and per item",
      "Track profit margin over time",
    ],
  },
};

const toolFaqs = [
  ["Is it free?", "Yes. These tools are free for all Dabba users during the pilot."],
  ["Do I need to install anything?", "No. Everything works in your phone or computer browser."],
  ["Does Dabba take commission?", "No. Customers pay you directly. Dabba charges only the monthly plan."],
  ["Can I use it for multiple bakeries?", "Yes. Each shop gets its own tools and settings."],
];

export default function ToolPage() {
  const { tool } = useParams();
  const t = TOOLS[tool];

  if (!t) {
    return (
      <div className="page-wrap" style={{ paddingBlock: 40 }}>
        <div className="wrap narrow">
          <Link to="/" className="logo">Dabba</Link>
          <h1>Tool not found</h1>
          <p>Check the link, or go back to the <Link to="/">Dabba home page</Link>.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    setPageSEO({
      title: `${t.name} · Dabba`,
      description: t.description,
      canonical: `https://dabba.devs.surf/tools/${tool}`,
      ogImage: "https://dabba.devs.surf/img/tart.webp",
    });
  }, [tool, t]);

  const breadcrumbs = [
    { name: "Home", url: "https://dabba.devs.surf/" },
    { name: "Tools", url: "https://dabba.devs.surf/tools" },
    { name: t.name, url: `https://dabba.devs.surf/tools/${tool}` },
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

          <h1 style={{ fontSize: "2rem", margin: "0 0 8px 0" }}>{t.name}</h1>
          <p className="muted" style={{ fontSize: "1.1rem", margin: "0 0 24px 0" }}>{t.intro}</p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>How to use it</h2>
            <ol style={{ margin: "0 0 0 20px", lineHeight: 1.8 }}>
              {t.howTo.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Start using {t.name}</h2>
            <p>Create your free Dabba order link and start using {t.name.toLowerCase()} today. No card needed.</p>
            <Link to="/login" className="lp-btn solid" style={{ display: "inline-block", marginTop: 8 }}>Create your free order link</Link>
          </section>

          <section id="faq-tool" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Good to know</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {toolFaqs.map(([q, a]) => (
                <details key={q} style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: 12 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary>
                  <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#555" }}>{a}</p>
                </details>
              ))}
            </div>
          </section>

          <Feedback role="visitor" prompt={`Would ${t.name} help your bakery?`} />
        </div>
      </div>
    </>
  );
}