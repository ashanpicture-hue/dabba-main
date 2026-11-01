// One API, two backends. With VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set,
// data lives in Supabase. Without them the app runs in demo mode, in this browser only.
import { createClient } from "@supabase/supabase-js";
import { priceOrder, dateProblem, validateCustomer, validateRequest, deliveryFee, makeCode, todayPK, addDays, dayLoad, quoteExpired, BOOKED } from "./core.js";

const URL_ = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const DEMO = !(URL_ && KEY);
const sb = DEMO ? null : createClient(URL_, KEY);

/* ---------- images: shrink on the phone before upload ---------- */
export async function shrinkImage(file, max = 1200, quality = 0.8) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Choose a photo or screenshot.");
  if (file.size > 15 * 1024 * 1024) throw new Error("That image is too large. Try a smaller one.");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return await new Promise((res) => c.toBlob(res, "image/jpeg", quality));
}

/* ======================= DEMO BACKEND (localStorage) ======================= */
const KEY_STORE = "dabba-demo-v3";
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));

function seed() {
  const shopId = uid();
  const t = todayPK();
  const items = [
    { id: uid(), shop_id: shopId, name: "Dark chocolate tart", description: "70% chocolate ganache, buttery crust.", price: 3200, units: 2, image_url: "/img/tart.webp", active: true, sort: 1, allow_message: true,
      options: [{ name: "Size", required: true, choices: [{ label: "8 inch, serves 8", price: 0, units: 0 }, { label: "10 inch, serves 12", price: 1300, units: 1 }] },
                { name: "Topping", required: false, choices: [{ label: "Fresh berries", price: 450, units: 0 }, { label: "Sea salt caramel", price: 300, units: 0 }] }] },
    { id: uid(), shop_id: shopId, name: "Bento cake", description: "Small 4 inch cake in a gift box. Serves 2.", price: 1800, units: 1, image_url: "/img/bento.webp", active: true, sort: 2, allow_message: false, options: [] },
    { id: uid(), shop_id: shopId, name: "Fudge brownies (9)", description: "Gooey centre, crackly top.", price: 1500, units: 1, image_url: "/img/brownies.webp", active: true, sort: 3, allow_message: false, options: [] },
  ];
  const L = (i, qty, choices = []) => ({ item_id: items[i].id, name: items[i].name, price: items[i].price + (choices[0]?.add || 0), qty, units: items[i].units, choices: choices.map(({ group, label }) => ({ group, label })), message: "" });
  const mk = (days, name, phone, lines, fulfilment, status, pay, extra = {}) => {
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const fee = fulfilment === "delivery" ? 350 : 0;
    return { id: uid(), shop_id: shopId, code: makeCode(), created_at: new Date(Date.now() - days * 3600e3).toISOString(), due_date: addDays(t, days), fulfilment, zone: fulfilment === "delivery" ? "DHA / Clifton" : null, delivery_fee: fee, address: fulfilment === "delivery" ? "House 12, Street 4, Phase 6, DHA" : "", customer_name: name, customer_phone: phone, notes: "", lines, subtotal, total: subtotal + fee, deposit_due: Math.ceil((subtotal + fee) / 2), units: lines.reduce((s, l) => s + l.units * l.qty, 0), proof_path: null, payment_status: pay, status, request: null, photos: [], quote_note: "", quote_expires: null, ...extra };
  };
  return {
    shops: [{ id: shopId, owner: "demo", slug: "cocoa-crumb", name: "Cocoa Crumb (demo)", tagline: "Small-batch chocolate tarts, Karachi", instagram: "", whatsapp: "03001234567", city: "Karachi",
      capacity: 8, lead_days: 2, closed_days: [1], date_overrides: { [addDays(t, 12)]: { capacity: 16 } }, deposit_pct: 50,
      payment_info: "Meezan Bank · Cocoa Crumb · IBAN PK00 MEZN 0000 0000 0000 0000\nRaast ID: 0300 1234567",
      pickup_enabled: true, pickup_address: "Block 5, Clifton (exact pin on WhatsApp)",
      delivery_zones: [{ name: "DHA / Clifton", fee: 350 }, { name: "PECHS / Bahadurabad", fee: 450 }, { name: "Gulshan / Johar", fee: 600 }],
      custom_enabled: true, custom_lead_days: 5, custom_note: "Custom cakes start from Rs 4,500 for 2 lb. We make something similar to your photos, not an exact copy.", is_open: true }],
    items,
    orders: [
      mk(1, "Sana Iqbal", "03211234567", [L(0, 1, [{ group: "Size", label: "8 inch, serves 8" }])], "delivery", "confirmed", "verified"),
      mk(1, "Hamza Ali", "03331234567", [L(1, 2)], "pickup", "new", "submitted"),
      mk(3, "Ayesha Khan", "03451234567", [L(0, 1, [{ group: "Size", label: "8 inch, serves 8" }]), L(2, 1)], "delivery", "new", "submitted"),
      mk(7, "Maryam Siddiqui", "03011234567", [], "pickup", "request", "none", { request: { occasion: "Birthday", servings: "About 15 people", flavour: "Chocolate fudge", details: "Two-tier pastel pink cake with gold drip and a small number 30 topper." }, subtotal: 0, total: 0, deposit_due: 0, units: 0 }),
    ],
    feedback: [],
  };
}

