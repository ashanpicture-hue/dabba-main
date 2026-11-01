# Dabba — Legal Docs Update Rule (Phase 10a)

**Date:** 2026-11-02
**Product:** Dabba — preorder links for home bakers in Pakistan

## When to update

Update the Privacy Policy (`src/pages/Privacy.jsx`) and Terms of Service (`src/pages/Terms.jsx`) when:

1. **New data flows are added** — any new third-party integration, new data field, new upload type, or new analytics event
2. **New subprocessors are added** — any new service that receives user data (hosting, analytics, storage, payments, email)
3. **Retention changes** — any change to how long data is kept
4. **User rights change** — any new self-service export or deletion feature
5. **Jurisdiction changes** — if EU, UK, or California users become a significant portion of the user base
6. **Monetization** — when paid plans begin charging customers (currently free during pilot)
7. **Contact info changes** — when a real email, address, or controller name is established

## Where to update

- `src/pages/Privacy.jsx` — the Privacy Policy page component
- `src/pages/Terms.jsx` — the Terms of Service page component
- `public/sitemap.xml` — if adding new legal pages
- `specs/legal/` — keep copies of research, audit, and benchmark files
- `.compliance-auditor/intake.md` — update jurisdiction and attorney review status
- `memory/markit-email-addresses.md` — update real mailboxes when they exist
- `memory/legal-docs-update-rule.md` — this file

## Open placeholders (do not invent)

| Placeholder | Where | Status |
|---|---|---|
| `[CONTACT_EMAIL]` | Privacy.jsx, Terms.jsx | No company email exists yet |
| `[CONTROLLER_NAME]` | Privacy.jsx, Terms.jsx | No company established yet |
| `[POSTAL_ADDRESS]` | Privacy.jsx, Terms.jsx | No physical address exists yet |
| `[LAST_UPDATED]` | Privacy.jsx, Terms.jsx | To be set at publish |
| `[GOVERNING_LAW]` | Terms.jsx | Default: Pakistan |

## Baseline research and audit files

- `specs/legal/research-2026-11-02.md` — primary-source legal research (Pakistan, GDPR, UK GDPR, CCPA)
- `specs/legal/audit-2026-11-02.md` — code data-practices audit with file:line citations
- `specs/legal/benchmark-peers-2026-11-02.md` — peer SaaS policy comparison
- `specs/legal/code-ui-punch-list-2026-11-02.md` — code and UI changes needed to match the docs

## Attorney review status

**Pre-attorney.** No lawyer has reviewed or approved the Privacy Policy or Terms of Service. Both documents contain a disclaimer stating this. A qualified lawyer must review before production use.
