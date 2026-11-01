# Dabba — Compliance Auditor Intake (Phase 0)

## 1. Project identity
- **Product:** Dabba — preorder links for home bakers in Pakistan. A baker shares one link in their Instagram bio. Customers see the menu with prices, book an open date, pay an advance by bank/Raast/wallet, and upload a screenshot. The baker gets an order list, a daily baking list, and one-tap WhatsApp messages.
- **Domain:** `https://dabba.vercel.app` (Vercel)
- **Codebase location:** `E:\dabba-main`
- **Tech stack:** Vite + React 18 + React Router 6, Supabase (Postgres + Auth + Storage), Vercel Analytics + GA4, OpenStreetMap Nominatim for address checks. Deployed on Vercel via `vercel.json` SPA rewrite.
- **Legal surface:** Client-side React pages (`src/pages/`), no backend routes. `/privacy` page exists at `src/pages/Privacy.jsx`. No `/terms` page exists yet.

## 2. Jurisdictions in scope
- **Business based:** Pakistan (independent developer, no company, no company email, no physical postal address)
- **Users:** Mostly Pakistan as well
- **Framework:** Pakistan applicable framework as primary; GDPR/UK GDPR/CCPA researched as secondary exposure since the site is publicly accessible. No EU/UK/California targeting.

## 3. What exists today
- `/privacy` page: `src/pages/Privacy.jsx` — plain-language summary, last updated 1 November 2026. Mentions data collection, who can see it, cookies, address checks, money, storage, user choices. No contact email, no controller identity, no retention periods, no user-rights detail, no supervisory authority.
- `/terms` page: does NOT exist.
- Cookie banner: `src/components/CookieBanner.jsx` + `src/lib/consent.js` — single analytics choice, stored in `localStorage` key `dabba-consent-v1`, 1-year max age.
- Tracking plan: `TRACKING_PLAN.md` — GA4 + Vercel Analytics, consent-gated, IP anonymization, 14-month GA4 retention, no PII in properties.

## 4. Real gaps vs. aspirational
- **Confirmed data flows (from code audit):**
  - Baker sign-in: email via Supabase Auth (OTP sign-in link), `src/pages/Login.jsx`
  - Shop profile: name, slug, tagline, Instagram, WhatsApp, city, payment_info (bank/Raast details), pickup_address, `src/supabase/schema.sql` `shops` table
  - Customer orders: name, WhatsApp phone, delivery address, order items, payment screenshot (image upload to `proofs` bucket), `orders` table
  - Custom cake requests: occasion, servings, flavour, details, up to 3 inspiration photos, via `request_custom` RPC
  - Feedback: rating, message, optional contact (WhatsApp/email), page, role, `feedback` table
  - Analytics: GA4 + Vercel Analytics, consent-gated, page views + custom events (see `TRACKING_PLAN.md`)
  - Address checks: address text sent to OpenStreetMap Nominatim (`src/lib/geocode.js`), name/phone NOT sent
  - Demo mode: localStorage `dabba-demo-v3`, sample data only, `api.signIn` returns `demo@dabba.pk`
- **Missing from current Privacy.jsx:** controller identity, contact email, retention periods, legal basis, supervisory authority complaint rights, data export/deletion process, international transfers detail, sub-processor list (Vercel, Supabase, Google, OpenStreetMap), cookies table, children's data, marketing communications.
- **No `/terms` page at all.**
- **No company email or physical postal address** — this is a gap for the "Who we are" section and any future email footers.

## 5. Attorney review status
- **Pre-attorney.** No lawyer has read or done anything. Independent developer based in Pakistan. No company email, no physical postal address. Final docs will include a disclaimer noting no professional review was performed.

## Open placeholders to leave in the docs (do not invent)
- Controller / business name and legal identity
- Contact email address (no company email exists yet)
- Physical postal address (none exists)
- Last Updated date (to be set at publish)
- Specific retention periods (to be confirmed against code behavior)
