// Runs supabase/schema.sql in an in-memory Postgres with minimal Supabase stand-ins,
// then walks every customer and baker flow, including the ones that must fail.
import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
import assert from "assert/strict";

const schema = fs.readFileSync(process.argv[2], "utf8");
const db = new PGlite();

await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id serial primary key, bucket_id text, name text);
  create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated; grant all on storage.objects to anon, authenticated; grant usage on sequence storage.objects_id_seq to anon, authenticated;
  grant execute on function storage.foldername(text) to anon, authenticated;
  create publication supabase_realtime;
  grant usage on schema public to anon, authenticated;
`);
await db.exec(schema);
await db.exec(`grant all on all tables in schema public to anon, authenticated; grant usage on all sequences in schema public to anon, authenticated;`);

const OWNER = "11111111-1111-1111-1111-111111111111";
const OTHER = "22222222-2222-2222-2222-222222222222";
const as = async (role, sub, sql, params) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${sub || ""}', false); set role ${role};`);
  try { return await db.query(sql, params); } finally { await db.exec("reset role;"); }
};
const fails = async (p, re) => { try { await p; } catch (e) { assert.match(e.message, re); return; } throw new Error("expected failure " + re); };
const today = (await db.query(`select (now() at time zone 'Asia/Karachi')::date::text d`)).rows[0].d;
const plus = async (n) => (await db.query(`select ($1::date + $2::int)::text d`, [today, n])).rows[0].d;
let ok = 0; const pass = (m) => { ok++; console.log("ok -", m); };

await db.exec(`insert into auth.users values ('${OWNER}', 'baker@x.pk'), ('${OTHER}', 'other@x.pk')`);

// Baker creates shop and items through RLS.
const d3 = await plus(3), d4 = await plus(4), d6 = await plus(6), d10 = await plus(10);
const shop = (await as("authenticated", OWNER, `insert into shops (owner, slug, name, whatsapp, capacity, lead_days, deposit_pct, delivery_zones, custom_enabled, custom_lead_days, date_overrides)
  values ($1, 'cocoa', 'Cocoa', '03001234567', 4, 2, 50, '[{"name":"DHA","fee":300}]', true, 5, $2) returning id`, [OWNER, JSON.stringify({ [d4]: { closed: true }, [d10]: { capacity: 10 } })])).rows[0];
pass("owner creates shop under RLS");
await fails(as("authenticated", OTHER, `insert into shops (owner, slug, name, whatsapp) values ($1, 'x2', 'Xx', '0300')`, [OWNER]), /row-level security/);
pass("cannot create a shop for someone else");

const tart = (await as("authenticated", OWNER, `insert into items (shop_id, name, price, units, allow_message, options) values ($1, 'Tart', 3000, 2, true, $2) returning id`,
  [shop.id, JSON.stringify([{ name: "Size", required: true, choices: [{ label: "8 inch", price: 0, units: 0 }, { label: "10 inch", price: 1200, units: 1 }] }])])).rows[0].id;
pass("owner adds item with options");

// Customer (anon) reads public data.
const pub = (await as("anon", null, `select * from public_shops where slug = 'cocoa'`)).rows;
assert.equal(pub.length, 1); assert.equal(pub[0].owner, undefined);
assert.equal((await as("anon", null, `select * from shops`)).rows.length, 0);
assert.equal((await as("anon", null, `select * from orders`)).rows.length, 0);
pass("anon sees public shop view only, not shops or orders");

const place = (p) => as("anon", null, `select place_order('cocoa', $1::jsonb) r`, [JSON.stringify(p)]);
const base = { customer_name: "Ali Khan", customer_phone: "0300 7654321", fulfilment: "delivery", zone: "DHA", address: "House 5, Street 2, DHA", due_date: d3 };

const o1 = (await place({ ...base, lines: [{ item_id: tart, qty: 1, choices: { Size: "10 inch" }, message: "Happy 30th", price: 1 }] })).rows[0].r;
assert.equal(o1.subtotal, 4200); assert.equal(o1.total, 4500); assert.equal(o1.deposit_due, 2250); assert.equal(o1.units, 3);
assert.equal(o1.customer_phone, "923007654321"); assert.equal(o1.lines[0].message, "Happy 30th");
pass("place_order prices options server-side and ignores browser price");

