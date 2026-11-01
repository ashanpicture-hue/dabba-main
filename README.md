# Dabba

Preorder links for home bakers in Pakistan. A baker shares one link in their Instagram bio. Customers see the menu with prices, book an open date, pay an advance by bank, Raast or wallet, and upload the screenshot. The baker gets an order list, a daily baking list and one-tap WhatsApp messages.

## Features

- **Order page**: menu with photos and prices, item options (size, flavour) that change price and slots, message on the cake.
- **Dates and capacity**: daily slot limit, days of notice, weekly closed days, and special days with extra slots or closed.
- **Advance payment**: customer pays by bank, Raast or wallet and uploads the screenshot.
- **Custom cake requests**: idea, size, flavour and up to 3 photos. The baker sends a price that holds for 24 to 72 hours. The customer accepts on their order page and pays the advance, and only then is the date booked.
- **Order status page** at `/o/<code>`: progress, payment state, quote acceptance.
- **Baker dashboard**: live new-order alerts with sound and browser notifications while the page is open, one-tap WhatsApp messages, daily baking list, menu and settings editors, recipe costing.
- **Feedback** button on every page.

## Run locally

```bash
npm install
npm run dev
```

With no Supabase keys the app runs in **demo mode**: a sample bakery, data kept in the browser only.

## Go live with Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor. It creates the tables, row-level security, the `place_order` and `day_load` functions, and the private `proofs` storage bucket.
3. In Supabase Auth settings, set the site URL to the deployed domain and add `https://<domain>/app` as a redirect URL.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel (Project settings, Environment variables) and redeploy.

## Feedback

Every page has a feedback button. In live mode, notes land in the `feedback` table with the page, role (baker, customer, visitor) and rating. Read them in the Supabase table editor and use them to decide what to change.

## Tests

```bash
npm test
npm run test:sql
```

`test:sql` runs the schema in an in-memory Postgres with stand-ins for Supabase auth and storage, then checks pricing, capacity, special days, the quote flow, privacy and storage rules.

Covers phone numbers, dates, pricing, deposits, capacity and costing. The same rules run again inside `place_order` in Postgres.
