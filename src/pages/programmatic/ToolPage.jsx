import { useEffect, useState } from "react";
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
    calculator: true,
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

function CakePricingCalculator() {
  const [inputs, setInputs] = useState({
    flour: "0",
    sugar: "0",
    butter: "0",
    eggs: "0",
    other: "0",
    packaging: "0",
    delivery: "0",
    timeMinutes: "0",
    hourlyRate: "0",
    items: "1",
    sellingPrice: "0",
  });

  const n = (k) => parseFloat(inputs[k]) || 0;

  const ingredientCost = n("flour") + n("sugar") + n("butter") + n("eggs") + n("other");
  const laborCost = (n("timeMinutes") / 60) * n("hourlyRate");
  const totalCost = ingredientCost + n("packaging") + n("delivery") + laborCost;
  const costPerItem = totalCost / Math.max(n("items"), 1);
  const sellingPrice = n("sellingPrice");
  const profitPerItem = sellingPrice - costPerItem;
  const margin = sellingPrice > 0 ? (profitPerItem / sellingPrice) * 100 : 0;

  const update = (k, v) => setInputs({ ...inputs, [k]: v });

  const field = (label, key, placeholder) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 14, marginBottom: 4, color: "#333" }}>{label}</label>
      <input
        type="number"
        step="0.01"
        value={inputs[key]}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }}
      />
    </div>
  );

  return (
    <section style={{ marginBottom: 32, border: "1px solid #e5e5e5", borderRadius: 10, padding: 24, background: "#fafafa" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: 20 }}>Cake Pricing Calculator (PKR)</h2>
      <p style={{ marginBottom: 20, color: "#555", fontSize: 14 }}>
        Enter your costs below to see the true cost per cake, your profit, and your margin. Adjust the selling price until your margin works.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {field("Flour (per cake, Rs)", "flour", "0")}
        {field("Sugar (per cake, Rs)", "sugar", "0")}
        {field("Butter / oil (per cake, Rs)", "butter", "0")}
        {field("Eggs (per cake, Rs)", "eggs", "0")}
        {field("Other ingredients (Rs)", "other", "0")}
        {field("Packaging (per cake, Rs)", "packaging", "0")}
        {field("Delivery (per order, Rs)", "delivery", "0")}
        {field("Time spent (minutes)", "timeMinutes", "0")}
        {field("Your hourly rate (Rs/hr)", "hourlyRate", "0")}
        {field("Number of cakes", "items", "1")}
        {field("Selling price per cake (Rs)", "sellingPrice", "0")}
      </div>

      <div style={{ border: "2px solid #7a1f3d", borderRadius: 8, padding: 20, background: "#fff" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", color: "#7a1f3d" }}>Results</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, fontSize: 14 }}>
          <div><div style={{ color: "#666", fontSize: 12, textTransform: "uppercase" }}>Total ingredient cost</div><div style={{ fontWeight: 600 }}>{ingredientCost.toFixed(2)} Rs</div></div>
          <div><div style={{ color: "#666", fontSize: 12, textTransform: "uppercase" }}>Labour cost</div><div style={{ fontWeight: 600 }}>{laborCost.toFixed(2)} Rs</div></div>
          <div><div style={{ color: "#666", fontSize: 12, textTransform: "uppercase" }}>Total cost (all cakes)</div><div style={{ fontWeight: 600 }}>{totalCost.toFixed(2)} Rs</div></div>
          <div><div style={{ color: "#666", fontSize: 12, textTransform: "uppercase" }}>Cost per cake</div><div style={{ fontWeight: 600 }}>{costPerItem.toFixed(2)} Rs</div></div>
          <div><div style={{ color: "#666", fontSize: 12, textTransform: "uppercase" }}>Profit per cake</div><div style={{ fontWeight: 600, color: profitPerItem >= 0 ? "#1a7a1a" : "#b00020" }}>{profitPerItem.toFixed(2)} Rs</div></div>
          <div><div style={{ color: "#666", fontSize: 12, textTransform: "uppercase" }}>Profit margin</div><div style={{ fontWeight: 600, color: margin >= 30 ? "#1a7a1a" : margin >= 15 ? "#b8860b" : "#b00020" }}>{margin.toFixed(0)}%</div></div>
        </div>
        {sellingPrice > 0 && profitPerItem <= 0 && (
          <p style={{ marginTop: 12, color: "#b00020", fontSize: 14, fontWeight: 600 }}>
            ⚠️ At this price you lose money on every cake. Raise your selling price or lower your costs.
          </p>
        )}
        {sellingPrice > 0 && profitPerItem > 0 && margin < 30 && (
          <p style={{ marginTop: 12, color: "#b8860b", fontSize: 14, fontWeight: 600 }}>
            ⚠️ Your margin is below 30%. Consider raising prices or cutting costs.
          </p>
        )}
        {sellingPrice > 0 && margin >= 30 && (
          <p style={{ marginTop: 12, color: "#1a7a1a", fontSize: 14, fontWeight: 600 }}>
            ✅ Your margin looks healthy. This price is worth testing.
          </p>
        )}
      </div>
    </section>
  );
}

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

          {t.calculator && <CakePricingCalculator />}

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

          <section style={{ marginBottom: 32, border: "1px solid #e5e5e5", borderRadius: 10, padding: 24, background: "#fafafa" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: 12, color: "#7a1f3d" }}>Related guide</h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#444" }}>Learn how to start and run a home bakery in Pakistan — licences, pricing, equipment, and your first preorder link.</p>
            <Link to="/blog/starting-home-bakery-pakistan" style={{ color: "#7a1f3d", fontWeight: 600, textDecoration: "underline" }}>Read: Complete Guide to Starting a Home Bakery in Pakistan (2026)</Link>
          </section>

          <Feedback role="visitor" prompt={`Would ${t.name} help your bakery?`} />
        </div>
      </div>
    </>
  );
}