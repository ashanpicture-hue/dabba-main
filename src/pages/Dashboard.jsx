import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Alert, AlertTitle, AlertDescription, AlertActions } from "../components/ui/alert.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useNavigate, Link } from "react-router-dom";
import { api, DEMO, shrinkImage } from "../lib/api.js";
import {
  todayPK, addDays, fmtDate, fmtDateTime, rs, waLink, messages, prepList, costing, slugify, displayPhone, lineLabel,
  DAY_NAMES, needsAction, quoteFigures, quoteExpired, effectiveDay, dayLoad, statusUrl,
} from "../lib/core.js";
import { payChip, statusChip } from "../components/Parts.jsx";
import Feedback from "../components/Feedback.jsx";
import { setPageSEO } from "../lib/seo.js";

const TABS = [["orders", "Orders"], ["prep", "Baking list"], ["menu", "Menu"], ["shop", "Shop settings"], ["cost", "Costing"]];

export default function Dashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(undefined);
  const [shop, setShop] = useState(undefined);
  const [tab, setTab] = useState(() => { try { return localStorage.getItem("dabba-tab") || "orders"; } catch { return "orders"; } });

  useEffect(() => {
    setPageSEO({
      title: "Dashboard · Dabba Baker Dashboard",
      description: "Your Dabba baker dashboard. Live order alerts, daily baking list, menu editor, recipe costing, and shop settings.",
      canonical: "https://dabba.devs.surf/app",
      noIndex: true,
    });
  }, []);

  useEffect(() => { api.session().then(setUser); return api.onAuth(setUser); }, []);
  useEffect(() => { if (user === null) nav("/login"); if (user) api.myShop().then(setShop).catch(() => setShop(null)); }, [user, nav]);
  useEffect(() => { try { localStorage.setItem("dabba-tab", tab); } catch {} }, [tab]);

  if (user === undefined || (user && shop === undefined)) return <div className="wrap" style={{ paddingBlock: 48 }}><p className="muted">Loading…</p></div>;
  if (!user) return null;
  if (!shop) return <Setup onDone={setShop} />;
  return <Workspace shop={shop} setShop={setShop} tab={tab} setTab={setTab} onSignOut={async () => { await api.signOut(); nav("/"); }} />;
}

/* ---------------- live orders + alerts ---------------- */

function useLiveOrders(shopId) {
  const [orders, setOrders] = useState(null);
  const refresh = useCallback(() => api.orders(shopId).then(setOrders).catch(() => {}), [shopId]);
  useEffect(() => {
    refresh();
    const unsub = api.subscribeOrders(shopId, refresh);
    const t = setInterval(refresh, 30000);
    const onVis = () => { if (!document.hidden) refresh(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { unsub(); clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, [shopId, refresh]);
  return [orders, refresh];
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18].forEach((at) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.15);
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + 0.16);
    });
  } catch {}
}

const alertKey = (o) => `${o.id}:${o.status}:${o.payment_status}`;
function describe(o) {
  if (o.status === "request") return `Custom cake request from ${o.customer_name} for ${fmtDate(o.due_date)}`;
  if (o.status === "new" && o.request) return `${o.customer_name} accepted your quote for ${fmtDate(o.due_date)}`;
  if (o.status === "new") return `New order ${o.code} from ${o.customer_name}, ${rs(o.total)} for ${fmtDate(o.due_date)}`;
  return `Payment screenshot from ${o.customer_name} for ${o.code}`;
}

/** Sound, a browser notification and an on-page banner when something needs the baker. Works while the dashboard is open. */
function useAlerts(orders, shopName) {
  const seen = useRef(null);
  const [toast, setToast] = useState(null);
  const [perm, setPerm] = useState(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));
  const count = (orders || []).filter(needsAction).length;

  useEffect(() => { document.title = `${count ? `(${count}) ` : ""}${shopName} · Dabba`; return () => { document.title = "Dabba"; }; }, [count, shopName]);
  useEffect(() => {
    if (!orders) return;
    const keys = new Set(orders.filter(needsAction).map(alertKey));
    if (seen.current) {
      const fresh = orders.filter((o) => needsAction(o) && !seen.current.has(alertKey(o)));
      if (fresh.length) {
        const text = fresh.length === 1 ? describe(fresh[0]) : `${fresh.length} orders need you`;
        setToast(text); beep();
        if (perm === "granted") { try { new Notification("Dabba", { body: text, tag: "dabba-orders" }); } catch {} }
      }
    }
    seen.current = keys;
  }, [orders, perm]);

  const enable = async () => { if (typeof Notification === "undefined") return; setPerm(await Notification.requestPermission()); beep(); };
  return { toast, clearToast: () => setToast(null), perm, enable, count };
}

