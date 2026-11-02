import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { setPageSEO } from "../../lib/seo.js";
import { organizationSchema, localBusinessSchema, breadcrumbListSchema, faqPageSchema } from "../../lib/schema.js";
import Feedback from "../../components/Feedback.jsx";

const CITIES = [
  { slug: "karachi", name: "Karachi", population: "~15M", region: "Sindh" },
  { slug: "lahore", name: "Lahore", population: "~13M", region: "Punjab" },
  { slug: "islamabad", name: "Islamabad", population: "~1.2M", region: "ICT" },
  { slug: "faisalabad", name: "Faisalabad", population: "~3.2M", region: "Punjab" },
  { slug: "rawalpindi", name: "Rawalpindi", population: "~2.1M", region: "Punjab" },
  { slug: "multan", name: "Multan", population: "~2M", region: "Punjab" },
  { slug: "peshawar", name: "Peshawar", population: "~2M", region: "KPK" },
  { slug: "quetta", name: "Quetta", population: "~1M", region: "Balochistan" },
];

const CITY_INTRO = {
  karachi: "Karachi's home bakers are turning Instagram followers into paid orders with Dabba preorder links. From Clifton to Defence, Gulshan to PECHS, bakers across the city are using one link to manage menus, daily slots, and advance payments.",
  lahore: "Lahore's home bakers are taking preorders online without the DM chaos. From Gulberg to DHA, Model Town to Johar Town, bakers across the city use Dabba to share one order link with prices, sizes, and delivery slots.",
  islamabad: "Islamabad's home bakers are streamlining preorders with Dabba. From F-6 to F-7, G-6 to G-7, Blue Area to Bahria Town, bakers across the capital use one link to manage orders, deposits, and WhatsApp confirmations.",
  faisalabad: "Faisalabad's home bakers are taking preorders online with Dabba. From Canal Road to Susan Road, bakers across the city use one order link to manage menus, daily limits, and advance payments.",
  rawalpindi: "Rawalpindi's home bakers are moving from DMs to order links with Dabba. From Saddar to Bahria Town, bakers across the twin cities use one link to manage preorders, deposits, and customer tracking.",
  multan: "Multan's home bakers are taking preorders online with Dabba. From Hussain Agahi to Bosan Road, bakers across the city use one order link to manage menus, daily slots, and advance payments.",
  peshawar: "Peshawar's home bakers are streamlining preorders with Dabba. From Hayatabad to University Town, bakers across the city use one link to manage orders, deposits, and WhatsApp confirmations.",
  quetta: "Quetta's home bakers are taking preorders online with Dabba. From Jinnah Road to Zarghun Road, bakers across the city use one order link to manage menus, daily limits, and customer orders.",
};

export default function CityPage() {
  const { city } = useParams();
  const cityData = CITIES.find((c) => c.slug === city);
  const intro = CITY_INTRO[city] || `Home bakers in ${city} are taking preorders online with Dabba preorder links.`;

  useEffect(() => {
    setPageSEO({
      title: `Home Bakery Preorder Link in ${cityData?.name || city} · Dabba`,
      description: `Order from home bakers in ${cityData?.name || city}, Pakistan. Menu with prices, sizes, flavours. Pickup or delivery. Pay by Raast, bank, Easypaisa, JazzCash.`,
      canonical: `https://dabba.devs.surf/bakeries/${city}`,
      ogImage: "https://dabba.devs.surf/img/tart.webp",
    });
  }, [city]);

  const breadcrumbs = [
    { name: "Home", url: "https://dabba.devs.surf/" },
    { name: "Bakeries", url: "https://dabba.devs.surf/bakeries" },
    { name: cityData?.name || city, url: `https://dabba.devs.surf/bakeries/${city}` },
  ];

  const shopSchema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": `Home Bakers in ${cityData?.name || city}`,
    "url": `https://dabba.devs.surf/bakeries/${city}`,
    "address": { "@type": "PostalAddress", "addressLocality": cityData?.name || city, "addressCountry": "PK" },
    "priceRange": "Rs",
    "areaServed": [cityData?.name || city],
    "description": intro,
  };

  const cityFaqs = [
    ["Does Dabba take my money?", "No. Customers pay you directly by bank, Raast or wallet."],
    ["Do my customers need an app?", "No. They open your link in their phone browser and order in about a minute."],
    ["Can I still use WhatsApp?", "Yes. Every action opens WhatsApp with a ready-written message."],
    ["What does it cost?", "Starter is free for up to 20 orders/month. Baker is Rs 1,499/month. Bakery is Rs 3,499/month."],
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(shopSchema)) }} />
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

          <h1 style={{ fontSize: "2rem", margin: "0 0 8px 0" }}>Home Bakery Preorder Link in {cityData?.name || city}</h1>
          <p className="muted" style={{ fontSize: "1.1rem", margin: "0 0 24px 0" }}>{intro}</p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Find home bakers in {cityData?.name || city}</h2>
            <p>Home bakers in {cityData?.name || city} use Dabba to take preorders online. Customers see the menu with prices, pick an open date, pay an advance by bank, Raast, or wallet, and upload a screenshot. The baker gets an order list, a daily baking list, and one-tap WhatsApp messages.</p>
            <ul style={{ margin: "16px 0 0 20px", lineHeight: 1.8 }}>
              <li>One preorder link for your Instagram bio</li>
              <li>Menu with photos, prices, sizes and flavours</li>
              <li>Daily slot limits and days of notice</li>
              <li>Advance payment by Raast, bank, Easypaisa, JazzCash</li>
              <li>Custom cake requests with quotes that expire</li>
              <li>Customer tracking page for every order</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Why home bakers in {cityData?.name || city} use Dabba</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16 }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>No more DM chaos</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#555" }}>One link collects the full order in one go — price, size, date, address, all at once.</p>
              </div>
              <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16 }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Advance payments</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#555" }}>Customers pay by Raast, bank, Easypaisa or JazzCash and upload the screenshot. No more no-shows.</p>
              </div>
              <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, padding: 16 }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Daily slot limits</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#555" }}>Set how many orders you can bake per day. Full days close themselves automatically.</p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Get started in {cityData?.name || city}</h2>
            <p>Create your free preorder link in minutes. No card needed. Start taking orders from customers across {cityData?.name || city} today.</p>
            <Link to="/login" className="lp-btn solid" style={{ display: "inline-block", marginTop: 8 }}>Create your free order link</Link>
          </section>

          <section id="faq-city" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Good to know</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cityFaqs.map(([q, a]) => (
                <details key={q} style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: 12 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary>
                  <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#555" }}>{a}</p>
                </details>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 32, border: "1px solid #e5e5e5", borderRadius: 10, padding: 24, background: "#fafafa" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: 12, color: "#7a1f3d" }}>Related resources</h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#444" }}>Learn how to price your cakes and start your home bakery in Pakistan.</p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#333" }}>
              <li style={{ marginBottom: 6 }}><Link to="/tools/cake-pricing-calculator" style={{ color: "#7a1f3d", fontWeight: 600, textDecoration: "underline" }}>Cake Pricing Calculator</Link> — price your cakes for profit</li>
              <li style={{ marginBottom: 6 }}><Link to="/blog/starting-home-bakery-pakistan" style={{ color: "#7a1f3d", fontWeight: 600, textDecoration: "underline" }}>Starting a Home Bakery in Pakistan (2026)</Link> — full guide</li>
            </ul>
          </section>

          <Feedback role="visitor" prompt={`Would a preorder link help your bakery in ${cityData?.name || city}?`} />
        </div>
      </div>
    </>
  );
}