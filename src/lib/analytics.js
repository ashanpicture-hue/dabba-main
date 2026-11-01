// GA4 analytics wrapper with consent gating.
// gtag.js loads immediately so Google's verification crawler detects it.
// Events (page_view, etc.) are only sent after user consents via cookie banner.
// All event names use object-action format (lowercase, underscores).

let measurementId = null;

function hasAnalyticsConsent() {
  const consent = localStorage.getItem('dabba-consent-v1');
  if (!consent) return false;
  try { return JSON.parse(consent).analytics === true; } catch { return false; }
}

export function initGA4(id) {
  measurementId = id;

  // Load gtag.js script IMMEDIATELY (for verification)
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", id, {
    send_page_view: false, // we'll send page views manually on route changes
    anonymize_ip: true,
  });
}

function gtag() {
  if (typeof window.gtag === "function") {
    window.gtag(...arguments);
  }
}

/** Send a page view. Call on route changes. */
export function trackPage(path, title) {
  if (!measurementId) return;
  if (!hasAnalyticsConsent()) return;
  gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: path,
    page_title: title,
  });
}

/** Track a custom event with object-action naming. */
export function trackEvent(action, properties = {}) {
  if (!measurementId) return;
  if (!hasAnalyticsConsent()) return;
  gtag("event", action, properties);
}

/** Track a conversion event. */
export function trackConversion(action, properties = {}) {
  if (!measurementId) return;
  if (!hasAnalyticsConsent()) return;
  gtag("event", action, { ...properties });
}

export default {
  initGA4,
  trackPage,
  trackEvent,
  trackConversion,
};