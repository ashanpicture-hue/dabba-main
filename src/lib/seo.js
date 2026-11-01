// SEO utilities for dynamic meta tags and canonical URLs
const BASE_URL = "https://daba.devs.surf";

export function setPageSEO({ title, description, canonical, ogType = "website", ogImage, noIndex = false }) {
  // Canonical
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement("link");
    canonicalEl.rel = "canonical";
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.href = canonical || BASE_URL;

  // Title
  document.title = title;

  // Meta description
  let descEl = document.querySelector('meta[name="description"]');
  if (!descEl) {
    descEl = document.createElement("meta");
    descEl.name = "description";
    document.head.appendChild(descEl);
  }
  descEl.content = description;

  // Robots
  let robotsEl = document.querySelector('meta[name="robots"]');
  if (!robotsEl) {
    robotsEl = document.createElement("meta");
    robotsEl.name = "robots";
    document.head.appendChild(robotsEl);
  }
  robotsEl.content = noIndex ? "noindex, nofollow" : "index, follow";

  // Open Graph
  const ogTags = {
    "og:type": ogType,
    "og:url": canonical || BASE_URL,
    "og:title": title,
    "og:description": description,
    "og:site_name": "Dabba",
    "og:locale": "en_PK",
  };
  if (ogImage) ogTags["og:image"] = ogImage;

  Object.entries(ogTags).forEach(([property, content]) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", property);
      document.head.appendChild(el);
    }
    el.content = content;
  });

  // Twitter Card
  const twitterTags = {
    "twitter:card": "summary_large_image",
    "twitter:url": canonical || BASE_URL,
    "twitter:title": title,
    "twitter:description": description,
  };
  if (ogImage) twitterTags["twitter:image"] = ogImage;

  Object.entries(twitterTags).forEach(([name, content]) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.name = name;
      document.head.appendChild(el);
    }
    el.content = content;
  });
}

export function generateShopSEO(shop) {
  const slug = shop.slug;
  const canonical = `${BASE_URL}/s/${slug}`;
  const title = `${shop.name} · Preorder ${shop.city ? `${shop.city} ` : ""}Home Bakery · Dabba`;
  const description = `Order from ${shop.name} in ${shop.city || "Pakistan"}. Menu with prices, sizes, flavours. Pickup or delivery. Pay by Raast, bank, Easypaisa, JazzCash.`;
  const ogImage = shop.image_url || `${BASE_URL}/img/tart.webp`;

  return { title, description, canonical, ogImage };
}

export function generateCustomRequestSEO(shop) {
  const slug = shop.slug;
  const canonical = `${BASE_URL}/s/${slug}/custom`;
  const title = `${shop.name} · Custom Cake Quote · Dabba`;
  const description = `Request a custom cake from ${shop.name}. Share your idea, photos, occasion and servings. Get a price that holds for 24–72 hours.`;
  const ogImage = shop.image_url || `${BASE_URL}/img/two-tier.webp`;

  return { title, description, canonical, ogImage };
}

export function generateOrderTrackingSEO(orderCode, shopName) {
  const canonical = `${BASE_URL}/o/${orderCode}`;
  const title = `Order ${orderCode} · ${shopName} · Dabba`;
  const description = `Track your order ${orderCode} from ${shopName}. View status, payment, and delivery updates.`;

  return { title, description, canonical, noIndex: true };
}