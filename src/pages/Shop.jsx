import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { availableDates, fmtDate, rs, priceOrder, validateCustomer, configureLine, needsPicker, lineLabel, DAY_NAMES } from "../lib/core.js";
import { CustomerFields, PayBox, DatePicker, initialFulfilment } from "../components/Parts.jsx";
import { localBusinessSchema } from "../lib/schema.js";
import Feedback from "../components/Feedback.jsx";

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
        {error && <div className="err">{error}</div>}
        <div className="row between">
          <b>{preview ? rs(preview.price) : ""}</b>
          <div className="row"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary">Add to order</button></div>
        </div>
      </form>
    </div>
  );
}

/** Popup for delivery area, full address and delivery date. */
function DeliverySheet({ shop, days, f, setF, date, setDate, onClose }) {
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  function save(e) {
    e.preventDefault();
    if (!f.zone) return setErr("Choose your delivery area.");
    if (!f.address.trim()) return setErr("Add your full address.");
    if (!date) return setErr("Pick a delivery date.");
    onClose();
  }
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal modal-tall stack" onSubmit={save} aria-label="Delivery details">
        <h3>Delivery details</h3>
        <label htmlFor="zone">Delivery area
          <select id="zone" value={f.zone} onChange={set("zone")}>
            <option value="">Choose your area</option>
            {shop.delivery_zones.map((z) => <option key={z.name} value={z.name}>{z.name} · {rs(z.fee)}</option>)}
          </select>
        </label>
        <label htmlFor="addr">Full address<textarea id="addr" value={f.address} onChange={set("address")} autoComplete="street-address" placeholder="House, street, block, area" /></label>
        <div className="stack" style={{ gap: 8 }}>
          <b style={{ fontSize: 14 }}>Delivery date</b>
          <DatePicker days={days} value={date} onChange={setDate} />
        </div>
        {err && <div className="err" role="alert">{err}</div>}
        <div className="row between">
          <button type="button" className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn primary">Save delivery details</button>
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
  const [dlvOpen, setDlvOpen] = useState(false);
  const [date, setDate] = useState("");
  const [f, setF] = useState({ fulfilment: "", zone: "", customer_name: "", customer_phone: "", address: "", notes: "" });
  const [proof, setProof] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.publicShop(slug).then((d) => {
      setData(d);
      if (d) { document.title = `${d.shop.name} · Order online`; setF((x) => ({ ...x, fulfilment: d.shop.pickup_enabled ? "pickup" : initialFulfilment(d.shop) })); }
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

  if (data === undefined) return <div className="wrap narrow" style={{ paddingBlock: 64 }}><p className="muted">Loading menu…</p></div>;
  if (!data) return (
    <div className="wrap narrow" style={{ paddingBlock: 64 }}>
      <h1>Shop not found</h1>
      <p className="muted">This order link doesn't exist or has changed. Ask the baker for their current link.</p>
      {error && <div className="err">{error}</div>}
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
  const configured = cart.filter((l) => needsPicker(byId[l.item_id] || {}));
  const closedText = (shop.closed_days || []).map((d) => DAY_NAMES[d]).join(", ");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!lines.length) return setError("Add at least one item.");
    if (f.fulfilment === "delivery" && (!f.zone || !f.address.trim() || !date)) { setDlvOpen(true); return setError("Add your delivery details."); }
    if (!date) return setError("Pick a date.");
    const draft = { ...f, lines, due_date: date, zone: f.fulfilment === "delivery" ? f.zone : null };
    const bad = validateCustomer(draft); if (bad) return setError(bad);
    if (f.fulfilment === "delivery" && !f.zone) return setError("Choose a delivery area.");
    if (shop.deposit_pct > 0 && !proof) return setError(`Upload a screenshot of your ${rs(priced?.deposit_due)} payment.`);
    setBusy(true);
    try {
      const order = await api.placeOrder(slug, draft, proof);
      nav(`/s/${slug}/done`, { state: { order, shop } });
    } catch (err) { setError(err.message); setBusy(false); }
  }

  const shopSchema = data ? localBusinessSchema(data.shop) : null;

  return (
    <>
      {shopSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(shopSchema) }} />}
      <form onSubmit={submit}>
        <div className="wrap narrow stack" style={{ paddingBlock: "28px 24px", gap: 20 }}>
          <header className="stack" style={{ gap: 4 }}>
            <h1 style={{ marginBottom: 0 }}>{shop.name}</h1>
            {shop.tagline && <p className="muted" style={{ margin: 0 }}>{shop.tagline}</p>}
            <p className="small muted" style={{ margin: 0 }}>
              Preorder {shop.lead_days > 0 ? `at least ${shop.lead_days} day${shop.lead_days > 1 ? "s" : ""} ahead` : "for any open day"}
              {closedText && ` · closed ${closedText}`}
              {shop.instagram && <> · <a href={`https://instagram.com/${shop.instagram}`} target="_blank" rel="noreferrer">@{shop.instagram}</a></>}
            </p>
          </header>

          {!shop.is_open && <div className="err">{shop.name} isn't taking orders right now.</div>}

          <section className="stack" aria-labelledby="menu-h">
            <h2 id="menu-h" style={{ fontSize: "1.4rem" }}>1. Choose items</h2>
            {items.length === 0 && <p className="muted">The menu is empty for now.</p>}
            {items.map((it) => (
              <div key={it.id} className="card row between" style={{ alignItems: "flex-start" }}>
                <div className="row" style={{ alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                  {it.image_url && <img src={it.image_url} alt={it.name} className="thumb" style={{ width: 84, height: 84 }} loading="lazy" />}
                  <div style={{ minWidth: 0 }}>
                    <b>{it.name}</b>
                    {it.description && <div className="small muted">{it.description}</div>}
                    <div style={{ fontWeight: 700, marginTop: 4 }}>{(it.options || []).some((g) => (g.choices || []).some((c) => Number(c.price))) ? "From " : ""}{rs(it.price)}</div>
                  </div>
                </div>
                {needsPicker(it) ? (
                  <button type="button" className="btn sm" onClick={() => setPicking(it)}>Choose</button>
                ) : (
                  <div className="qty" aria-label={`Quantity of ${it.name}`}>
                    <button type="button" onClick={() => setLineQty(it.id, plainQty(it.id) - 1, { item_id: it.id, choices: {}, message: "" })} aria-label="Remove one">−</button>
                    <span>{plainQty(it.id)}</span>
                    <button type="button" onClick={() => setLineQty(it.id, plainQty(it.id) + 1, { item_id: it.id, choices: {}, message: "" })} aria-label="Add one">+</button>
                  </div>
                )}
              </div>
            ))}
            {configured.length > 0 && (
              <div className="sunk stack" style={{ gap: 8 }} aria-label="Items with options in your order">
                {configured.map((l) => {
                  const it = byId[l.item_id];
                  let label = it?.name, price = 0;
                  try { const c = configureLine(it, l.choices, l.message); label = lineLabel({ name: it.name, ...c }); price = c.price; } catch {}
                  return (
                    <div key={l.key} className="row between">
                      <span style={{ flex: 1, minWidth: 0 }}>{label} <span className="muted small">{rs(price)}</span></span>
                      <div className="qty"><button type="button" aria-label="Remove one" onClick={() => setLineQty(l.key, l.qty - 1)}>−</button><span>{l.qty}</span><button type="button" aria-label="Add one" onClick={() => setLineQty(l.key, l.qty + 1)}>+</button></div>
                    </div>
                  );
                })}
              </div>
            )}
            {shop.custom_enabled && (
              <Link to={`/s/${slug}/custom`} className="card row between" style={{ textDecoration: "none", color: "inherit", borderStyle: "dashed" }}>
                <div><b>Want a custom cake?</b><div className="small muted">Send your idea and photos. {shop.name} will reply with a price.</div></div>
                <span className="btn sm">Request a quote</span>
              </Link>
            )}
          </section>

          <section className="stack" aria-labelledby="ff-h">
            <h2 id="ff-h" style={{ fontSize: "1.4rem" }}>2. Pickup or delivery</h2>
            {shop.pickup_enabled && shop.delivery_zones?.length > 0 && (
              <div className="seg" role="group" aria-label="Pickup or delivery">
                <button type="button" aria-pressed={f.fulfilment === "pickup"} onClick={() => setF((x) => ({ ...x, fulfilment: "pickup" }))}>Pickup</button>
                <button type="button" aria-pressed={f.fulfilment === "delivery"} onClick={() => { setF((x) => ({ ...x, fulfilment: "delivery" })); setDlvOpen(true); }}>Delivery</button>
              </div>
            )}
            {f.fulfilment === "pickup" && (
              <>
                {shop.pickup_address && <p className="small muted" style={{ margin: 0 }}>Pickup from {shop.pickup_address}</p>}
                <b id="date-h" style={{ fontSize: 14 }}>Pick a date</b>
                <DatePicker days={days} value={date} onChange={setDate} />
              </>
            )}
            {f.fulfilment === "delivery" && (
              <button type="button" className="card row between" style={{ textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit" }} onClick={() => setDlvOpen(true)}>
                <div>
                  <b>{f.zone && f.address.trim() && date ? `Delivery to ${f.zone}` : "Add delivery details"}</b>
                  <div className="small muted">{f.zone && f.address.trim() && date ? `${fmtDate(date, { weekday: "short", day: "numeric", month: "short" })} · ${f.address.trim()}` : "Area, address and date"}</div>
                </div>
                <span className="btn sm">{f.zone && f.address.trim() && date ? "Edit" : "Add"}</span>
              </button>
            )}
          </section>

          <section className="stack" aria-labelledby="you-h">
            <h2 id="you-h" style={{ fontSize: "1.4rem" }}>3. Your details</h2>
            <CustomerFields shop={shop} f={f} setF={setF} fulfilment={false} />
          </section>

          {priced && shop.deposit_pct > 0 && (
            <section className="stack" aria-labelledby="pay-h">
              <h2 id="pay-h" style={{ fontSize: "1.4rem" }}>4. Pay {shop.deposit_pct < 100 ? `the ${shop.deposit_pct}% advance` : "in advance"}</h2>
              <PayBox shop={shop} amount={priced.deposit_due} proof={proof} setProof={setProof} setError={setError} setProcessing={setProcessing} />
            </section>
          )}
        </div>

        <div className="sticky-bar">
          <div className="wrap narrow stack" style={{ gap: 8, paddingInline: 0 }}>
            {priced ? (
              <>
                <div className="total small muted"><span>Items</span><span>{rs(priced.subtotal)}</span></div>
                {priced.delivery_fee > 0 && <div className="total small muted"><span>Delivery</span><span>{rs(priced.delivery_fee)}</span></div>}
                <div className="total big"><span>Total{date ? ` · ${fmtDate(date)}` : ""}</span><span>{rs(priced.total)}</span></div>
                {shop.deposit_pct > 0 && shop.deposit_pct < 100 && <div className="total small"><span>Pay now</span><span>{rs(priced.deposit_due)}</span></div>}
              </>
            ) : <div className="muted small">Add items to see your total.</div>}
            {error && <div className="err" role="alert">{error}</div>}
            <button className="btn primary block" disabled={busy || processing || !shop.is_open}>{processing ? "Adding screenshot…" : busy ? "Placing order…" : "Place order"}</button>
          </div>
        </div>
      </form>
      {dlvOpen && <DeliverySheet shop={shop} days={days} f={f} setF={setF} date={date} setDate={setDate} onClose={() => setDlvOpen(false)} />}
      {picking && <OptionPicker item={picking} onAdd={(sel) => addConfigured(picking, sel)} onClose={() => setPicking(null)} />}
      <div className="wrap narrow small muted row between" style={{ paddingBlock: "16px 40px" }}><span>Order page by <Link to="/">Dabba</Link></span><Feedback inline role="customer" shopId={shop.id} label="Problem ordering?" prompt="Was ordering easy?" /></div>
    </>
  );
}