await fails(place({ ...base, lines: [{ item_id: tart, qty: 1, choices: {} }] }), /Choose size/);
await fails(place({ ...base, lines: [{ item_id: tart, qty: 1, choices: { Size: "12 inch" } }] }), /isn't available/);
pass("missing or fake option rejected");
await fails(place({ ...base, lines: [{ item_id: tart, qty: 1, choices: { Size: "8 inch" } }] }), /Fully booked/); // 3 + 2 > 4
pass("capacity enforced");
await fails(place({ ...base, due_date: d4, lines: [{ item_id: tart, qty: 1, choices: { Size: "8 inch" } }] }), /Closed that day/);
pass("per-date closed override enforced");
const big = (await place({ ...base, due_date: d10, lines: [{ item_id: tart, qty: 4, choices: { Size: "8 inch" } }] })).rows[0].r;
assert.equal(big.units, 8);
pass("per-date extra capacity allows 8 slots on a 4-slot shop");
await fails(place({ ...base, due_date: today, lines: [{ item_id: tart, qty: 1, choices: { Size: "8 inch" } }] }), /notice/);
await fails(place({ ...base, customer_phone: "12345", lines: [{ item_id: tart, qty: 1, choices: { Size: "8 inch" } }] }), /mobile number/);
await fails(place({ ...base, zone: "Nowhere", lines: [{ item_id: tart, qty: 1, choices: { Size: "8 inch" } }] }), /delivery area/);
pass("notice, phone and zone checks");

const load = (await as("anon", null, `select * from day_load('cocoa') order by day`)).rows;
assert.deepEqual(load.map((r) => [String(r.day instanceof Date ? r.day.toISOString().slice(0, 10) : r.day), r.units]).map((x) => x[1]), [3, 8]);
pass("day_load returns booked slots per day");

// Custom request: below lead time fails, then succeeds; doesn't use capacity.
const req = (p) => as("anon", null, `select request_custom('cocoa', $1::jsonb) r`, [JSON.stringify(p)]);
await fails(req({ ...base, due_date: d3, request: { occasion: "Birthday", details: "Pink two tier cake please" } }), /5 days notice/);
await fails(req({ ...base, due_date: d6, request: { details: "short" } }), /Describe/);
const r1 = (await req({ ...base, due_date: d6, request: { occasion: "Birthday", details: "Pink two tier cake please" }, photos: [`${shop.id}/ref-a.jpg`, "evil/x.jpg"] })).rows[0].r;
assert.equal(r1.status, "request"); assert.equal(r1.units, 0); assert.deepEqual(r1.photos, [`${shop.id}/ref-a.jpg`]); assert.equal(r1.delivery_fee, 300);
pass("request_custom checks custom notice, keeps only this shop's photos");

const st = (await as("anon", null, `select order_status($1) r`, [r1.code])).rows[0].r;
assert.equal(st.order.status, "request"); assert.equal(st.order.customer_name, "Ali"); assert.equal(st.order.customer_phone, undefined); assert.equal(st.shop.owner, undefined);
assert.equal((await as("anon", null, `select order_status('ZZZZZZ') r`)).rows[0].r, null);
pass("order_status hides phone and address, unknown code returns null");

// Accepting before a quote fails.
await fails(as("anon", null, `select accept_quote($1, null)`, [r1.code]), /no longer open/);
// Other user can't quote it.
const upd = (sub, sql, p) => as("authenticated", sub, sql, p);
const otherUpd = await upd(OTHER, `update orders set status = 'quoted' where code = $1 returning id`, [r1.code]);
assert.equal(otherUpd.rows.length, 0);
pass("another account cannot touch the order");
// Owner quotes: 4 slots on d6 (capacity 4), total 5300, deposit 2650, expires tomorrow.
await upd(OWNER, `update orders set status='quoted', subtotal=5000, total=5300, deposit_due=2650, units=4, quote_expires=now()+interval '1 day' where code=$1`, [r1.code]);
await fails(as("anon", null, `select accept_quote($1, null)`, [r1.code]), /screenshot/);
await fails(as("anon", null, `select accept_quote($1, 'evil/p.jpg')`, [r1.code]), /screenshot/);
const acc = (await as("anon", null, `select accept_quote($1, $2) r`, [r1.code, `${shop.id}/p.jpg`])).rows[0].r;
assert.equal(acc.status, "new"); assert.equal(acc.payment_status, "submitted");
pass("accept_quote needs this shop's proof, then books the order");
await fails(as("anon", null, `select accept_quote($1, $2)`, [r1.code, `${shop.id}/p.jpg`]), /no longer open/);
pass("quote can't be accepted twice");

// Expired quote and full day.
const r2 = (await req({ ...base, due_date: d6, request: { details: "Another big custom cake" } })).rows[0].r;
await upd(OWNER, `update orders set status='quoted', subtotal=1000, total=1300, deposit_due=650, units=1, quote_expires=now()-interval '1 hour' where code=$1`, [r2.code]);
await fails(as("anon", null, `select accept_quote($1, $2)`, [r2.code, `${shop.id}/q.jpg`]), /expired/);
await upd(OWNER, `update orders set quote_expires=now()+interval '1 hour' where code=$1`, [r2.code]);
await fails(as("anon", null, `select accept_quote($1, $2)`, [r2.code, `${shop.id}/q.jpg`]), /Fully booked/);
pass("expired quote and full day both rejected");

// Storage policies.
await as("anon", null, `insert into storage.objects (bucket_id, name) values ('proofs', $1)`, [`${shop.id}/z.jpg`]);
await fails(as("anon", null, `insert into storage.objects (bucket_id, name) values ('proofs', 'nope/z.jpg')`), /row-level security/);
await fails(as("anon", null, `insert into storage.objects (bucket_id, name) values ('menu', $1)`, [`${shop.id}/m.jpg`]), /row-level security/);
await as("authenticated", OWNER, `insert into storage.objects (bucket_id, name) values ('menu', $1)`, [`${shop.id}/m.jpg`]);
await fails(as("authenticated", OTHER, `insert into storage.objects (bucket_id, name) values ('menu', $1)`, [`${shop.id}/m2.jpg`]), /row-level security/);
assert.equal((await as("authenticated", OWNER, `select * from storage.objects where bucket_id='proofs'`)).rows.length, 1);
assert.equal((await as("authenticated", OTHER, `select * from storage.objects where bucket_id='proofs'`)).rows.length, 0);
assert.equal((await as("anon", null, `select * from storage.objects where bucket_id='proofs'`)).rows.length, 0);
pass("storage: customers upload proofs to open shops only; only owner reads; only owner adds menu photos");

// Feedback.
await as("anon", null, `insert into feedback (role, rating, message, page) values ('customer', 5, 'easy', '/s/cocoa')`);
assert.equal((await as("anon", null, `select * from feedback`)).rows.length, 0);
pass("anyone can send feedback, nobody can read it through the API");

// Helpers aren't callable by customers.
await fails(as("anon", null, `select _norm_phone('03001234567')`), /permission denied/);
pass("internal helpers not exposed");

console.log(`\n${ok} checks passed`);
