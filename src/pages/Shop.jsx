import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { availableDates, fmtDate, rs, priceOrder, validateCustomer, assessAddress, configureLine, needsPicker, lineLabel, DAY_NAMES } from "../lib/core.js";
import { CustomerFields, PayBox, DatePicker, initialFulfilment } from "../components/Parts.jsx";
import AddressField from "../components/AddressField.jsx";
import { Alert, AlertDescription } from "../components/ui/alert.jsx";
import { localBusinessSchema } from "../lib/schema.js";
import { trackEvent } from "../lib/analytics.js";
import { setPageSEO, generateShopSEO } from "../lib/seo.js";
import Feedback from "../components/Feedback.jsx";

/** Step heading: the number turns into a tick once the step is complete. */
function StepHead({ n, done, id, children }) {
  return (
    <div className="step-head">
      <span className="step-n" data-done={done} aria-hidden="true">
        {done
          ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7" /></svg>
          : n}
      </span>
      <h2 id={id}>{children}{done && <span className="sr-only"> (done)</span>}</h2>
    </div>
  );
}

/** Popup for choosing size, flavour and a message before adding an item. */
function OptionPicker({ item, onAdd, onClose }) {
  const [sel, setSel] = useState(() => Object.fromEntries((item.options || []).filter((g) => g.required !== false && g.choices?.length).map((g) => [g.name, g.choices[0].label])));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  let preview = null;
  try { preview = configureLine(item, sel, message); } catch {}
  function add(e) {
    e.preventDefault();
    try { configureLine(item, sel, message); onAdd({ choices: sel, message }); } catch (err) { setError(err.message); }
  }
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal stack" onSubmit={add} aria-label={`Choose options for ${item.name}`}>
        <h3>{item.name}</h3>
        {(item.options || []).map((g) => (
          <fieldset key={g.name} style={{ border: 0, padding: 0, margin: 0 }} className="stack">
            <legend style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{g.name}{g.required === false ? " (optional)" : ""}</legend>
            {g.required === false && <label className="check"><input type="radio" name={g.name} checked={!sel[g.name]} onChange={() => setSel((s) => ({ ...s, [g.name]: "" }))} />None</label>}
            {(g.choices || []).map((c) => (
              <label key={c.label} className="check">
                <input type="radio" name={g.name} checked={sel[g.name] === c.label} onChange={() => setSel((s) => ({ ...s, [g.name]: c.label }))} />
                {c.label}{Number(c.price) ? <span className="muted"> +{rs(c.price)}</span> : null}
              </label>
            ))}
          </fieldset>
        ))}
        {item.allow_message && <label htmlFor="msg">Message on the cake<input id="msg" maxLength={60} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Optional, up to 60 characters" /></label>}
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="row between">
          <b>{preview ? rs(preview.price) : ""}</b>
          <div className="row"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary">Add to order</button></div>
        </div>
      </form>
    </div>
  );
}

