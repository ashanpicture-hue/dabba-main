import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { setPageSEO } from "../lib/seo.js";
import { organizationSchema, breadcrumbListSchema, faqPageSchema, howToSchema } from "../lib/schema.js";
import Feedback from "../components/Feedback.jsx";

const ARTICLES = {
  "starting-home-bakery-pakistan": {
    slug: "starting-home-bakery-pakistan",
    title: "Complete Guide: Starting a Home Bakery in Pakistan (2026)",
    description: "Everything you need to start a home bakery in Pakistan — licences by province, pricing, equipment, Instagram marketing, and your first preorder link. Plus a free cake pricing calculator.",
    datePublished: "2026-11-02",
    dateModified: "2026-11-02",
    author: { "@type": "Person", "name": "Dabba Team", "url": "https://dabba.devs.surf/" },
    image: "https://dabba.devs.surf/img/tart.webp",
    canonical: "https://dabba.devs.surf/blog/starting-home-bakery-pakistan",
    sections: [
      {
        id: "intro",
        heading: "Why start a home bakery in Pakistan right now",
        paragraphs: [
          "Home baking is one of the fastest-growing micro-businesses in Pakistan. From Karachi to Lahore, Faisalabad to Peshawar, bakers are turning Instagram followers into paying customers — one preorder link at a time.",
          "The barrier to entry is low: you need a kitchen, a few reliable recipes, and a way to take orders without spending all day replying to DMs. That's where Dabba comes in. This guide walks you through every step, from legal requirements to your first paying order.",
        ],
      },
      {
        id: "legal",
        heading: "Licences and legal requirements by province",
        paragraphs: [
          "Rules for home kitchens vary by province in Pakistan. Dabba doesn't check licences, but you should know what applies to you before you sell your first cake.",
          "<strong>Punjab:</strong> Contact the Punjab Food Authority (PFA) for home kitchen registration requirements. Lahore, Faisalabad, Rawalpindi, and Multan all fall under PFA jurisdiction.",
          "<strong>Sindh:</strong> The Sindh Food Authority regulates food businesses in Karachi, Hyderabad, and Sukkur. Check their requirements for home-based food operations.",
          "<strong>Khyber Pakhtunkhwa:</strong> The KP Food Safety and Halal Food Authority covers Peshawar and surrounding areas.",
          "<strong>Balochistan:</strong> Contact the Balochistan Food Authority for Quetta and other cities in the province.",
          "Many home bakers start as sole proprietors. You can register your business with your local union council or chamber of commerce as you grow. Start small, stay compliant, and scale up.",
        ],
      },
      {
        id: "equipment",
        heading: "Kitchen setup and equipment on a budget",
        paragraphs: [
          "You don't need a commercial kitchen to start. Most successful home bakers in Pakistan begin with equipment they already have, then reinvest profits as orders grow.",
          "<strong>Essential equipment:</strong> Oven (OTG or convection), mixer (hand or stand), weighing scale, measuring cups and spoons, baking tins and cake pans, cooling racks, spatulas, and piping bags.",
          "<strong>Packaging:</strong> Cake boxes, cake boards, ribbons, and inserts. Presentation matters — customers buy with their eyes first, especially on Instagram.",
          "<strong>Budget tip:</strong> Start with a basic OTG oven and a hand mixer. Upgrade to a stand mixer and larger oven once you're consistently getting 10+ orders per week.",
        ],
      },
      {
        id: "pricing",
        heading: "Price your cakes for profit",
        paragraphs: [
          "The most common mistake new bakers make is underpricing. If you only count flour and sugar, you're not accounting for your time, packaging, delivery, or electricity — and you'll burn out before you break even.",
          "Use the Dabba Cake Pricing Calculator to work out your true cost per cake. Enter ingredient costs, packaging, delivery, your time, and your hourly rate — then see your profit and margin per item.",
          "<strong>Aim for at least 30% margin.</strong> If your margin is below 15% after all costs, your price is too low or your costs are too high. Adjust until the numbers work.",
          "Remember: customers pay you directly by bank transfer, Raast, Easypaisa, or JazzCash. Dabba never takes a cut of your sales — only the monthly plan fee.",
        ],
        links: [
          { label: "Dabba Cake Pricing Calculator", to: "/tools/cake-pricing-calculator" },
        ],
      },
      {
        id: "menu",
        heading: "Build your first menu",
        paragraphs: [
          "Start small. A focused menu of 4–6 items is better than a long list you can't execute consistently.",
          "<strong>Popular items for Pakistani home bakers:</strong> Chocolate cake, vanilla cake, red velvet, fruit cake, cupcakes, brownies, cookies, and custom celebration cakes for Eid, birthdays, and weddings.",
          "Offer size options (small, medium, large) and flavour variations. Dabba's order page lets customers pick size and flavour, and the price adjusts automatically.",
          "Add photos of every item. Even phone photos with good lighting sell better than no photos at all.",
        ],
      },
      {
        id: "instagram",
        heading: "Get your first customers from Instagram",
        paragraphs: [
          "Most home bakers in Pakistan get their first orders through Instagram. The problem is that DMs are chaotic — orders get lost, details are missed, and you spend all day typing the same answers.",
          "Fix your bio: one link in your bio that goes to your Dabba order page. Customers see your menu with prices, pick a date, pay an advance, and you get a clean order list.",
          "Post consistently: share your bakes in Stories, use Highlights for your menu and prices, and post Reels of the decorating process. Behind-the-scenes content builds trust.",
          "Use WhatsApp: every Dabba action opens WhatsApp with a ready-written message, so you can confirm orders and share tracking links without typing from scratch.",
        ],
        links: [
          { label: "Dabba vs Instagram DMs", to: "/compare/instagram-dms" },
        ],
      },
      {
        id: "orders",
        heading: "Take your first preorder",
        steps: [
          "Create your free account and add your menu with photos and prices.",
          "Set your daily slot limit — how many cakes you can bake per day.",
          "Set days of notice (e.g., 2 days) so you have time to bake and deliver.",
          "Share your link in your Instagram bio, WhatsApp status, and Facebook.",
          "Customers pick a date, pay an advance by bank, Raast, or wallet, and upload the screenshot.",
          "You get an order list, a daily baking list, and one-tap WhatsApp messages for every order.",
        ],
        note: "Full days close themselves automatically. You never overbook.",
      },
      {
        id: "daily-operations",
        heading: "Daily operations that scale",
        paragraphs: [
          "As orders grow, you need systems, not just hard work.",
          "<strong>Daily baking list:</strong> Dabba generates your baking list each morning so you know exactly what to bake, in what quantities, and for which orders.",
          "<strong>Delivery areas:</strong> Define your delivery zones and charge accordingly. Customers outside your area can pick up instead.",
          "<strong>Custom cake quotes:</strong> For wedding cakes and celebration cakes, customers submit a custom request with photos and occasion. You send a price that holds for 24–72 hours. They accept and pay — only then is the date booked.",
          "<strong>Recipe costing:</strong> Use the Dabba Recipe Costing Calculator to track ingredient costs as prices change, so your margins stay healthy.",
        ],
        links: [
          { label: "Dabba Recipe Costing Calculator", to: "/tools/recipe-costing-calculator" },
        ],
      },
      {
        id: "faq",
        heading: "Frequently asked questions",
        faqs: [
          ["Do I need a food licence to bake from home?", "Rules vary by province. Contact your provincial food authority (PFA in Punjab, SFA in Sindh, KP Food Safety in KPK, Balochistan Food Authority in Balochistan) to find out what applies to your home kitchen."],
          ["How much can I earn from a home bakery?", "It depends on your volume and pricing. Many home bakers in Pakistan start with 5–10 orders per week and scale to 25+ as they build repeat customers. Use the pricing calculator to model your earnings."],
          ["Do customers need an app or account to order?", "No. They open your link in their phone browser, order in about a minute, and get a tracking link. No app, no account required."],
          ["Does Dabba take a commission on my sales?", "No. Customers pay you directly. Dabba charges only the monthly plan fee. Starter is free for up to 20 orders a month during the pilot."],
          ["Can I sell custom cakes?", "Yes. Customers submit a custom cake request with their idea, photos, and servings. You quote a price that holds for 24–72 hours, and the date is booked only after they accept and pay the advance."],
        ],
      },
    ],
  },
  "how-home-bakers-pakistan-preorders-instagram-dms": {
    slug: "how-home-bakers-pakistan-preorders-instagram-dms",
    title: "How Home Bakers in Pakistan Take Preorders Without Instagram DMs",
    description: "Home bakers across Pakistan are replacing chaotic Instagram DMs with one clean preorder link — menu, prices, slots, advance payments, and WhatsApp confirmations in one place. Read the full piece on Medium.",
    datePublished: "2026-11-02",
    dateModified: "2026-11-02",
    author: { "@type": "Person", "name": "Dabba Team", "url": "https://dabba.devs.surf/" },
    image: "https://dabba.devs.surf/img/tart.webp",
    canonical: "https://dabba.devs.surf/blog/how-home-bakers-pakistan-preorders-instagram-dms",
    sections: [
      {
        id: "intro",
        heading: "From DM chaos to one order link",
        paragraphs: [
          "Most home bakers in Pakistan start by taking orders through Instagram DMs. It works at first — until it doesn't. Messages get lost, cake details are missed, and you spend your whole day typing the same answers instead of baking.",
          "This article walks through how home bakers in Karachi, Lahore, Islamabad, and across Pakistan are switching to a single preorder link that collects the full order in one go: price, size, flavour, date, address, and advance payment.",
        ],
        links: [
          { label: "Read the full article on Medium", to: "https://medium.com/@ashanpicture/how-home-bakers-in-pakistan-can-take-preorders-without-instagram-dms-a7d6e9325f3d" },
        ],
      },
      {
        id: "what-changes",
        heading: "What changes when you switch to a preorder link",
        paragraphs: [
          "One link, not twenty DMs. Customers open your link in their phone browser, see your menu with prices, pick an open date, and place the order — no back-and-forth needed.",
          "Advance payments upfront. Customers pay by bank transfer, Raast, Easypaisa, or JazzCash and upload the screenshot. No more no-shows.",
          "Daily slot limits. Set how many orders you can bake per day. Full days close themselves automatically, so you never overbook.",
          "One-tap WhatsApp. Every action opens WhatsApp with a ready-written message — order confirmations, reminders, and thank-you notes without typing from scratch.",
        ],
      },
      {
        id: "faq",
        heading: "Frequently asked questions",
        faqs: [
          ["Do my customers need an app or account?", "No. They open your link in their phone browser, order in about a minute, and get a tracking link."],
          ["Does Dabba take a cut of my sales?", "No. Customers pay you directly. Dabba charges only the monthly plan fee."],
          ["Can I still use WhatsApp to talk to customers?", "Yes. Every action opens WhatsApp with a ready-written message, and customers can message you from their order page."],
        ],
      },
    ],
  },
};

