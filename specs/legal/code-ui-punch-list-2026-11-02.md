# Dabba — Code & UI Punch List (Phase 9)

**Date:** 2026-11-02
**Product:** Dabba — preorder links for home bakers in Pakistan
**Purpose:** Code and UI changes needed to match what the Privacy Policy and Terms of Service now promise.

This punch list is both documentation and a todo list. Shipping the legal docs without these code changes creates liability drift.

---

## 1. Contact email and postal address (CRITICAL — placeholders in docs)

**Problem:** The Privacy Policy and Terms of Service contain `[CONTACT_EMAIL]`, `[CONTROLLER_NAME]`, and `[POSTAL_ADDRESS]` placeholders because no company email or physical address exists.

**Required actions:**
- [ ] Set up a real contact email (e.g., `hello@dabba.pk` or similar) and replace `[CONTACT_EMAIL]` in both `src/pages/Privacy.jsx` and `src/pages/Terms.jsx`
- [ ] Replace `[CONTROLLER_NAME]` with the operator's legal name or trading name
- [ ] Replace `[POSTAL_ADDRESS]` with a physical address (or state clearly that none exists and provide an alternative contact method)
- [ ] Replace `[LAST_UPDATED]` with the actual publish date in both files
- [ ] Replace `[GOVERNING_LAW]` in `src/pages/Terms.jsx` (default: Pakistan)

**Files:** `src/pages/Privacy.jsx`, `src/pages/Terms.jsx`

---

## 2. Attorney review disclaimer

**Problem:** Both docs state "No lawyer has reviewed or approved this document." This must be replaced once an attorney reviews.

**Required actions:**
- [ ] Engage a qualified lawyer (Pakistan-based, familiar with data protection) to review both documents
- [ ] Replace the attorney review section in both files with a statement confirming review was performed
- [ ] Update `.compliance-auditor/intake.md` with attorney review status

**Files:** `src/pages/Privacy.jsx`, `src/pages/Terms.jsx`, `.compliance-auditor/intake.md`

---

## 3. Data export endpoint (user right of access)

**Problem:** The Privacy Policy says "No self-service export or deletion" and requests are handled manually. If the docs promise self-service export, the endpoint must exist.

**Required actions:**
- [ ] Decide: offer self-service data export or keep manual process
- [ ] If self-service: build an endpoint that exports a user's data (orders, shop profile, feedback) as JSON/CSV
- [ ] If manual: keep the current language ("contact us") — do not promise self-service
- [ ] Add a "Download my data" button in the Dashboard for bakers

**Files:** `src/pages/Dashboard.jsx`, `src/lib/api.js`, `supabase/schema.sql` (if RLS needed)

---

## 4. Account deletion cascade (user right of erasure)

**Problem:** The Privacy Policy says deletion requests are handled manually. There is no automated deletion cascade.

**Required actions:**
- [ ] Build account deletion that cascades: delete user's shop, items, orders, feedback, and uploaded files
- [ ] Ensure Supabase RLS policies allow deletion only by the owner
- [ ] Delete files from `proofs` and `menu` storage buckets when a shop is deleted
- [ ] Add a "Delete my account" button in Dashboard settings with confirmation

**Files:** `src/pages/Dashboard.jsx` (Settings tab), `src/lib/api.js`, `supabase/schema.sql`

---

## 5. Retention periods (concrete, not vague)

**Problem:** The Privacy Policy honestly states no fixed retention period exists because the code doesn't enforce one. Regulators flag "as long as necessary" as vague.

**Required actions:**
- [ ] Define concrete retention periods (e.g., "orders kept 7 years for tax purposes", "analytics 14 months", "feedback kept indefinitely")
- [ ] Implement retention logic (scheduled deletion or `deleted_at` soft-delete)
- [ ] Update the Privacy Policy's Section 7 with the actual periods

**Files:** `src/lib/api.js`, `supabase/schema.sql`, `src/pages/Privacy.jsx`

---

## 6. Cookie banner improvements

**Problem:** The banner offers "Decline" and "Accept analytics" — equal buttons, which is good. But:

**Required actions:**
- [ ] Add a link to the Privacy Policy from the cookie banner (already links to `/privacy#cookies`)
- [ ] Add a "Reject all" option that is equally prominent as "Accept"
- [ ] Ensure the banner blocks analytics until consent (already done via `choice.analytics` gating)
- [ ] Consider adding a cookie table listing each cookie, purpose, and duration

**Files:** `src/components/CookieBanner.jsx`, `src/lib/consent.js`

---

## 7. Data Processing Agreements (DPAs) with subprocessors

**Problem:** The Privacy Policy lists Vercel, Supabase, Google, and OpenStreetMap as subprocessors but states "No Data Processing Agreements (DPAs) are currently in place."