export default function Shop() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(undefined);
  const [cart, setCart] = useState([]); // [{ key, item_id, qty, choices, message }]
  const [picking, setPicking] = useState(null);
  const [sumOpen, setSumOpen] = useState(false);
  const [date, setDate] = useState("");
  const [f, setF] = useState({ fulfilment: "", zone: "", customer_name: "", customer_phone: "", address: "", notes: "" });
  const [proof, setProof] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.publicShop(slug).then((d) => {
      setData(d);
      if (d) {
        const seo = generateShopSEO(d.shop);
        setPageSEO(seo);
        setF((x) => ({ ...x, fulfilment: d.shop.pickup_enabled ? "pickup" : initialFulfilment(d.shop) }));
      }
    }).catch((e) => { setError(e.message); setData(null); });
  }, [slug]);

  const lines = useMemo(() => cart.filter((l) => l.qty > 0).map(({ item_id, qty, choices, message }) => ({ item_id, qty, choices, message })), [cart]);
  const priced = useMemo(() => {
    if (!data || !lines.length) return null;
    try { return priceOrder(data.shop, data.items, { ...f, lines, fulfilment: f.fulfilment || "pickup", zone: f.zone || data.shop.delivery_zones?.[0]?.name }); } catch { return null; }
  }, [data, lines, f]);
  const units = priced?.units || 1;
  const days = useMemo(() => (data ? availableDates(data.shop, data.load, units, 21) : []), [data, units]);
  useEffect(() => { if (date && days.find((d) => d.ymd === date)?.problem) setDate(""); }, [days, date]);
  // An emptied cart closes the order sheet, so it doesn't reopen already expanded on the next add.
  useEffect(() => { if (!cart.length) setSumOpen(false); }, [cart.length]);
  // A fixed field shouldn't keep showing the message that asked for it.
  useEffect(() => { setError(""); }, [f, date, cart]);

  if (data === undefined) return <div className="wrap narrow" style={{ paddingBlock: 64 }}><p className="muted">Loading menu…</p></div>;
  if (!data) return (
    <div className="wrap narrow" style={{ paddingBlock: 64 }}>
      <h1>Shop not found</h1>
      <p className="muted">This order link doesn't exist or has changed. Ask the baker for their current link.</p>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    </div>
  );

  const { shop, items } = data;
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const plainQty = (id) => cart.find((l) => l.key === id)?.qty || 0;
  const setLineQty = (key, qty, base) => setCart((c) => {
    const n = Math.max(0, Math.min(50, qty));
    const has = c.find((l) => l.key === key);
    if (has) return n ? c.map((l) => (l.key === key ? { ...l, qty: n } : l)) : c.filter((l) => l.key !== key);
    return n ? [...c, { ...base, key, qty: n }] : c;
  });
  const addConfigured = (item, { choices, message }) => {
    const key = `${item.id}|${JSON.stringify(choices)}|${message.trim()}`;
    setCart((c) => { const has = c.find((l) => l.key === key); return has ? c.map((l) => (l.key === key ? { ...l, qty: Math.min(50, l.qty + 1) } : l)) : [...c, { key, item_id: item.id, qty: 1, choices, message }]; });
    setPicking(null);
  };
  const rows = cart.filter((l) => l.qty > 0).flatMap((l) => {
    const it = byId[l.item_id];
    if (!it) return [];
    try { const c = configureLine(it, l.choices, l.message); return [{ ...l, label: lineLabel({ name: it.name, ...c }), price: c.price }]; } catch { return []; }
  });
  const count = rows.reduce((n, l) => n + l.qty, 0);
  const inOrder = (id) => rows.filter((l) => l.item_id === id).reduce((n, l) => n + l.qty, 0);
  const closedText = (shop.closed_days || []).map((d) => DAY_NAMES[d]).join(", ");
  const pickup = f.fulfilment === "pickup";
  const delivering = f.fulfilment === "delivery";
  const deliveryReady = !!(f.zone && f.address.trim() && date);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  // Progress. Advisory only: submit() and validateCustomer() stay the authority.
  const name = f.customer_name?.trim();
  const phone = f.customer_phone?.trim();
  const showPay = !!priced && shop.deposit_pct > 0;
  const whenDone = delivering ? deliveryReady : !!date;
  const detailsDone = !!(name && phone);
  const whenHint = delivering
    ? (!f.zone ? "choose your delivery area" : !f.address.trim() ? "add your delivery address" : "pick a delivery date")
    : "pick a date";
  const detailsHint = !name && !phone ? "add your name and phone" : !name ? "add your name" : "add your phone number";
  const steps = [
    { id: "step-items", done: count > 0, hint: "choose an item", focus: null },
    { id: "step-when", done: whenDone, hint: whenHint, focus: delivering ? (!f.zone ? "#zone" : !f.address.trim() ? "#addr" : null) : null },
    { id: "step-details", done: detailsDone, hint: detailsHint, focus: "input" },
    ...(showPay ? [{ id: "step-pay", done: !!proof, hint: "upload your payment screenshot", focus: null }] : []),
  ];
  const next = steps.find((s) => !s.done);

  /** Bring the person to the step that needs attention. */
  function goTo(id, focusSel) {
    const el = document.getElementById(id);
    if (!el) return;
    setSumOpen(false);
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    if (focusSel) el.querySelector(focusSel)?.focus({ preventScroll: true });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!lines.length) { goTo("step-items"); return setError("Add at least one item."); }
    if (delivering) {
      if (!f.zone) { goTo("step-when", "#zone"); return setError("Choose your delivery area."); }
      if (!f.address.trim()) { goTo("step-when", "#addr"); return setError("Add your delivery address."); }
      const a = assessAddress(f.address);
      if (a.blocking) { goTo("step-when", "#addr"); return setError(a.issues[0]); }
    }
    if (!date) { goTo("step-when"); return setError(delivering ? "Pick a delivery date." : "Pick a date."); }
    const draft = { ...f, lines, due_date: date, zone: delivering ? f.zone : null };
    const bad = validateCustomer(draft);
    if (bad) {
      if (delivering && /address|area/i.test(bad)) goTo("step-when", "#addr"); else goTo("step-details", "input");
      return setError(bad);
    }
    if (shop.deposit_pct > 0 && !proof) { goTo("step-pay"); return setError(`Upload a screenshot of your ${rs(priced?.deposit_due)} payment.`); }
    setBusy(true);
    try {
      const order = await api.placeOrder(slug, draft, proof);
      trackEvent("order_placed", { slug, fulfilment: draft.fulfilment, deposit_pct: shop.deposit_pct });
      nav(`/s/${slug}/done`, { state: { order, shop } });
    } catch (err) { setError(err.message); setBusy(false); }
  }

  const shopSchema = data ? localBusinessSchema(data.shop, data.items) : null;

  return (
    <>
      {shopSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(shopSchema) }} />}
      <form onSubmit={submit}>
        <div className="wrap shop-grid">
          <div className="shop-main">
            <header className="stack" style={{ gap: 4 }}>
              <h1 style={{ marginBottom: 0 }}>{shop.name}</h1>
              {shop.tagline && <p className="muted" style={{ margin: 0 }}>{shop.tagline}</p>}
              <p className="small muted" style={{ margin: 0 }}>
                Preorder {shop.lead_days > 0 ? `at least ${shop.lead_days} day${shop.lead_days > 1 ? "s" : ""} ahead` : "for any open day"}
                {closedText && ` · closed ${closedText}`}
                {shop.instagram && <> · <a href={`https://instagram.com/${shop.instagram}`} target="_blank" rel="noreferrer">@{shop.instagram}</a></>}
              </p>
            </header>

            {!shop.is_open && <Alert variant="destructive"><AlertDescription>{shop.name} isn't taking orders right now.</AlertDescription></Alert>}

            <section className="step" id="step-items" aria-labelledby="menu-h">
              <StepHead n={1} done={count > 0} id="menu-h">Choose items</StepHead>
              {items.length === 0 && <p className="muted">The menu is empty for now.</p>}
              {items.length > 0 && (
                <ul className="menu">
                  {items.map((it) => {
                    const n = inOrder(it.id);
                    const q = plainQty(it.id);
                    const from = (it.options || []).some((g) => (g.choices || []).some((c) => Number(c.price))) ? "From " : "";
                    return (
                      <li key={it.id} className="menu-item" data-in={n > 0}>
                        {it.image_url && <img src={it.image_url} alt={it.name} className="thumb menu-thumb" loading="lazy" />}
                        <div className="menu-body">
                          <b>{it.name}</b>
                          {it.description && <div className="small muted">{it.description}</div>}
                          <div className="menu-foot">
                            <span className="menu-price">{from}{rs(it.price)}</span>
                            {needsPicker(it) ? (
                              <div className="menu-act">
                                {n > 0 && <span className="in-order">{n} in order</span>}
                                <button type="button" className="btn sm" onClick={() => setPicking(it)}>{n ? "Add another" : "Choose"}</button>
                              </div>
                            ) : (
                              <div className="qty" data-zero={q === 0} aria-label={`Quantity of ${it.name}`}>
                                <button type="button" onClick={() => setLineQty(it.id, q - 1, { item_id: it.id, choices: {}, message: "" })} aria-label={`Remove one ${it.name}`}>−</button>
                                <span>{q}</span>
                                <button type="button" onClick={() => setLineQty(it.id, q + 1, { item_id: it.id, choices: {}, message: "" })} aria-label={`Add one ${it.name}`}>+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {shop.custom_enabled && (
                <Link to={`/s/${slug}/custom`} className="card row between custom-link">
                  <div style={{ flex: "1 1 240px", minWidth: 0 }}><b>Want a custom cake?</b><div className="small muted">Send your idea and photos. {shop.name} will reply with a price.</div></div>
                  <span className="btn sm">Request a quote</span>
                </Link>
              )}
            </section>

            {/* How and when: everything about getting the order to the customer lives here, with no popup. */}
            <section className="step" id="step-when" aria-labelledby="ff-h">
              <StepHead n={2} done={whenDone} id="ff-h">Pickup or delivery</StepHead>
              {shop.pickup_enabled && shop.delivery_zones?.length > 0 && (
                <div className="seg" role="group" aria-label="Pickup or delivery">
                  <button type="button" aria-pressed={pickup} onClick={() => setF((x) => ({ ...x, fulfilment: "pickup" }))}>Pickup</button>
                  <button type="button" aria-pressed={delivering} onClick={() => setF((x) => ({ ...x, fulfilment: "delivery" }))}>Delivery</button>
                </div>
              )}
              {(pickup || delivering) && (
                <div className="fields" key={f.fulfilment}>
                  {pickup && shop.pickup_address && <p className="small muted" style={{ margin: 0 }}>Pickup from {shop.pickup_address}</p>}
                  {delivering && (
                    <>
                      <label htmlFor="zone">Delivery area
                        <select id="zone" value={f.zone} onChange={set("zone")}>
                          <option value="">Choose your area</option>
                          {shop.delivery_zones.map((z) => <option key={z.name} value={z.name}>{z.name} · {rs(z.fee)}</option>)}
                        </select>
                      </label>
                      <AddressField id="addr" value={f.address} onChange={(v) => setF((x) => ({ ...x, address: v }))} shop={shop} />
                    </>
                  )}
                  <div className="date-block">
                    <b id="date-h" className="field-h">{delivering ? "Delivery date" : "Pick a date"}</b>
                    <DatePicker days={days} value={date} onChange={setDate} />
                  </div>
                </div>
              )}
            </section>

            <section className="step" id="step-details" aria-labelledby="you-h">
              <StepHead n={3} done={detailsDone} id="you-h">Your details</StepHead>
              <CustomerFields shop={shop} f={f} setF={setF} fulfilment={false} />
            </section>

            {showPay && (
              <section className="step" id="step-pay" aria-labelledby="pay-h">
                <StepHead n={4} done={!!proof} id="pay-h">Pay {shop.deposit_pct < 100 ? `the ${shop.deposit_pct}% advance` : "in advance"}</StepHead>
                <PayBox shop={shop} amount={priced.deposit_due} proof={proof} setProof={setProof} setError={setError} setProcessing={setProcessing} />
              </section>
            )}
          </div>

          {/* Desktop: sticky panel beside the steps. Phone: a slim bar (total + Place order) that opens into the full order. */}
          <aside className={`order-side${sumOpen ? " open" : ""}${count || error ? "" : " is-empty"}`} aria-label="Your order">
            <div id="os-body" className="os-body">
              <div className="os-head row between">
                <h2>Your order</h2>
                {count > 0 && <span className="small muted">{count} item{count > 1 ? "s" : ""}</span>}
              </div>
              {rows.length ? (
                <div className="os-list">
                  {rows.map((l) => (
                    <div key={l.key} className="os-line">
                      <div className="os-name">{l.label}<span className="os-unit">{rs(l.price)} each</span></div>
                      <div className="os-price">{rs(l.price * l.qty)}</div>
                      <div className="qty" aria-label={`Quantity of ${l.label}`}>
                        <button type="button" aria-label="Remove one" onClick={() => setLineQty(l.key, l.qty - 1)}>−</button>
                        <span>{l.qty}</span>
                        <button type="button" aria-label="Add one" onClick={() => setLineQty(l.key, l.qty + 1)}>+</button>
                      </div>
                      <button type="button" className="os-remove" onClick={() => setLineQty(l.key, 0)}>Remove</button>
                    </div>
                  ))}
                </div>
              ) : <p className="os-empty">Nothing here yet. Add items from the menu.</p>}
              {priced && (
                <div className="os-totals">
                  <div className="total small muted"><span>{delivering ? "Delivery date" : "Pickup date"}</span>{date ? <span>{fmtDate(date)}</span> : <span className="os-pending">Pick a date</span>}</div>
                  <div className="total small muted"><span>Items</span><span>{rs(priced.subtotal)}</span></div>
                  {priced.delivery_fee > 0 && <div className="total small muted"><span>Delivery</span><span>{rs(priced.delivery_fee)}</span></div>}
                  <div className="total big"><span>Total</span><span>{rs(priced.total)}</span></div>
                  {shop.deposit_pct > 0 && shop.deposit_pct < 100 && <div className="total due"><span>Pay now</span><span>{rs(priced.deposit_due)}</span></div>}
                </div>
              )}
              {count > 0 && (next ? (
                <button type="button" className="os-next" onClick={() => goTo(next.id, next.focus)}>
                  <span>Next: {next.hint}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 4 4 4-4 4" /></svg>
                </button>
              ) : (
                <p className="os-ready">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" /></svg>
                  Ready to place your order
                </p>
              ))}
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="os-bar">
              <button type="button" className="os-toggle" aria-expanded={sumOpen} aria-controls="os-body" onClick={() => setSumOpen((v) => !v)}>
                <span className="os-toggle-text">
                  <span className="os-count">{count ? `${count} item${count === 1 ? "" : "s"} · ${sumOpen ? "Hide order" : "View order"}` : "Your order"}</span>
                  {priced && <span className="os-sum">{rs(priced.total)}</span>}
                </span>
                <svg className="chev" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 10 4-4 4 4" /></svg>
              </button>
              <button className="btn primary os-place" disabled={busy || processing || !shop.is_open}>{processing ? "Adding screenshot…" : busy ? "Placing order…" : "Place order"}</button>
            </div>
          </aside>
        </div>
      </form>
      {picking && <OptionPicker item={picking} onAdd={(sel) => addConfigured(picking, sel)} onClose={() => setPicking(null)} />}
      <div className="wrap small muted row between" style={{ paddingBlock: "16px 40px" }}><span>Order page by <Link to="/">Dabba</Link></span><Feedback inline role="customer" shopId={shop.id} label="Problem ordering?" prompt="Was ordering easy?" /></div>
    </>
  );
}
