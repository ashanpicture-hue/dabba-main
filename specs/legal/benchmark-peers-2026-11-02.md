# Dabba — Peer Benchmark (Phase 4)

**Date:** 2026-11-02
**Product:** Dabba — preorder links for home bakers in Pakistan
**Business based:** Pakistan (independent developer)
**Researcher:** compliance-auditor skill (peer-benchmark lane)

---

## Peer selection rationale

Five peers were selected for structural similarity to Dabba:
1. Small-team / independent developer SaaS (not enterprise legal department)
2. B2C or B2B2C marketplace/platform model
3. Local/regional focus or creator-economy orientation
4. Payment-related but not money-handling (like Dabba — never touches customer funds)
5. Simple privacy/terms pages (not 50-page enterprise documents)

Peers: **Readwise, Raycast, Linear, Gumroad, Supabase**

---

## Peer 1: Readwise

**Profile:** Small-team SaaS, independent developer origins, consumer subscription, global users.

| Element | Readwise approach | Adoptable for Dabba? |
|---|---|---|
| Controller identification | "Readwise, Inc." with address in Delaware, USA | No — Dabba has no company/address |
| Contact email | hello@readwise.io (real mailbox) | No — Dabba has no company email |
| Legal basis | Consent, contract, legitimate interest | Yes — structure is sound |
| Retention | "As long as your account is active" | Yes — honest, no fixed period |
| User rights | Email support@ for access/deletion | Yes — contact-based, not self-service |
| Subprocessors | Listed (AWS, Stripe, etc.) | Yes — Dabba should list Vercel, Supabase, Google |
| Cookies | Essential + analytics, consent banner | Yes — Dabba already does this |
| Children's data | "Not directed at children under 13" | Yes |
| International transfers | "Data may be transferred outside EEA" | Yes |
| Attorney review | Not stated | N/A |

**Over-promise warning:** Readwise claims "we never sell your data." Dabba's code does not either, but this is an aspirational claim not verifiable from code. Use hedged language.

---

## Peer 2: Raycast

**Profile:** Small-team SaaS, Mac productivity tool, independent developer roots, global users.

| Element | Raycast approach | Adoptable for Dabba? |
|---|---|---|
| Controller identification | Raycast GmbH, German address | No — Dabba has no address |
| Contact email | hi@raycast.com | No — Dabba has no email |
| Legal basis | Contract, consent, legitimate interest | Yes |
| Retention | Specific periods where stated (e.g., logs 30 days) | Partial — Dabba has no retention logic |
| User rights | Email privacy@ for requests | No — Dabba has no privacy@ |
| Subprocessors | Listed with purposes | Yes |
| Cookies | Minimal, consent where needed | Yes |
| Children's data | 16+ (GDPR-K) | Yes — adapt to 13+ |
| International transfers | Standard Contractual Clauses mentioned | Yes — if Dabba had SCCs |
| Attorney review | Not stated | N/A |

**Over-promise warning:** Raycast names specific subprocessors with DPA links. Dabba should not claim DPA links it doesn't have.

---

## Peer 3: Linear

**Profile:** Small-team SaaS, B2B tool, global users, independent developer origins.

| Element | Linear approach | Adoptable for Dabba? |
|---|---|---|
| Controller identification | Linear App AB, Swedish address | No — Dabba has no address |
| Contact email | security@linear.app | No — Dabba has no email |
| Legal basis | Contract, consent, legitimate interest | Yes |
| Retention | "As long as necessary for the purpose" | Too vague — regulator red flag; Dabba should say "while account active" |
| User rights | Email requests | Yes — contact-based |
| Subprocessors | Listed (AWS, Vercel, etc.) | Yes |
| Cookies | Essential only by default, consent for analytics | Yes — Dabba matches |
| Children's data | Not directed at children | Yes |
| International transfers | SCCs, DPF | No — Dabba has no transfer mechanism |
| Attorney review | Not stated | N/A |

**Over-promise warning:** Linear's "as long as necessary" retention is flagged as a regulator red flag in the compliance-auditor skill. Dabba should avoid this phrasing.

---

## Peer 4: Gumroad

**Profile:** Creator-economy platform, independent developer origins, handles payments (unlike Dabba), global users.

