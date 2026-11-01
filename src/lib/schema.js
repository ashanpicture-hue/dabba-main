// JSON-LD structured data for Dabba — Organization, LocalBusiness, FAQPage, and WebSite schemas.
// Inject these into the <head> of the relevant pages (server-rendered or via React Helmet equivalent).

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dabba",
  "url": "https://dabba.vercel.app",
  "logo": "https://dabba.vercel.app/favicon.svg",
  "description": "Preorder links for home bakers in Pakistan. One order link: menu with prices, daily limits, deposits, and WhatsApp updates.",
  "founder": {
    "@type": "Person",
    "name": "Dabba Team"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "PK"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["English", "Urdu"],
    "contactOption": "TollFree"
  },
  "sameAs": [
    "https://instagram.com/dabba"
  ]
};

export const localBusinessSchema = (shop) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": shop.name,
  "image": shop.image_url || "https://dabba.vercel.app/favicon.svg",
  "url": `https://dabba.vercel.app/s/${shop.slug}`,
  "telephone": shop.whatsapp,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": shop.city,
    "addressCountry": "PK"
  },
  "priceRange": "Rs",
  "servesArea": (shop.delivery_zones || []).map((z) => z.name),
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Menu",
    "itemOffered": (shop.items || []).map((item) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": item.name,
        "description": item.description,
        "price": `Rs ${item.price}`,
        "priceCurrency": "PKR"
      }
    }))
  }
});

export const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does Dabba take my money?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Customers pay you directly by bank, Raast or wallet. Dabba stores the screenshot so you can check it against your bank app."
      }
    },
    {
      "@type": "Question",
      "name": "Do my customers need an app or an account?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. They open your link in their phone browser, order in about a minute, and get a tracking link."
      }
    },
    {
      "@type": "Question",
      "name": "Can I still talk to customers on WhatsApp?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Every action opens WhatsApp with a ready-written message, and customers can message you from their order page."
      }
    },
    {
      "@type": "Question",
      "name": "What does it cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every feature is free during the pilot. After that, Starter stays free for up to 20 orders a month, Baker is Rs 1,499 a month and Bakery is Rs 3,499 a month. We give 30 days' notice before any charge."
      }
    },
    {
      "@type": "Question",
      "name": "Do you take a cut of my sales?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Customers pay you directly and Dabba charges only the monthly plan."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need a food licence?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rules for home kitchens vary by province. Dabba doesn't check licences. Ask your provincial food authority what applies to you."
      }
    }
  ]
};

export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Dabba",
  "url": "https://dabba.vercel.app",
  "description": "Preorder links for home bakers in Pakistan. One order link: menu with prices, daily limits, deposits, and WhatsApp updates.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://dabba.vercel.app/search?q={search_term}",
    "query-input": "required name=search_term"
  }
};

export const breadcrumbListSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