export default function BlogArticle() {
  const { slug } = useParams();
  const article = ARTICLES[slug];

  if (!article) {
    return (
      <div className="page-wrap" style={{ paddingBlock: 40 }}>
        <div className="wrap narrow">
          <Link to="/" className="logo">Dabba</Link>
          <h1>Article not found</h1>
          <p>Check the link, or go back to the <Link to="/">Dabba home page</Link>.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    setPageSEO({
      title: `${article.title} · Dabba`,
      description: article.description,
      canonical: article.canonical,
      ogImage: article.image,
      ogType: "article",
    });
  }, [slug, article]);

  const breadcrumbs = [
    { name: "Home", url: "https://dabba.devs.surf/" },
    { name: "Blog", url: "https://dabba.devs.surf/blog" },
    { name: article.title, url: `https://dabba.devs.surf/blog/${slug}` },
  ];

  const articleSchemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": article.image,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "author": article.author,
    "publisher": {
      "@type": "Organization",
      "name": "Dabba",
      "url": "https://dabba.devs.surf/",
      "logo": { "@type": "ImageObject", "url": "https://dabba.devs.surf/favicon.svg" },
    },
    "description": article.description,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.canonical,
    },
  };

  const howToSteps = [
    { name: "Register your home kitchen", text: "Check your provincial food authority requirements and register your home bakery." },
    { name: "Set up your kitchen", text: "Get essential equipment — oven, mixer, scale, tins, and packaging." },
    { name: "Build your menu", text: "Start with 4–6 items, add photos and prices for each." },
    { name: "Create your order link", text: "Set up your Dabba order page with daily limits, days of notice, and delivery areas." },
    { name: "Share and take orders", text: "Post your link on Instagram and WhatsApp. Customers order, pay, and you bake." },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Dabba",
        "url": "https://dabba.devs.surf",
        "description": "Preorder links for home bakers in Pakistan. One order link: menu with prices, daily limits, deposits and WhatsApp updates.",
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchemaData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema({ name: "How to Start a Home Bakery in Pakistan", description: "Step-by-step guide to launching your home bakery", steps: howToSteps, totalTime: "P7D" })) }} />
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

          <article style={{ lineHeight: 1.7, color: "#222" }}>
            <h1 style={{ fontSize: "2.25rem", margin: "0 0 12px 0", lineHeight: 1.25 }}>{article.title}</h1>
            <p className="muted" style={{ fontSize: "1.1rem", margin: "0 0 24px 0" }}>{article.description}</p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 32, fontSize: 13, color: "#666" }}>
              <span>{new Date(article.datePublished).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</span>
              <span>·</span>
              <span>Home Bakery · Pakistan</span>
              <span>·</span>
              <span>12 min read</span>
            </div>

            <div style={{ borderLeft: "3px solid #7a1f3d", paddingLeft: 16, marginBottom: 32, fontStyle: "italic", color: "#444" }}>
              Want to skip the DM chaos?{" "}
              <Link to="/login" style={{ color: "#7a1f3d", fontWeight: 600, textDecoration: "underline" }}>Create your free preorder link</Link>
              and start taking orders today.
            </div>

            {article.sections.map((section) => (
              <section key={section.id} style={{ marginBottom: 32 }}>
                <h2 id={section.id} style={{ fontSize: "1.5rem", marginBottom: 12, color: "#7a1f3d" }}>{section.heading}</h2>
                {section.paragraphs.map((p, i) => (
                  <p key={i} style={{ margin: "0 0 16px 0" }} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
                {section.links && (
                  <div style={{ marginTop: 12 }}>
                    {section.links.map((l) => (
                      <Link key={l.label} to={l.to} style={{ color: "#7a1f3d", fontWeight: 600, textDecoration: "underline", marginRight: 16 }}>{l.label}</Link>
                    ))}
                  </div>
                )}
                {section.steps && (
                  <ol key="steps" style={{ margin: "0 0 0 20px", lineHeight: 1.8 }}>
                    {section.steps.map((s, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{s}</li>
                    ))}
                  </ol>
                )}
                {section.note && (
                  <p style={{ marginTop: 10, fontSize: 14, color: "#555", fontStyle: "italic" }}>{section.note}</p>
                )}
                {section.faqs && (
                  <div style={{ marginTop: 24 }}>
                    {section.faqs.map(([q, a]) => (
                      <details key={q} style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: 12, marginBottom: 8 }}>
                        <summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary>
                        <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#555" }}>{a}</p>
                      </details>
                    ))}
                  </div>
                )}
              </section>
            ))}

            <section style={{ marginBottom: 32, border: "1px solid #e5e5e5", borderRadius: 10, padding: 24, background: "#fafafa" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Start your home bakery today</h2>
              <p style={{ marginBottom: 16 }}>Set up your free preorder link in minutes. Menu with prices, daily limits, advance payments, and WhatsApp updates — all in one link.</p>
              <Link to="/login" className="lp-btn solid" style={{ display: "inline-block", marginRight: 12 }}>Create your free order link</Link>
              <Link to="/tools/cake-pricing-calculator" className="lp-btn ghost" style={{ display: "inline-block" }}>Try the cake pricing calculator</Link>
            </section>

            <section id="article-faq" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Good to know</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ARTICLES[slug].sections.find((s) => s.id === "faq")?.faqs.map(([q, a]) => (
                  <details key={q} style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: 12 }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary>
                    <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#555" }}>{a}</p>
                  </details>
                ))}
              </div>
            </section>

            <Feedback role="visitor" prompt={`Found this guide helpful? What else would you like to know about starting a home bakery in Pakistan?`} />
          </article>
        </div>
      </div>
    </>
  );
}