**Required actions:**
- [ ] Execute DPAs with Supabase and Vercel (check their standard DPA terms)
- [ ] For Google GA4, review Google's data processing terms
- [ ] For OpenStreetMap, review their public usage policy (already cited in `src/lib/geocode.js`)
- [ ] Update the Privacy Policy once DPAs are in place

**Files:** `src/pages/Privacy.jsx` (Section 5)

---

## 8. International transfer mechanism

**Problem:** The Privacy Policy states data may be stored outside Pakistan with no Standard Contractual Clauses or transfer mechanism.

**Required actions:**
- [ ] If EU/UK users are likely, implement SCCs or rely on adequacy decisions
- [ ] Confirm Supabase project region and document it
- [ ] Update the Privacy Policy's Section 6 with the actual transfer mechanism

**Files:** `src/pages/Privacy.jsx`, Supabase project settings

---

## 9. Admin access log and security monitoring

**Problem:** The Privacy Policy states "No admin access log or security-monitoring process is currently implemented."

**Required actions:**
- [ ] Implement an admin access log (who accessed what data, when)
- [ ] Add an `ADMIN_EMAILS` environment variable guard for admin actions
- [ ] Log access to customer data (order details, payment screenshots)

**Files:** `src/lib/api.js`, `src/pages/Dashboard.jsx`, environment variables

---

## 10. Security headers (CSP, HSTS)

**Problem:** `vercel.json` only has a SPA rewrite. No CSP, HSTS, or other security headers.

**Required actions:**
- [ ] Add Content-Security-Policy header
- [ ] Add Strict-Transport-Security (HSTS) header
- [ ] Add X-Content-Type-Options, X-Frame-Options, Referrer-Policy headers
- [ ] Configure in `vercel.json`

**Files:** `vercel.json`

---

## 11. One-click unsubscribe (RFC 8058)

**Problem:** If Dabba sends marketing emails in the future, there's no unsubscribe mechanism.

**Required actions:**
- [ ] Only if email marketing is added: implement List-Unsubscribe header per RFC 8058
- [ ] Include physical postal address in every marketing email footer (CAN-SPAM)
- [ ] Currently N/A — no email marketing exists in the codebase

**Files:** N/A (future work)

---

## 12. Opt-out handling for messaging channels

**Problem:** WhatsApp is used via deep links (`wa.me`). No STOP/opt-out handling exists.

**Required actions:**
- [ ] Document that customers can message bakers on WhatsApp to opt out
- [ ] If Dabba ever sends automated WhatsApp messages, implement STOP handling
- [ ] Currently N/A — WhatsApp is user-initiated only via deep links

**Files:** N/A (future work)

---

## 13. Children's data age gate

**Problem:** The Privacy Policy states users should be 13+ but there's no age gate in the code.

**Required actions:**
- [ ] Add an age confirmation checkbox on sign-up/order forms (13+)
- [ ] For bakers accepting payments, consider 18+
- [ ] State the age requirement clearly in the Privacy Policy

**Files:** `src/pages/Login.jsx`, `src/pages/Shop.jsx`, `src/pages/Request.jsx`

---

## 14. Terms of Service page linking

**Problem:** The `/terms` page now exists but needs to be linked from relevant places.

**Required actions:**
- [ ] Already linked from the Landing page footer (Company section)
- [ ] Add link from Login page or Dashboard
- [ ] Add link from cookie banner or consent flow
- [ ] Add to sitemap.xml (already done)

**Files:** `src/pages/Landing.jsx` (done), `public/sitemap.xml` (done)

---

## 15. Demo mode data notice

**Problem:** Demo mode stores data in `localStorage` (`dabba-demo-v3`). Users may not realize this.

**Required actions:**
- [ ] The demo banner already states "everything you enter stays in this browser only" — keep this
- [ ] Add a link from the demo banner to the Privacy Policy
- [ ] Ensure demo data is clearly separated from live data

**Files:** `src/main.jsx` (demo banner), `src/pages/Privacy.jsx`

---

## Summary of priority order

| Priority | Task | Why |
|----------|------|-----|
| P0 | Replace placeholders (email, name, address, dates) | Docs contain invented placeholders — must be real before launch |
| P0 | Attorney review | No lawyer has reviewed; required before production use |
| P1 | Data export endpoint | User right of access promised in docs |
| P1 | Account deletion cascade | User right of erasure promised in docs |
| P1 | Concrete retention periods | Vague retention is a regulator red flag |
| P2 | DPAs with subprocessors | Required for GDPR/UK GDPR if EU/UK users |
| P2 | Security headers | Basic security hygiene |
| P3 | Age gate | Children's data protection |
| P3 | Admin access log | Security and audit trail |