const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY_STORE)); if (s?.shops) return s; } catch {} const s = seed(); save(s); return s; };
const save = (s) => { try { localStorage.setItem(KEY_STORE, JSON.stringify(s)); } catch (e) { throw new Error("Your browser storage is full. Reset the demo to continue."); } };
const blobToDataUrl = (b) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
const findByCode = (s, code) => s.orders.find((o) => o.code === String(code || "").toUpperCase());

const demo = {
  async session() { try { return localStorage.getItem("dabba-demo-auth") ? { email: "demo@dabba.pk" } : null; } catch { return null; } },
  onAuth() { return () => {}; },
  async signIn() { localStorage.setItem("dabba-demo-auth", "1"); return { demo: true }; },
  async signOut() { localStorage.removeItem("dabba-demo-auth"); },
  async myShop() { return load().shops[0] || null; },
  async createShop(data) { const s = load(); const shop = { ...data, id: uid(), owner: "demo" }; s.shops = [shop]; s.items = []; s.orders = []; save(s); return shop; },
  async updateShop(id, patch) {
    const s = load();
    if (patch.slug && s.shops.some((x) => x.slug === patch.slug && x.id !== id)) throw new Error("That link is taken.");
    s.shops = s.shops.map((x) => (x.id === id ? { ...x, ...patch } : x)); save(s); return s.shops.find((x) => x.id === id);
  },
  async items(shopId) { return load().items.filter((i) => i.shop_id === shopId).sort((a, b) => a.sort - b.sort); },
  async saveItem(item) { const s = load(); if (item.id) s.items = s.items.map((i) => (i.id === item.id ? { ...i, ...item } : i)); else s.items.push({ options: [], allow_message: false, ...item, id: uid(), sort: s.items.length + 1 }); save(s); },
  async deleteItem(id) { const s = load(); s.items = s.items.filter((i) => i.id !== id); save(s); },
  async uploadMenuPhoto(_shopId, blob) { return await blobToDataUrl(blob); },
  async publicShop(slug) {
    const s = load(); const shop = s.shops.find((x) => x.slug === slug); if (!shop) return null;
    const loadBy = {};
    for (const o of s.orders) if (o.shop_id === shop.id && BOOKED.includes(o.status)) loadBy[o.due_date] = (loadBy[o.due_date] || 0) + o.units;
    return { shop, items: s.items.filter((i) => i.shop_id === shop.id && i.active).sort((a, b) => a.sort - b.sort), load: loadBy };
  },
  async placeOrder(slug, draft, proof) {
    const s = load(); const shop = s.shops.find((x) => x.slug === slug);
    if (!shop || !shop.is_open) throw new Error("This shop isn't taking orders right now.");
    const bad = validateCustomer(draft); if (bad) throw new Error(bad);
    const priced = priceOrder(shop, s.items.filter((i) => i.shop_id === shop.id), draft);
    const p = dateProblem(shop, draft.due_date, priced.units, dayLoad(s.orders.filter((o) => o.shop_id === shop.id), draft.due_date)); if (p) throw new Error(p);
    const proof_path = proof ? await blobToDataUrl(proof) : null;
    const order = { id: uid(), shop_id: shop.id, code: makeCode(), created_at: new Date().toISOString(), due_date: draft.due_date, fulfilment: draft.fulfilment, zone: draft.fulfilment === "delivery" ? draft.zone : null, address: draft.address || "", customer_name: draft.customer_name.trim(), customer_phone: draft.customer_phone, notes: draft.notes || "", ...priced, proof_path, payment_status: proof ? "submitted" : "none", status: "new", request: null, photos: [], quote_note: "", quote_expires: null };
    s.orders.push(order); save(s); return order;
  },
  async requestCustom(slug, draft, photos = []) {
    const s = load(); const shop = s.shops.find((x) => x.slug === slug);
    if (!shop || !shop.is_open || !shop.custom_enabled) throw new Error("This shop isn't taking custom requests right now.");
    const bad = validateRequest({ ...draft, photos }); if (bad) throw new Error(bad);
    const p = dateProblem(shop, draft.due_date, null, 0, todayPK(), shop.custom_lead_days); if (p) throw new Error(p);
    const fee = deliveryFee(shop, draft);
    const order = { id: uid(), shop_id: shop.id, code: makeCode(), created_at: new Date().toISOString(), due_date: draft.due_date, fulfilment: draft.fulfilment, zone: draft.fulfilment === "delivery" ? draft.zone : null, delivery_fee: fee, address: draft.address || "", customer_name: draft.customer_name.trim(), customer_phone: draft.customer_phone, notes: "", lines: [], subtotal: 0, total: 0, deposit_due: 0, units: 0, proof_path: null, payment_status: "none", status: "request", request: draft.request, photos: await Promise.all(photos.map(blobToDataUrl)), quote_note: "", quote_expires: null };
    s.orders.push(order); save(s); return order;
  },
  async orderByCode(code) {
    const s = load(); const o = findByCode(s, code); if (!o) return null;
    return { order: { ...o, customer_name: o.customer_name.split(" ")[0] }, shop: s.shops.find((x) => x.id === o.shop_id) };
  },
  async acceptQuote(code, proof) {
    const s = load(); const o = findByCode(s, code);
    if (!o || o.status !== "quoted") throw new Error("This quote is no longer open.");
    if (quoteExpired(o)) throw new Error("This quote has expired. Ask the baker for a new one.");
    if (o.deposit_due > 0 && !proof) throw new Error("Upload a screenshot of your payment.");
    const shop = s.shops.find((x) => x.id === o.shop_id);
    const p = dateProblem(shop, o.due_date, Math.max(o.units, 1), dayLoad(s.orders.filter((x) => x.shop_id === shop.id), o.due_date), todayPK(), 0); if (p) throw new Error(p);
    Object.assign(o, { status: "new", proof_path: proof ? await blobToDataUrl(proof) : null, payment_status: proof ? "submitted" : "none" });
    save(s); return o;
  },
  async orders(shopId) { return load().orders.filter((o) => o.shop_id === shopId); },
  async updateOrder(id, patch) { const s = load(); s.orders = s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)); save(s); },
  async proofUrl(path) { return path; },
  /** Demo: other tabs writing to localStorage count as live updates. */
  subscribeOrders(_shopId, cb) { const h = (e) => { if (e.key === KEY_STORE) cb(); }; window.addEventListener("storage", h); return () => window.removeEventListener("storage", h); },
  async feedback(f) { const s = load(); s.feedback.push({ ...f, created_at: new Date().toISOString() }); save(s); },
  reset() { localStorage.removeItem(KEY_STORE); },
};