function Workspace({ shop, setShop, tab, setTab, onSignOut }) {
  const [orders, refresh] = useLiveOrders(shop.id);
  const alerts = useAlerts(orders, shop.name);
  const link = `${location.origin}/s/${shop.slug}`;
  return (
    <div className="wrap" style={{ paddingBottom: 100 }}>
      <div className="topbar">
        <Link to="/" className="logo">Dabba</Link>
        <div className="row">
          <a className="btn sm" href={link} target="_blank" rel="noreferrer">View order page</a>
          <button className="btn sm ghost" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
      <h2 style={{ marginBottom: 4 }}>{shop.name}</h2>
      <ShareLink link={link} />
      <AlertBar alerts={alerts} />
      {alerts.toast && (
        <div style={{ marginTop: 12 }}>
          <Alert variant="success" role="status">
            <AlertTitle>Needs you</AlertTitle>
            <AlertDescription>{alerts.toast}</AlertDescription>
            <AlertActions>
              <button className="btn sm" onClick={() => { setTab("orders"); alerts.clearToast(); }}>Show</button>
              <button className="btn sm ghost" onClick={alerts.clearToast}>Dismiss</button>
            </AlertActions>
          </Alert>
        </div>
      )}
      <div className="tabs" role="tablist" style={{ margin: "18px 0" }}>
        {TABS.map(([k, t]) => <button key={k} role="tab" className="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{t}{k === "orders" && alerts.count ? ` (${alerts.count})` : ""}</button>)}
      </div>
      {tab === "orders" && <Orders shop={shop} orders={orders} refresh={refresh} />}
      {tab === "prep" && <Prep shop={shop} orders={orders} />}
      {tab === "menu" && <Menu shop={shop} />}
      {tab === "shop" && <Settings shop={shop} onSaved={setShop} />}
      {tab === "cost" && <Costing shop={shop} />}
      {DEMO && <p className="small muted" style={{ marginTop: 32 }}>Demo data. <button className="btn sm ghost" onClick={() => { api.reset(); location.reload(); }}>Reset demo</button></p>}
      <Feedback role="baker" shopId={shop.id} prompt="What would make Dabba more useful for your bakery?" />
    </div>
  );
}

function AlertBar({ alerts }) {
  const wrap = { marginTop: 12 };
  if (alerts.perm === "unsupported") return <div style={wrap}><Alert><AlertDescription>New orders appear here automatically and play a sound while this page is open.</AlertDescription></Alert></div>;
  if (alerts.perm === "granted") return <div style={wrap}><Alert variant="success"><AlertTitle>Order alerts are on</AlertTitle><AlertDescription>Keep this page open on your phone or computer to hear new orders.</AlertDescription></Alert></div>;
  const denied = alerts.perm === "denied";
  return (
    <div style={wrap}>
      <Alert variant={denied ? "warning" : "default"}>
        <AlertTitle>{denied ? "Notifications are blocked" : "Turn on order alerts"}</AlertTitle>
        <AlertDescription>{denied ? "Allow them in your browser settings. You'll still hear a sound on this page." : "Get a sound and a notification when an order or request comes in."}</AlertDescription>
        {!denied && <AlertActions><button className="btn sm primary" onClick={alerts.enable}>Turn on</button></AlertActions>}
      </Alert>
    </div>
  );
}

function ShareLink({ link }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };
  return (
    <div className="row small" style={{ gap: 8 }}>
      <span className="muted">Your order link:</span>
      <code style={{ wordBreak: "break-all" }}>{link}</code>
      <button className="btn sm" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      <span className="muted">Put it in your Instagram bio.</span>
    </div>
  );
}

/* ---------------- Setup ---------------- */
function Setup({ onDone }) {
  const [f, setF] = useState({ name: "", slug: "", whatsapp: "", instagram: "" });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { const v = e.target.value; if (k === "slug") setTouched(true); setF((x) => ({ ...x, [k]: v, ...(k === "name" && !touched ? { slug: slugify(v) } : {}) })); };
  async function save(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const shop = await api.createShop({ ...f, slug: slugify(f.slug), instagram: f.instagram.replace(/^@/, ""), capacity: 6, lead_days: 2, closed_days: [], date_overrides: {}, deposit_pct: 100, payment_info: "", pickup_enabled: true, pickup_address: "", delivery_zones: [], custom_enabled: false, custom_lead_days: 5, custom_note: "", is_open: true, tagline: "", city: "Karachi" });
      onDone(shop);
    } catch (err) { setError(/duplicate|unique/i.test(err.message) ? "That link is taken. Try another." : err.message); } finally { setBusy(false); }
  }
  return (
    <div className="wrap narrow" style={{ paddingBlock: 40 }}>
      <form className="card stack" onSubmit={save}>
        <h2>Set up your bakery</h2>
        <label htmlFor="s-name">Bakery name<input id="s-name" required value={f.name} onChange={set("name")} /></label>
        <label htmlFor="s-slug">Order link<input id="s-slug" required value={f.slug} onChange={set("slug")} /><span className="small muted">{location.origin}/s/{slugify(f.slug) || "your-bakery"}</span></label>
        <label htmlFor="s-wa">WhatsApp number for orders<input id="s-wa" required value={f.whatsapp} onChange={set("whatsapp")} inputMode="tel" placeholder="0300 1234567" /></label>
        <label htmlFor="s-ig">Instagram handle<input id="s-ig" value={f.instagram} onChange={set("instagram")} placeholder="Optional" /></label>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <button className="btn primary" disabled={busy}>Create my order link</button>
      </form>
    </div>
  );
}

/* ---------------- Orders ---------------- */
const FILTERS = [
  ["action", "Needs action", (o) => needsAction(o)],
  ["requests", "Custom requests", (o) => ["request", "quoted"].includes(o.status)],
  ["upcoming", "Upcoming", (o, t) => o.due_date >= t && ["new", "confirmed", "ready"].includes(o.status)],
  ["past", "Done & cancelled", (o, t) => o.due_date < t || ["delivered", "cancelled", "declined"].includes(o.status)],
  ["all", "All", () => true],
];

