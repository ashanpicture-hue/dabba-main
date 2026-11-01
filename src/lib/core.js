// Pure business logic shared by the demo backend, the UI and the tests.
// The same rules run again in Postgres (supabase/schema.sql) so the browser can't fake them.

export const MAX_DAYS_AHEAD = 60;
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** Statuses that take up a day's baking capacity. Requests and open quotes don't. */
export const BOOKED = ["new", "confirmed", "ready", "delivered"];

const pad = (n) => String(n).padStart(2, "0");

export function todayPK(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function addDays(ymd, n) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function dayOfWeek(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function daysBetween(a, b) {
  const t = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((t(b) - t(a)) / 86400000);
}

export function fmtDate(ymd, opts = { weekday: "short", day: "numeric", month: "short" }) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

export function fmtDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Karachi", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export const rs = (n) => "Rs " + Math.round(Number(n) || 0).toLocaleString("en-PK");

export function normalizePhone(input) {
  let d = String(input || "").replace(/\D/g, "");
  if (d.startsWith("0092")) d = d.slice(2);
  if (d.startsWith("92")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return /^3\d{9}$/.test(d) ? "92" + d : null;
}

export const displayPhone = (p) => { const n = normalizePhone(p); return n ? `0${n.slice(2, 5)} ${n.slice(5)}` : p || ""; };

export function waLink(phone, text) {
  const n = normalizePhone(phone);
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return n ? `https://wa.me/${n}${q}` : null;
}

export function slugify(s) {
  return String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

/* ---------- days and capacity ---------- */

/** A day's real capacity after per-date overrides (extra slots for Eid, a blocked holiday). */
export function effectiveDay(shop, ymd) {
  const o = (shop.date_overrides || {})[ymd];
  if (o?.closed) return { closed: true, capacity: 0, override: true };
  if (o && o.capacity !== undefined && o.capacity !== "" && Number.isFinite(Number(o.capacity))) return { closed: false, capacity: Number(o.capacity), override: true };
  return { closed: (shop.closed_days || []).includes(dayOfWeek(ymd)), capacity: shop.capacity, override: false };
}

/** Why a date can't be booked, or null. `units` null means only check the date, not capacity. */
export function dateProblem(shop, ymd, units, load, today = todayPK(), leadDays = shop.lead_days ?? 0) {
  const ahead = daysBetween(today, ymd);
  if (ahead < leadDays) return `Orders need ${leadDays} day${leadDays === 1 ? "" : "s"} notice.`;
  if (ahead > MAX_DAYS_AHEAD) return "That date is too far ahead.";
  const d = effectiveDay(shop, ymd);
  if (d.closed) return "Closed that day.";
  if (units !== null && (load || 0) + Math.max(units, 1) > d.capacity) return "Fully booked that day.";
  return null;
}

export function availableDates(shop, loadByDate, units, count = 21, today = todayPK(), leadDays = shop.lead_days ?? 0) {
  const out = [];
  for (let i = leadDays; out.length < count && i <= MAX_DAYS_AHEAD; i++) {
    const ymd = addDays(today, i);
    const load = loadByDate[ymd] || 0;
    const d = effectiveDay(shop, ymd);
    out.push({ ymd, load, left: Math.max(d.capacity - load, 0), problem: dateProblem(shop, ymd, units, load, today, leadDays) });
  }
  return out;
}

/* ---------- items, options, pricing ---------- */

/** Apply chosen options to an item. `sel` is { [groupName]: choiceLabel }. */
export function configureLine(item, sel = {}, message = "") {
  let price = Number(item.price) || 0, units = Number(item.units) || 1;
  const choices = [];
  for (const g of item.options || []) {
    const label = sel?.[g.name];
    if (!label) {
      if (g.required !== false) throw new Error(`Choose ${String(g.name).toLowerCase()} for ${item.name}.`);
      continue;
    }
    const c = (g.choices || []).find((x) => x.label === label);
    if (!c) throw new Error(`That ${String(g.name).toLowerCase()} isn't available for ${item.name}.`);
    price += Number(c.price) || 0;
    units += Number(c.units) || 0;
    choices.push({ group: g.name, label: c.label });
  }
  const msg = item.allow_message ? String(message || "").trim().slice(0, 60) : "";
  return { price, units: Math.max(units, 1), choices, message: msg };
}

export const needsPicker = (item) => (item.options || []).length > 0 || !!item.allow_message;

export function lineLabel(l) {
  const extra = (l.choices || []).map((c) => c.label).join(", ");
  return `${l.name}${extra ? ` (${extra})` : ""}${l.message ? ` · “${l.message}”` : ""}`;
}

/** Price an order from the shop's own items. Never trust prices sent by the browser. */
export function priceOrder(shop, items, draft) {
  const byId = new Map(items.filter((i) => i.active).map((i) => [i.id, i]));
  const lines = [];
  for (const l of draft.lines || []) {
    const qty = Math.floor(Number(l.qty));
    if (!qty) continue;
    if (qty < 1 || qty > 50) throw new Error("Choose between 1 and 50 of each item.");
    const it = byId.get(l.item_id);
    if (!it) throw new Error("One of the items is no longer available. Refresh and try again.");
    const cfg = configureLine(it, l.choices, l.message);
    lines.push({ item_id: it.id, name: it.name, price: cfg.price, qty, units: cfg.units, choices: cfg.choices, message: cfg.message });
  }
  if (!lines.length) throw new Error("Add at least one item.");
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const units = lines.reduce((s, l) => s + l.units * l.qty, 0);
  const delivery_fee = deliveryFee(shop, draft);
  const total = subtotal + delivery_fee;
  return { lines, subtotal, units, delivery_fee, total, deposit_due: deposit(shop, total) };
}

export function deliveryFee(shop, draft) {
  if (draft.fulfilment === "delivery") {
    const zone = (shop.delivery_zones || []).find((z) => z.name === draft.zone);
    if (!zone) throw new Error("Choose a delivery area.");
    return Number(zone.fee) || 0;
  }
  if (draft.fulfilment !== "pickup" || !shop.pickup_enabled) throw new Error("Choose pickup or delivery.");
  return 0;
}

export const deposit = (shop, total) => Math.ceil((total * (shop.deposit_pct ?? 100)) / 100);

/* ---------- custom cake requests and quotes ---------- */

export const OCCASIONS = ["Birthday", "Anniversary", "Eid", "Wedding or event", "Baby shower", "Other"];

export function validateCustomer(c) {
  if (!String(c.customer_name || "").trim()) return "Enter your name.";
  if (!normalizePhone(c.customer_phone)) return "Enter a Pakistani mobile number, like 0300 1234567.";
  if (c.fulfilment === "delivery" && String(c.address || "").trim().length < 8) return "Enter the full delivery address.";
  return null;
}

export function validateRequest(r) {
  if (!r.due_date) return "Pick the date you need it.";
  if (String(r.request?.details || "").trim().length < 10) return "Describe the cake you want in a sentence or two.";
  if ((r.photos || []).length > 3) return "Add up to 3 photos.";
  return validateCustomer(r);
}

/** What the baker's quote means for the customer. */
export function quoteFigures(shop, quote, delivery_fee) {
  const q = Math.round(Number(quote) || 0);
  const total = q + (Number(delivery_fee) || 0);
  return { subtotal: q, total, deposit_due: deposit(shop, total) };
}

export const quoteExpired = (o, now = Date.now()) => o.status === "quoted" && !!o.quote_expires && new Date(o.quote_expires).getTime() < now;

/* ---------- statuses and messages ---------- */

export const STATUS = {
  request: "Request", quoted: "Quote sent", new: "New", confirmed: "Confirmed",
  ready: "Ready", delivered: "Delivered", cancelled: "Cancelled", declined: "Declined",
};
export const PAY = { none: "No proof", submitted: "Check payment", verified: "Paid", rejected: "Payment issue" };

/** Steps a customer sees on the order status page. */
export function timeline(o) {
  const custom = !!o.request;
  const steps = [
    ...(custom ? [["request", "Request sent"], ["quoted", "Price quoted"]] : []),
    ["new", "Order placed"], ["confirmed", "Confirmed by baker"],
    ["ready", o.fulfilment === "delivery" ? "Out for delivery" : "Ready for pickup"], ["delivered", "Done"],
  ];
  const order = steps.map((s) => s[0]);
  const at = order.indexOf(o.status);
  return steps.map(([k, label], i) => ({ key: k, label, done: at >= 0 && i <= at }));
}

const lineText = (o) => (o.lines || []).map((l) => `${l.qty} × ${lineLabel(l)}`).join(", ");
export const statusUrl = (origin, o) => `${origin}/o/${o.code}`;

export function messages(shop, o, origin = "") {
  const when = fmtDate(o.due_date, { weekday: "long", day: "numeric", month: "long" });
  const how = o.fulfilment === "delivery" ? `delivery to ${o.zone}` : "pickup";
  const track = origin ? ` Track it here: ${statusUrl(origin, o)}` : "";
  const balance = o.deposit_due < o.total ? `, ${rs(o.total - o.deposit_due)} due on ${o.fulfilment === "delivery" ? "delivery" : "pickup"}` : ", fully paid";
  return {
    confirm: `Hi ${o.customer_name}, your ${shop.name} order ${o.code} is confirmed: ${lineText(o)} for ${how} on ${when}. Total ${rs(o.total)}${balance}. Thank you!${track}`,
    payment: `Hi ${o.customer_name}, we couldn't match your payment for order ${o.code} (${rs(o.deposit_due)}). Could you send the transfer screenshot again?${track}`,
    reminder: `Hi ${o.customer_name}, a reminder that your ${shop.name} order ${o.code} is for ${how} tomorrow, ${when}.${o.fulfilment === "pickup" && shop.pickup_address ? ` Pickup: ${shop.pickup_address}.` : ""}`,
    ready: o.fulfilment === "delivery" ? `Hi ${o.customer_name}, your order ${o.code} is on its way!` : `Hi ${o.customer_name}, your order ${o.code} is ready for pickup${shop.pickup_address ? ` at ${shop.pickup_address}` : ""}.`,
    thanks: `Thank you for ordering from ${shop.name}, ${o.customer_name}! We'd love a quick review or a tag on Instagram${shop.instagram ? ` @${shop.instagram}` : ""}.`,
    quote: `Hi ${o.customer_name}, thanks for your cake request ${o.code} for ${when}. The price is ${rs(o.subtotal)}${o.delivery_fee ? ` plus ${rs(o.delivery_fee)} delivery` : ""}${o.quote_note ? ` (${o.quote_note})` : ""}. To book the date, pay ${rs(o.deposit_due)} and upload the screenshot here: ${statusUrl(origin, o)}${o.quote_expires ? ` This price holds until ${fmtDateTime(o.quote_expires)}.` : ""}`,
    declined: `Hi ${o.customer_name}, thank you for your cake request ${o.code}. Sorry, we can't take it for ${when}.`,
  };
}

export function customerMessage(shop, o, origin = "") {
  if (o.status === "request") return `Hi ${shop.name}, I just sent a custom cake request ${o.code} on Dabba for ${fmtDate(o.due_date)}. ${o.request?.details || ""}`.trim();
  return `Hi ${shop.name}, I just placed order ${o.code} on Dabba: ${lineText(o)} for ${fmtDate(o.due_date)} (${o.fulfilment}). Total ${rs(o.total)}, paid ${rs(o.deposit_due)}${o.proof_path ? " (screenshot uploaded)" : ""}.${origin ? ` ${statusUrl(origin, o)}` : ""}`;
}

/** Item totals for a day's baking, split by option so the baker sees "2 × Tart (10 inch)". */
export function prepList(orders, ymd) {
  const totals = new Map();
  for (const o of orders) {
    if (o.due_date !== ymd || !BOOKED.includes(o.status)) continue;
    for (const l of o.lines || []) { const k = lineLabel({ ...l, message: "" }); totals.set(k, (totals.get(k) || 0) + l.qty); }
  }
  return [...totals.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
}

export function dayLoad(orders, ymd) {
  return orders.filter((o) => o.due_date === ymd && BOOKED.includes(o.status)).reduce((s, o) => s + (o.units || 0), 0);
}

/** Orders the baker should look at now. */
export const needsAction = (o) => o.status === "request" || o.status === "new" || (o.payment_status === "submitted" && BOOKED.includes(o.status));

export function costing(rows, yieldPieces, packaging, price) {
  const ingredients = rows.reduce((s, r) => {
    const pack = Number(r.pack_price) || 0, size = Number(r.pack_size) || 0, used = Number(r.used) || 0;
    return s + (size > 0 ? (pack / size) * used : 0);
  }, 0);
  const pieces = Math.max(Number(yieldPieces) || 1, 1);
  const perPiece = ingredients / pieces + (Number(packaging) || 0);
  const p = Number(price) || 0;
  return { ingredients, perPiece, profit: p - perPiece, margin: p > 0 ? (p - perPiece) / p : 0 };
}

export function makeCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const r = (typeof crypto !== "undefined" && crypto.getRandomValues) ? crypto.getRandomValues(new Uint32Array(6)) : Array.from({ length: 6 }, () => Math.random() * 2 ** 32);
  for (const x of r) s += a[x % a.length];
  return s;
}