/* ======================= SUPABASE BACKEND ======================= */
const must = ({ data, error }) => { if (error) throw new Error(error.message); return data; };

async function uploadPrivate(shopId, blob, prefix = "") {
  const path = `${shopId}/${prefix}${uid()}.jpg`;
  must(await sb.storage.from("proofs").upload(path, blob, { contentType: "image/jpeg" }));
  return path;
}
const shopIdFor = async (slug) => must(await sb.from("public_shops").select("id").eq("slug", slug).single()).id;

const live = {
  async session() { const { data } = await sb.auth.getSession(); return data.session ? { email: data.session.user.email, id: data.session.user.id } : null; },
  onAuth(cb) { const { data } = sb.auth.onAuthStateChange((_e, s) => cb(s ? { email: s.user.email, id: s.user.id } : null)); return () => data.subscription.unsubscribe(); },
  async signIn(email) { must(await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/app` } })); return { sent: true }; },
  async signOut() { await sb.auth.signOut(); },
  async myShop() { const { data: u } = await sb.auth.getUser(); if (!u.user) return null; return must(await sb.from("shops").select("*").eq("owner", u.user.id).maybeSingle()); },
  async createShop(data) { const { data: u } = await sb.auth.getUser(); return must(await sb.from("shops").insert({ ...data, owner: u.user.id }).select().single()); },
  async updateShop(id, patch) {
    const r = await sb.from("shops").update(patch).eq("id", id).select().single();
    if (r.error?.code === "23505") throw new Error("That link is taken.");
    return must(r);
  },
  async items(shopId) { return must(await sb.from("items").select("*").eq("shop_id", shopId).order("sort")); },
  async saveItem(item) { const { id, ...rest } = item; must(id ? await sb.from("items").update(rest).eq("id", id) : await sb.from("items").insert(rest)); },
  async deleteItem(id) { must(await sb.from("items").delete().eq("id", id)); },
  async uploadMenuPhoto(shopId, blob) {
    const path = `${shopId}/${uid()}.jpg`;
    must(await sb.storage.from("menu").upload(path, blob, { contentType: "image/jpeg" }));
    return sb.storage.from("menu").getPublicUrl(path).data.publicUrl;
  },
  async publicShop(slug) {
    const shop = must(await sb.from("public_shops").select("*").eq("slug", slug).maybeSingle());
    if (!shop) return null;
    const items = must(await sb.from("items").select("*").eq("shop_id", shop.id).eq("active", true).order("sort"));
    const rows = must(await sb.rpc("day_load", { p_slug: slug }));
    const loadBy = {}; for (const r of rows || []) loadBy[r.day] = r.units;
    return { shop, items, load: loadBy };
  },
  async placeOrder(slug, draft, proof) {
    const bad = validateCustomer(draft); if (bad) throw new Error(bad);
    const proof_path = proof ? await uploadPrivate(await shopIdFor(slug), proof) : null;
    return must(await sb.rpc("place_order", { p_slug: slug, p: { ...draft, proof_path } }));
  },
  async requestCustom(slug, draft, photos = []) {
    const bad = validateRequest({ ...draft, photos }); if (bad) throw new Error(bad);
    const shopId = photos.length ? await shopIdFor(slug) : null;
    const paths = [];
    for (const p of photos) paths.push(await uploadPrivate(shopId, p, "ref-"));
    return must(await sb.rpc("request_custom", { p_slug: slug, p: { ...draft, photos: paths } }));
  },
  async orderByCode(code) { return must(await sb.rpc("order_status", { p_code: code })); },
  async acceptQuote(code, proof) {
    const info = must(await sb.rpc("order_status", { p_code: code }));
    if (!info) throw new Error("This quote is no longer open.");
    const path = proof ? await uploadPrivate(info.shop.id, proof) : null;
    return must(await sb.rpc("accept_quote", { p_code: code, p_proof: path }));
  },
  async orders(shopId) { return must(await sb.from("orders").select("*").eq("shop_id", shopId).order("due_date")); },
  async updateOrder(id, patch) { must(await sb.from("orders").update(patch).eq("id", id)); },
  async proofUrl(path) { if (!path) return null; const r = await sb.storage.from("proofs").createSignedUrl(path, 600); return r.data?.signedUrl || null; },
  subscribeOrders(shopId, cb) {
    const ch = sb.channel(`orders-${shopId}`).on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `shop_id=eq.${shopId}` }, () => cb()).subscribe();
    return () => { sb.removeChannel(ch); };
  },
  async feedback(f) { must(await sb.from("feedback").insert(f)); },
  reset() {},
};

export const api = DEMO ? demo : live;