| Element | Gumroad approach | Adoptable for Dabba? |
|---|---|---|
| Controller identification | Gumroad, Inc., US address | No — Dabba has no address |
| Contact email | support@gumroad.com | No — Dabba has no email |
| Legal basis | Contract, consent | Yes |
| Retention | Specific periods for some data | Partial — Dabba has no retention logic |
| User rights | Email requests, account deletion in settings | Partial — Dabba has no self-service deletion |
| Subprocessors | Listed (Stripe, PayPal, AWS, etc.) | Yes |
| Cookies | Consent banner, essential vs analytics | Yes |
| Children's data | 13+ | Yes |
| International transfers | DPF, SCCs | No — Dabba has no mechanism |
| Attorney review | Not stated | N/A |

**Over-promise warning:** Gumroad handles payments directly (Stripe, PayPal). Dabba never touches money — do not copy payment-related liability language.

---

## Peer 5: Supabase

**Profile:** Developer platform, open-core, global users, B2B2C.

| Element | Supabase approach | Adoptable for Dabba? |
|---|---|---|
| Controller identification | Supabase Inc., US address | No — Dabba has no address |
| Contact email | privacy@supabase.com | No — Dabba has no email |
| Legal basis | Contract, consent, legitimate interest | Yes |
| Retention | Varies by service, some specific | Partial — Dabba has no retention logic |
| User rights | Email requests | Yes — contact-based |
| Subprocessors | Extensive list with DPAs | Yes — list subprocessors, no DPA links needed |
| Cookies | Essential + optional analytics | Yes |
| Children's data | Not directed at children | Yes |
| International transfers | SCCs, DPF | No — Dabba has no mechanism |
| Attorney review | Not stated | N/A |

---

## Clause structures worth adopting (with attribution, not copy-paste)

1. **"Who we are" section** — controller name, contact email, address (with placeholders where Dabba lacks these)
2. **"What we collect" section** — organized by user type (baker, customer, visitor) — Dabba's current Privacy.jsx already does this well
3. **"Who can see it" section** — clear statement that order data is visible only to the relevant baker
4. **"Cookies and analytics" section** — consent-gated, explains what analytics collects and how to decline
5. **"Your choices" section** — how to contact for access/correction/deletion
6. **"No sale of data" statement** — aspirational, use hedged language ("We do not sell personal data")
7. **"International transfers" section** — data may be stored outside Pakistan via Vercel, Supabase, Google

---

## Over-promise warnings (claims peers make that Dabba's code does NOT support)

| Peer claim | Why Dabba should NOT copy it |
|---|---|
| "Self-service data export" | No export endpoint exists in code |
| "Self-service account deletion" | No deletion endpoint exists in code |
| Specific retention periods (e.g., "logs kept 30 days") | No retention logic in code |
| "Standard Contractual Clauses" for transfers | No transfer mechanism in place |
| "privacy@company.com" or "legal@company.com" | No such mailbox exists |
| Physical mailing address | None exists |
| "We are GDPR compliant" | No GDPR program, no DPO, no Article 27 rep |
| Data Processing Agreement links | No DPAs in place with subprocessors |

---

## Recommended structure for Dabba's legal docs

Based on peer benchmarks, Dabba's Privacy Policy should include:

1. **Who we are** — controller identity (placeholder), contact (placeholder), no attorney review disclaimer
2. **What information we collect** — by user type (baker, customer, visitor)
3. **How we use your information** — purposes with legal basis
4. **Who we share information with** — subprocessors (Vercel, Supabase, Google, OpenStreetMap)
5. **International transfers** — data may be stored outside Pakistan
6. **How long we keep your information** — honest: while account active, no fixed period
7. **Your rights and choices** — contact-based access/correction/deletion
8. **Cookies and analytics** — consent-gated GA4 + Vercel Analytics
9. **Children's data** — not directed at children, 13+
10. **Security** — RLS, signed URLs, no payment handling
11. **Changes to this policy** — how updates are communicated
12. **Contact us** — placeholder email

Dabba's Terms of Service should include:

1. **Acceptance of terms**
2. **Description of service**
3. **Baker accounts and responsibilities**
4. **Customer orders** — contract between customer and baker
5. **Payments** — Dabba never handles money
6. **Pricing and plans** — free pilot, paid plans after, 30 days' notice
7. **User content and license**
8. **Prohibited uses**
9. **Disclaimer of warranties**
10. **Limitation of liability**
11. **Termination**
12. **Governing law** — Pakistan (placeholder)
13. **Contact us** — placeholder
