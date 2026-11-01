# Dabba — Real Mailboxes (Phase 10a)

**Date:** 2026-11-02
**Product:** Dabba — preorder links for home bakers in Pakistan

## Real mailboxes (confirmed by user intake)

None. The user is an independent developer based in Pakistan with no company email and no physical postal address.

## Placeholders used in legal docs (do not invent mailboxes)

| Placeholder | Location | Status |
|---|---|---|
| `[CONTACT_EMAIL]` | `src/pages/Privacy.jsx`, `src/pages/Terms.jsx` | No real mailbox exists yet — must be set up before launch |
| `[CONTROLLER_NAME]` | `src/pages/Privacy.jsx`, `src/pages/Terms.jsx` | No company established yet |
| `[POSTAL_ADDRESS]` | `src/pages/Privacy.jsx`, `src/pages/Terms.jsx` | No physical address exists yet |
| `[LAST_UPDATED]` | `src/pages/Privacy.jsx`, `src/pages/Terms.jsx` | To be set at publish |
| `[GOVERNING_LAW]` | `src/pages/Terms.jsx` | Default: Pakistan |

## Rule

Never invent `privacy@`, `legal@`, `noreply@`, or `support@` mailboxes. Only use mailboxes confirmed by the user in intake or already present in the project. Inventing a mailbox has caused real users to have their CAN-SPAM unsubscribe mail bounce.