function Orders({ shop, orders, refresh }) {
  const [filter, setFilter] = useState("action");
  const today = todayPK();
  if (!orders) return <p className="muted">Loading orders…</p>;
  const pass = FILTERS.find((x) => x[0] === filter)[2];
  const shown = orders.filter((o) => pass(o, today)).sort((a, b) => (a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : a.created_at < b.created_at ? -1 : 1));
  return (
    <div className="stack">
      <div className="tabs">
        {FILTERS.map(([k, t, fn]) => { const n = orders.filter((o) => fn(o, today)).length; return <button key={k} className="tab" aria-selected={filter === k} onClick={() => setFilter(k)}>{t}{k !== "all" && n ? ` (${n})` : ""}</button>; })}
      </div>
      <div className="card">
        {shown.length === 0 && <span className="muted">{filter === "action" ? "You're all caught up." : "Nothing here yet. Share your order link to get orders."}</span>}
        {shown.map((o) => <OrderRow key={o.id} o={o} shop={shop} onChange={refresh} />)}
      </div>
    </div>
  );
}

function Photos({ paths }) {
  const [urls, setUrls] = useState(null);
  if (!paths?.length) return null;
  if (!urls) return <button className="btn sm" style={{ justifySelf: "start" }} onClick={async () => setUrls(await Promise.all(paths.map((p) => api.proofUrl(p))))}>View {paths.length} inspiration photo{paths.length > 1 ? "s" : ""}</button>;
  return <div className="row">{urls.filter(Boolean).map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer"><img src={u} alt={`Inspiration ${i + 1}`} className="thumb" style={{ width: 96, height: 96 }} /></a>)}</div>;
}

function QuoteForm({ o, shop, onDone, onCancel }) {
  const [price, setPrice] = useState(o.subtotal || "");
  const [slots, setSlots] = useState(o.units || 2);
  const [note, setNote] = useState(o.quote_note || "");
  const [hours, setHours] = useState(48);
  const [error, setError] = useState("");
  const fig = quoteFigures(shop, price, o.delivery_fee);
  const day = effectiveDay(shop, o.due_date);
  async function send(e) {
    e.preventDefault(); setError("");
    const q = Math.round(Number(price)), u = Math.round(Number(slots));
    if (!(q > 0)) return setError("Enter the price in rupees.");
    if (!(u >= 1 && u <= 50)) return setError("Slots must be between 1 and 50.");
    const occasion = o.request?.occasion || "Custom";
    const patch = {
      status: "quoted", quote_note: note.trim(), quote_expires: new Date(Date.now() + Number(hours) * 3600e3).toISOString(), units: u,
      lines: [{ item_id: null, name: `Custom cake (${occasion.toLowerCase()})`, price: q, qty: 1, units: u, choices: [], message: "" }],
      ...fig,
    };
    window.open(waLink(o.customer_phone, messages(shop, { ...o, ...patch }, location.origin).quote), "_blank", "noopener");
    await api.updateOrder(o.id, patch);
    onDone();
  }
  return (
    <form className="sunk stack" onSubmit={send}>
      <b>Send a price</b>
      <div className="grid2">
        <label htmlFor={`qp-${o.id}`}>Cake price (Rs)<input id={`qp-${o.id}`} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <label htmlFor={`qs-${o.id}`}>Slots it uses<input id={`qs-${o.id}`} inputMode="numeric" value={slots} onChange={(e) => setSlots(e.target.value)} /><span className="small muted">{fmtDate(o.due_date)} has {day.closed ? "no" : day.capacity} slots in total.</span></label>
      </div>
      <label htmlFor={`qn-${o.id}`}>Note to the customer<input id={`qn-${o.id}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. 3 lb two-tier, fondant topper included" /></label>
      <label htmlFor={`qh-${o.id}`}>Price holds for
        <select id={`qh-${o.id}`} value={hours} onChange={(e) => setHours(e.target.value)}><option value={24}>24 hours</option><option value={48}>48 hours</option><option value={72}>3 days</option></select>
      </label>
      {fig.total > 0 && <div className="small">Customer pays {rs(fig.total)}{o.delivery_fee ? ` including ${rs(o.delivery_fee)} delivery` : ""}. Advance {rs(fig.deposit_due)}.</div>}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="row"><button className="btn primary sm">Send price on WhatsApp</button>{onCancel && <button type="button" className="btn sm ghost" onClick={onCancel}>Cancel</button>}</div>
    </form>
  );
}

function OrderRow({ o, shop, onChange }) {
  const [proof, setProof] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const msg = messages(shop, o, location.origin);
  const wa = (k) => waLink(o.customer_phone, msg[k]);
  const update = async (patch, open) => { if (open) window.open(open, "_blank", "noopener"); await api.updateOrder(o.id, patch); onChange(); };
  const tomorrow = addDays(todayPK(), 1);
  const isCustom = !!o.request;
  const expired = quoteExpired(o);
  return (
    <div className="order">
      <div className="row between">
        <div className="row" style={{ gap: 8 }}><b style={{ letterSpacing: ".05em" }}>{o.code}</b>{statusChip(o.status)}{["new", "confirmed", "ready", "delivered"].includes(o.status) && payChip(o.payment_status)}{expired && <span className="chip bad">Quote expired</span>}</div>
        <b>{fmtDate(o.due_date)}{o.due_date === tomorrow ? " · tomorrow" : ""}</b>
      </div>
      {isCustom && (
        <div className="stack" style={{ gap: 4 }}>
          <div className="small muted">{[o.request.occasion, o.request.servings, o.request.flavour].filter(Boolean).join(" · ")}</div>
          <div>{o.request.details}</div>
        </div>
      )}
      {(o.lines || []).length > 0 && <div>{o.lines.map((l) => `${l.qty} × ${lineLabel(l)}`).join(", ")}</div>}
      <dl className="kv">
        <dt>Customer</dt><dd>{o.customer_name} · {displayPhone(o.customer_phone)}</dd>
        <dt>{o.fulfilment === "delivery" ? "Delivery" : "Pickup"}</dt><dd>{o.fulfilment === "delivery" ? `${o.zone} · ${o.address}` : shop.pickup_address || "Pickup"}</dd>
        {o.total > 0 && <><dt>Money</dt><dd>Total {rs(o.total)} · advance {rs(o.deposit_due)}{o.deposit_due < o.total ? ` · ${rs(o.total - o.deposit_due)} on ${o.fulfilment === "delivery" ? "delivery" : "pickup"}` : ""}</dd></>}
        {o.status === "quoted" && o.quote_expires && <><dt>Price holds</dt><dd>until {fmtDateTime(o.quote_expires)}</dd></>}
        {o.notes && <><dt>Note</dt><dd>{o.notes}</dd></>}
      </dl>
      <Photos paths={o.photos} />
      {o.proof_path && (proof ? <a href={proof} target="_blank" rel="noreferrer"><img src={proof} alt="Payment screenshot" className="thumb" style={{ width: 120, height: "auto" }} /></a>
        : <button className="btn sm" style={{ justifySelf: "start" }} onClick={async () => setProof(await api.proofUrl(o.proof_path))}>View payment screenshot</button>)}

      {(o.status === "request" || quoting) && <QuoteForm o={o} shop={shop} onDone={() => { setQuoting(false); onChange(); }} onCancel={o.status === "quoted" ? () => setQuoting(false) : null} />}

      <div className="row" style={{ gap: 8 }}>
        {o.status === "request" && <button className="btn sm ghost" onClick={() => update({ status: "declined" }, wa("declined"))}>Decline</button>}
        {o.status === "quoted" && !quoting && <><a className="btn sm" href={wa("quote")} target="_blank" rel="noreferrer">Resend price</a><button className="btn sm" onClick={() => setQuoting(true)}>Change price</button><button className="btn sm ghost" onClick={() => update({ status: "declined" })}>Withdraw</button></>}
        {o.payment_status === "submitted" && <><button className="btn sm" onClick={() => update({ payment_status: "verified" })}>Payment received</button><button className="btn sm" onClick={() => update({ payment_status: "rejected" }, wa("payment"))}>Payment not found</button></>}
        {o.status === "new" && <button className="btn sm primary" onClick={() => update({ status: "confirmed" }, wa("confirm"))}>Confirm on WhatsApp</button>}
        {o.status === "confirmed" && <a className="btn sm" href={wa("reminder")} target="_blank" rel="noreferrer">Send reminder</a>}
        {o.status === "confirmed" && <button className="btn sm" onClick={() => update({ status: "ready" }, wa("ready"))}>{o.fulfilment === "delivery" ? "Out for delivery" : "Ready for pickup"}</button>}
        {o.status === "ready" && <button className="btn sm" onClick={() => update({ status: "delivered" }, wa("thanks"))}>Done, say thanks</button>}
        {["new", "confirmed", "ready"].includes(o.status) && <button className="btn sm ghost" onClick={() => setConfirmCancel(true)}>Cancel</button>}
        <a className="btn sm ghost" href={waLink(o.customer_phone)} target="_blank" rel="noreferrer">Chat</a>
        <a className="btn sm ghost" href={statusUrl(location.origin, o)} target="_blank" rel="noreferrer">Customer view</a>
      </div>
      {confirmCancel && <ConfirmDialog title={`Cancel order ${o.code}?`} description="The date's slots open again. Tell the customer on WhatsApp if you haven't already." confirmLabel="Cancel order" onCancel={() => setConfirmCancel(false)} onConfirm={() => { setConfirmCancel(false); update({ status: "cancelled" }); }} />}
    </div>
  );
}

/* ---------------- Baking list ---------------- */
function Prep({ shop, orders }) {
  const today = todayPK();
  const [day, setDay] = useState(addDays(today, 1));
  if (!orders) return <p className="muted">Loading…</p>;
  const list = prepList(orders, day);
  const dayOrders = orders.filter((o) => o.due_date === day && ["new", "confirmed", "ready", "delivered"].includes(o.status));
  const cap = effectiveDay(shop, day);
  return (
    <div className="grid2" style={{ alignItems: "start" }}>
      <div className="card stack">
        <div className="tabs">{[0, 1, 2, 3, 4, 5, 6].map((i) => { const d = addDays(today, i); return <button key={d} className="tab" aria-selected={day === d} onClick={() => setDay(d)}>{i === 0 ? "Today" : i === 1 ? "Tomorrow" : fmtDate(d, { weekday: "short", day: "numeric" })}</button>; })}</div>
        <h3>To bake for {fmtDate(day, { weekday: "long", day: "numeric", month: "short" })}</h3>
        <p className="small muted" style={{ margin: 0 }}>{cap.closed ? "Closed this day." : `${dayLoad(orders, day)} of ${cap.capacity} slots booked${cap.override ? " (special day)" : ""}`}</p>
        {list.length === 0 ? <p className="muted">Nothing booked.</p> : (
          <table><thead><tr><th>Item</th><th>Qty</th></tr></thead><tbody>{list.map((r) => <tr key={r.name}><td>{r.name}</td><td><b>{r.qty}</b></td></tr>)}</tbody></table>
        )}
      </div>
      <div className="card stack">
        <h3>Orders that day</h3>
        {dayOrders.length === 0 && <p className="muted">None.</p>}
        {dayOrders.map((o) => (
          <div key={o.id} className="stack small" style={{ gap: 2 }}>
            <div className="row between"><span><b>{o.code}</b> · {o.customer_name} · {o.fulfilment === "delivery" ? o.zone : "pickup"}</span>{statusChip(o.status)}</div>
            {(o.lines || []).filter((l) => l.message).map((l, i) => <span key={i} className="muted">Message: “{l.message}”</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Menu ---------------- */
function Menu({ shop }) {
  const [items, setItems] = useState(null);
  const [edit, setEdit] = useState(null);
  const load = useCallback(() => api.items(shop.id).then(setItems), [shop.id]);
  useEffect(() => { load(); }, [load]);
  if (!items) return <p className="muted">Loading…</p>;
  return (
    <div className="stack">
      <div className="row between"><p className="muted" style={{ margin: 0 }}>Prices show on your order page. "Slots" is how much of a day's baking capacity one item uses.</p>
        <button className="btn primary sm" onClick={() => setEdit({ name: "", description: "", price: "", units: 1, image_url: "", active: true, shop_id: shop.id, options: [], allow_message: false })}>Add item</button></div>
      {edit && <ItemForm shop={shop} item={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
      <div className="card">
        {items.length === 0 && <p className="muted">No items yet.</p>}
        {items.map((it) => (
          <div key={it.id} className="order">
            <div className="row between">
              <div className="row" style={{ alignItems: "flex-start" }}>
                {it.image_url ? <img src={it.image_url} alt="" className="thumb" /> : <div className="thumb sunk" aria-hidden="true" />}
                <div><b>{it.name}</b> {!it.active && <span className="chip">Hidden</span>}
                  <div className="small muted">{rs(it.price)} · {it.units} slot{it.units > 1 ? "s" : ""}{(it.options || []).length ? ` · ${(it.options || []).map((g) => g.name).join(", ")}` : ""}{it.allow_message ? " · message on cake" : ""}</div></div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn sm" onClick={() => setEdit(it)}>Edit</button>
                <button className="btn sm ghost" onClick={async () => { await api.saveItem({ id: it.id, active: !it.active }); load(); }}>{it.active ? "Hide" : "Show"}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionsEditor({ options, setOptions }) {
  const setGroup = (gi, patch) => setOptions(options.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  const setChoice = (gi, ci, patch) => setGroup(gi, { choices: options[gi].choices.map((c, i) => (i === ci ? { ...c, ...patch } : c)) });
  return (
    <div className="stack">
      <b className="small">Options customers choose</b>
      {options.length === 0 && <span className="small muted">For example Size (1 lb, 2 lb) or Flavour. Each choice can add to the price and the slots.</span>}
      {options.map((g, gi) => (
        <div key={gi} className="sunk stack" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <input aria-label="Option name" value={g.name} onChange={(e) => setGroup(gi, { name: e.target.value })} placeholder="Option, e.g. Size" style={{ flex: 2, minWidth: 140 }} />
            <label className="check small"><input type="checkbox" checked={g.required !== false} onChange={(e) => setGroup(gi, { required: e.target.checked })} />Required</label>
            <button type="button" className="btn sm ghost" onClick={() => setOptions(options.filter((_, i) => i !== gi))}>Remove option</button>
          </div>
          {g.choices.map((c, ci) => (
            <div key={ci} className="row" style={{ gap: 8 }}>
              <input aria-label="Choice" value={c.label} onChange={(e) => setChoice(gi, ci, { label: e.target.value })} placeholder="Choice, e.g. 2 lb" style={{ flex: 2, minWidth: 120 }} />
              <input aria-label="Extra price in rupees" inputMode="numeric" value={c.price} onChange={(e) => setChoice(gi, ci, { price: e.target.value })} placeholder="+ Rs" style={{ flex: 1, minWidth: 70 }} />
              <input aria-label="Extra slots" inputMode="numeric" value={c.units} onChange={(e) => setChoice(gi, ci, { units: e.target.value })} placeholder="+ slots" style={{ flex: 1, minWidth: 70 }} />
              <button type="button" className="btn sm ghost" aria-label="Remove choice" onClick={() => setGroup(gi, { choices: g.choices.filter((_, i) => i !== ci) })}>×</button>
            </div>
          ))}
          <button type="button" className="btn sm" style={{ justifySelf: "start" }} onClick={() => setGroup(gi, { choices: [...g.choices, { label: "", price: "", units: "" }] })}>Add choice</button>
        </div>
      ))}
      <button type="button" className="btn sm" style={{ justifySelf: "start" }} onClick={() => setOptions([...options, { name: "", required: true, choices: [{ label: "", price: "", units: "" }] }])}>Add option</button>
    </div>
  );
}

function ItemForm({ shop, item, onClose, onSaved }) {
  const [f, setF] = useState({ ...item, price: item.price ?? "", options: (item.options || []).map((g) => ({ ...g, choices: [...(g.choices || [])] })) });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  async function pickPhoto(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setError(""); setUploading(true);
    try { const blob = await shrinkImage(file, 900, 0.8); const url = await api.uploadMenuPhoto(shop.id, blob); setF((x) => ({ ...x, image_url: url })); }
    catch (err) { setError(err.message); } finally { setUploading(false); e.target.value = ""; }
  }
  async function save(e) {
    e.preventDefault();
    const price = Math.round(Number(f.price)), units = Math.round(Number(f.units));
    if (!f.name.trim()) return setError("Enter a name.");
    if (!(price >= 0) || f.price === "") return setError("Enter a price in rupees.");
    if (!(units >= 1 && units <= 50)) return setError("Slots must be between 1 and 50.");
    const options = [];
    for (const g of f.options) {
      const name = g.name.trim();
      const choices = g.choices.filter((c) => c.label.trim()).map((c) => ({ label: c.label.trim(), price: Math.round(Number(c.price) || 0), units: Math.round(Number(c.units) || 0) }));
      if (!name && !choices.length) continue;
      if (!name) return setError("Give every option a name, like Size.");
      if (!choices.length) return setError(`Add at least one choice to ${name}.`);
      if (options.some((o) => o.name === name)) return setError(`Two options are called ${name}. Rename one.`);
      if (new Set(choices.map((c) => c.label)).size !== choices.length) return setError(`${name} has the same choice twice.`);
      options.push({ name, required: g.required !== false, choices });
    }
    try { await api.saveItem({ id: f.id, shop_id: f.shop_id, name: f.name.trim(), description: f.description || "", price, units, image_url: f.image_url || "", active: !!f.active, options, allow_message: !!f.allow_message }); onSaved(); }
    catch (err) { setError(err.message); }
  }
  return (
    <form className="card stack" onSubmit={save}>
      <h3>{f.id ? "Edit item" : "New item"}</h3>
      <div className="row" style={{ alignItems: "flex-start" }}>
        {f.image_url ? <img src={f.image_url} alt="Item" className="thumb" style={{ width: 96, height: 96 }} /> : <div className="thumb sunk" style={{ width: 96, height: 96 }} aria-hidden="true" />}
        <div className="stack" style={{ gap: 6 }}>
          <label htmlFor="i-photo">Photo<input id="i-photo" type="file" accept="image/*" onChange={pickPhoto} disabled={uploading} /></label>
          {uploading && <span className="small muted">Uploading…</span>}
          {f.image_url && <button type="button" className="btn sm ghost" style={{ justifySelf: "start" }} onClick={() => setF((x) => ({ ...x, image_url: "" }))}>Remove photo</button>}
        </div>
      </div>
      <label htmlFor="i-name">Name<input id="i-name" value={f.name} onChange={set("name")} required /></label>
      <label htmlFor="i-desc">Description<input id="i-desc" value={f.description} onChange={set("description")} placeholder="Size, serves, flavour" /></label>
      <div className="grid2">
        <label htmlFor="i-price">Starting price (Rs)<input id="i-price" inputMode="numeric" value={f.price} onChange={set("price")} required /></label>
        <label htmlFor="i-units">Slots used<input id="i-units" inputMode="numeric" value={f.units} onChange={set("units")} /></label>
      </div>
      <OptionsEditor options={f.options} setOptions={(options) => setF((x) => ({ ...x, options }))} />
      <label className="check"><input type="checkbox" checked={!!f.allow_message} onChange={set("allow_message")} />Let customers add a message on the cake</label>
      <label className="check"><input type="checkbox" checked={!!f.active} onChange={set("active")} />Show on order page</label>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="row">
        <button className="btn primary" disabled={uploading}>Save</button>
        <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
        {f.id && <button type="button" className="btn ghost" onClick={() => setConfirmDelete(true)}>Delete</button>}
      </div>
      {confirmDelete && <ConfirmDialog title={`Delete ${f.name || "this item"}?`} description="Past orders keep their details. This can\'t be undone." confirmLabel="Delete item" onCancel={() => setConfirmDelete(false)} onConfirm={async () => { await api.deleteItem(f.id); onSaved(); }} />}
    </form>
  );
}

/* ---------------- Settings ---------------- */
function Settings({ shop, onSaved }) {
  const [f, setF] = useState({ ...shop, zones: shop.delivery_zones || [], overrides: Object.entries(shop.date_overrides || {}).sort().map(([date, v]) => ({ date, closed: !!v.closed, capacity: v.capacity ?? "" })) });
  const [msg, setMsg] = useState(""); const [error, setError] = useState("");
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const toggleDay = (d) => setF((x) => ({ ...x, closed_days: x.closed_days.includes(d) ? x.closed_days.filter((y) => y !== d) : [...x.closed_days, d].sort() }));
  const setZone = (i, k, v) => setF((x) => ({ ...x, zones: x.zones.map((z, j) => (j === i ? { ...z, [k]: v } : z)) }));
  const setOv = (i, patch) => setF((x) => ({ ...x, overrides: x.overrides.map((o, j) => (j === i ? { ...o, ...patch } : o)) }));
  async function save(e) {
    e.preventDefault(); setMsg(""); setError("");
    const capacity = Math.round(Number(f.capacity)), lead = Math.round(Number(f.lead_days)), dep = Math.round(Number(f.deposit_pct)), clead = Math.round(Number(f.custom_lead_days));
    if (!(capacity >= 1 && capacity <= 500)) return setError("Daily slots must be between 1 and 500.");
    if (!(lead >= 0 && lead <= 30)) return setError("Notice must be 0 to 30 days.");
    if (!(dep >= 0 && dep <= 100)) return setError("Advance must be 0 to 100%.");
    if (!(clead >= 0 && clead <= 60)) return setError("Custom cake notice must be 0 to 60 days.");
    const zones = f.zones.filter((z) => z.name.trim()).map((z) => ({ name: z.name.trim(), fee: Math.max(0, Math.round(Number(z.fee) || 0)) }));
    if (!f.pickup_enabled && zones.length === 0) return setError("Turn on pickup or add at least one delivery area.");
    const date_overrides = {};
    for (const o of f.overrides) {
      if (!o.date) continue;
      if (o.closed) date_overrides[o.date] = { closed: true };
      else {
        const c = Math.round(Number(o.capacity));
        if (!(c >= 1 && c <= 500)) return setError(`Enter slots for ${fmtDate(o.date)}, or mark it closed.`);
        date_overrides[o.date] = { capacity: c };
      }
    }
    try {
      const saved = await api.updateShop(shop.id, { name: f.name.trim(), slug: slugify(f.slug), tagline: f.tagline, instagram: (f.instagram || "").replace(/^@/, ""), whatsapp: f.whatsapp, capacity, lead_days: lead, closed_days: f.closed_days, date_overrides, deposit_pct: dep, payment_info: f.payment_info, pickup_enabled: f.pickup_enabled, pickup_address: f.pickup_address, delivery_zones: zones, custom_enabled: !!f.custom_enabled, custom_lead_days: clead, custom_note: f.custom_note || "", is_open: f.is_open });
      onSaved(saved); setMsg("Saved.");
    } catch (err) { setError(err.message); }
  }
  const today = todayPK();
  return (
    <form className="stack" onSubmit={save} style={{ maxWidth: 680 }}>
      <div className="card stack">
        <h3>Bakery</h3>
        <label className="check"><input type="checkbox" checked={!!f.is_open} onChange={set("is_open")} />Taking orders</label>
        <label htmlFor="st-name">Name<input id="st-name" value={f.name} onChange={set("name")} /></label>
        <label htmlFor="st-tag">One-line description<input id="st-tag" value={f.tagline || ""} onChange={set("tagline")} placeholder="Small-batch chocolate tarts, Karachi" /></label>
        <label htmlFor="st-slug">Order link<input id="st-slug" value={f.slug} onChange={set("slug")} /></label>
        <div className="grid2">
          <label htmlFor="st-wa">WhatsApp<input id="st-wa" value={f.whatsapp} onChange={set("whatsapp")} /></label>
          <label htmlFor="st-ig">Instagram<input id="st-ig" value={f.instagram || ""} onChange={set("instagram")} /></label>
        </div>
      </div>
      <div className="card stack">
        <h3>Capacity and dates</h3>
        <div className="grid2">
          <label htmlFor="st-cap">Slots per day<input id="st-cap" inputMode="numeric" value={f.capacity} onChange={set("capacity")} /><span className="small muted">Most bakers set one slot per whole cake or tart.</span></label>
          <label htmlFor="st-lead">Days of notice<input id="st-lead" inputMode="numeric" value={f.lead_days} onChange={set("lead_days")} /></label>
        </div>
        <div><b className="small">Closed every</b><div className="row" style={{ marginTop: 6 }}>{DAY_NAMES.map((d, i) => <label key={d} className="check"><input type="checkbox" checked={f.closed_days.includes(i)} onChange={() => toggleDay(i)} />{d}</label>)}</div></div>
        <b className="small">Special days</b>
        <span className="small muted">Extra slots for Eid or Chand Raat, or close a day for a holiday. These replace the usual rules for that date.</span>
        {f.overrides.map((o, i) => (
          <div key={i} className="row" style={{ gap: 8 }}>
            <input aria-label="Date" type="date" min={today} value={o.date} onChange={(e) => setOv(i, { date: e.target.value })} style={{ flex: 2, minWidth: 150 }} />
            <label className="check small"><input type="checkbox" checked={o.closed} onChange={(e) => setOv(i, { closed: e.target.checked })} />Closed</label>
            {!o.closed && <input aria-label="Slots that day" inputMode="numeric" value={o.capacity} onChange={(e) => setOv(i, { capacity: e.target.value })} placeholder="Slots" style={{ flex: 1, minWidth: 80 }} />}
            <button type="button" className="btn sm ghost" onClick={() => setF((x) => ({ ...x, overrides: x.overrides.filter((_, j) => j !== i) }))}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn sm" style={{ justifySelf: "start" }} onClick={() => setF((x) => ({ ...x, overrides: [...x.overrides, { date: "", closed: false, capacity: x.capacity * 2 }] }))}>Add special day</button>
      </div>
      <div className="card stack">
        <h3>Custom cake requests</h3>
        <label className="check"><input type="checkbox" checked={!!f.custom_enabled} onChange={set("custom_enabled")} />Let customers request custom cakes with photos</label>
        {f.custom_enabled && <>
          <label htmlFor="st-clead">Days of notice for custom cakes<input id="st-clead" inputMode="numeric" value={f.custom_lead_days} onChange={set("custom_lead_days")} /></label>
          <label htmlFor="st-cnote">Note on the request form<textarea id="st-cnote" value={f.custom_note || ""} onChange={set("custom_note")} placeholder="e.g. Custom cakes start from Rs 4,500. We make something similar to your photo, not an exact copy." /></label>
        </>}
      </div>
      <div className="card stack">
        <h3>Payment</h3>
        <label htmlFor="st-dep">Advance required (%)<input id="st-dep" inputMode="numeric" value={f.deposit_pct} onChange={set("deposit_pct")} /><span className="small muted">100 means full payment upfront. 0 means no advance and no screenshot.</span></label>
        <label htmlFor="st-pay">Where customers send money<textarea id="st-pay" value={f.payment_info || ""} onChange={set("payment_info")} placeholder={"Bank, account title, IBAN\nRaast ID or Easypaisa/JazzCash number"} /></label>
      </div>
      <div className="card stack">
        <h3>Pickup and delivery</h3>
        <label className="check"><input type="checkbox" checked={!!f.pickup_enabled} onChange={set("pickup_enabled")} />Offer pickup</label>
        {f.pickup_enabled && <label htmlFor="st-pick">Pickup location shown to customers<input id="st-pick" value={f.pickup_address || ""} onChange={set("pickup_address")} placeholder="Area only; share the exact pin on WhatsApp" /></label>}
        <b className="small">Delivery areas and fees</b>
        {f.zones.map((z, i) => (
          <div key={i} className="row" style={{ gap: 8 }}>
            <input aria-label="Area name" value={z.name} onChange={(e) => setZone(i, "name", e.target.value)} placeholder="Area, e.g. DHA / Clifton" style={{ flex: 2, minWidth: 160 }} />
            <input aria-label="Fee in rupees" inputMode="numeric" value={z.fee} onChange={(e) => setZone(i, "fee", e.target.value)} placeholder="Fee" style={{ flex: 1, minWidth: 80 }} />
            <button type="button" className="btn sm ghost" onClick={() => setF((x) => ({ ...x, zones: x.zones.filter((_, j) => j !== i) }))}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn sm" style={{ justifySelf: "start" }} onClick={() => setF((x) => ({ ...x, zones: [...x.zones, { name: "", fee: "" }] }))}>Add delivery area</button>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}{msg && <Alert variant="success"><AlertDescription>{msg}</AlertDescription></Alert>}
      <button className="btn primary" style={{ justifySelf: "start" }}>Save settings</button>
    </form>
  );
}

/* ---------------- Costing ---------------- */
function Costing({ shop }) {
  const key = `dabba-cost-${shop.id}`;
  const [c, setC] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } });
  const state = c || { rows: [{ name: "Butter (g)", pack_price: 1450, pack_size: 400, used: 120 }, { name: "Dark chocolate (g)", pack_price: 2200, pack_size: 500, used: 200 }, { name: "Cream (ml)", pack_price: 650, pack_size: 200, used: 200 }, { name: "Flour, sugar, eggs", pack_price: 250, pack_size: 1, used: 1 }], yield: 1, packaging: 150, price: 3200 };
  useEffect(() => { if (c) try { localStorage.setItem(key, JSON.stringify(c)); } catch {} }, [c, key]);
  const r = useMemo(() => costing(state.rows, state.yield, state.packaging, state.price), [state]);
  const up = (patch) => setC({ ...state, ...patch });
  const setRow = (i, k, v) => up({ rows: state.rows.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
  return (
    <div className="grid2" style={{ alignItems: "start" }}>
      <div className="card stack">
        <h3>Recipe cost</h3>
        <p className="small muted" style={{ margin: 0 }}>Enter what you paid for each pack, the pack size, and how much one batch uses, in the same unit (grams, ml or pieces).</p>
        <div className="tscroll"><table>
          <thead><tr><th>Ingredient</th><th>Pack Rs</th><th>Pack size</th><th>Used</th><th></th></tr></thead>
          <tbody>{state.rows.map((x, i) => (
            <tr key={i}>
              <td><input aria-label="Ingredient" value={x.name} onChange={(e) => setRow(i, "name", e.target.value)} /></td>
              <td><input aria-label="Pack price" inputMode="decimal" value={x.pack_price} onChange={(e) => setRow(i, "pack_price", e.target.value)} /></td>
              <td><input aria-label="Pack size" inputMode="decimal" value={x.pack_size} onChange={(e) => setRow(i, "pack_size", e.target.value)} /></td>
              <td><input aria-label="Amount used" inputMode="decimal" value={x.used} onChange={(e) => setRow(i, "used", e.target.value)} /></td>
              <td><button className="btn sm ghost" aria-label="Remove row" onClick={() => up({ rows: state.rows.filter((_, j) => j !== i) })}>×</button></td>
            </tr>))}
          </tbody></table></div>
        <button className="btn sm" style={{ justifySelf: "start" }} onClick={() => up({ rows: [...state.rows, { name: "", pack_price: "", pack_size: "", used: "" }] })}>Add ingredient</button>
      </div>
      <div className="card stack">
        <h3>Price check</h3>
        <div className="grid2">
          <label htmlFor="c-yield">Pieces per batch<input id="c-yield" inputMode="numeric" value={state.yield} onChange={(e) => up({ yield: e.target.value })} /></label>
          <label htmlFor="c-pack">Box and packaging per piece (Rs)<input id="c-pack" inputMode="numeric" value={state.packaging} onChange={(e) => up({ packaging: e.target.value })} /></label>
        </div>
        <label htmlFor="c-price">Your selling price (Rs)<input id="c-price" inputMode="numeric" value={state.price} onChange={(e) => up({ price: e.target.value })} /></label>
        <div className="sunk stack" style={{ gap: 6 }}>
          <div className="total"><span>Ingredients per batch</span><b>{rs(r.ingredients)}</b></div>
          <div className="total"><span>Cost per piece</span><b>{rs(r.perPiece)}</b></div>
          <div className="total big"><span>Profit per piece</span><span style={{ color: r.profit < 0 ? "var(--bad)" : "var(--good)" }}>{rs(r.profit)}</span></div>
          <div className="total"><span>Margin</span><b>{Math.round(r.margin * 100)}%</b></div>
        </div>
        <p className="small muted" style={{ margin: 0 }}>Gas, electricity and your time aren't included. Many bakers aim for at least a 50% margin to cover them.</p>
      </div>
    </div>
  );
}
