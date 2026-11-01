import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { fmtDate, fmtDateTime, rs, waLink, timeline, lineLabel, quoteExpired, PAY } from "../lib/core.js";
import { PayBox, statusChip } from "../components/Parts.jsx";
import Feedback from "../components/Feedback.jsx";

/** Customer-facing page for one order, opened from the code. Shows progress and lets them accept a quote. */
export default function Status() {
  const { code } = useParams();
  const [info, setInfo] = useState(undefined);
  const [proof, setProof] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const load =useCallback(() => api.orderByCode(code).then(setInfo).catch((e) => { setError(e.message); setInfo(null); }), [code]);
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    if (info?.shop) document.title = `Order ${info.order.code} · ${info.shop.name}`;
    const meta = document.querySelector('meta[name="robots"]') || document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
  }, [info]);

  if (info === undefined) return <div className="wrap narrow" style={{ paddingBlock: 64 }}><p className="muted">Loading your order…</p></div>;
  if (!info) return (
    <div className="wrap narrow" style={{ paddingBlock: 64 }}>
      <h1>Order not found</h1>
      <p className="muted">Check the 6-letter code in your WhatsApp message and try the link again.</p>
      {error && <div className="err">{error}</div>}
    </div>
  );

  const { order: o, shop } = info;
  const expired = quoteExpired(o);
  const steps = timeline(o);
  const ended = ["cancelled", "declined"].includes(o.status);

  async function accept() {
    setError("");
    if (o.deposit_due > 0 && !proof) return setError(`Upload a screenshot of your ${rs(o.deposit_due)} payment.`);
    setBusy(true);
    try { await api.acceptQuote(o.code, proof); setProof(null); await load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="wrap narrow stack" style={{ paddingBlock: "32px 80px", gap: 18 }}>
      <Link to={`/s/${shop.slug}`} className="small">← {shop.name}</Link>
      <div className="row between">
        <h1 style={{ margin: 0 }}>Order {o.code}</h1>
        {statusChip(o.status)}
      </div>
      <p className="muted" style={{ margin: 0 }}>Hi {o.customer_name}. For {o.fulfilment === "delivery" ? `delivery to ${o.zone}` : "pickup"} on <b>{fmtDate(o.due_date, { weekday: "long", day: "numeric", month: "long" })}</b>.</p>

      {ended ? (
        <div className="err">{o.status === "declined" ? `${shop.name} can't take this request. Message them on WhatsApp to try another date.` : "This order was cancelled."}</div>
      ) : (
        <ol className="card stack" style={{ listStyle: "none", margin: 0, gap: 10 }} aria-label="Order progress">
          {steps.map((s) => (
            <li key={s.key} className="row" style={{ gap: 10 }}>
              <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, background: s.done ? "var(--good)" : "var(--sunk)", color: s.done ? "var(--surface)" : "var(--sub)" }}>{s.done ? "✓" : ""}</span>
              <span style={{ fontWeight: s.done ? 600 : 400, color: s.done ? "var(--ink)" : "var(--sub)" }}>{s.label}</span>
            </li>
          ))}
        </ol>
      )}

      {o.request && (
        <div className="card stack" style={{ gap: 6 }}>
          <b>Your request</b>
          <div className="small muted">{[o.request.occasion, o.request.servings, o.request.flavour].filter(Boolean).join(" · ")}</div>
          <div>{o.request.details}</div>
        </div>
      )}

      {o.status === "request" && <div className="sunk">{shop.name} is looking at your request and will send a price on WhatsApp. You can come back to this page any time.</div>}

      {o.status === "quoted" && (
        <div className="card stack">
          <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Your price</h2>
          {o.quote_note && <p style={{ margin: 0 }}>{o.quote_note}</p>}
          <div className="total"><span>Cake</span><span>{rs(o.subtotal)}</span></div>
          {o.delivery_fee > 0 && <div className="total"><span>Delivery</span><span>{rs(o.delivery_fee)}</span></div>}
          <div className="total big"><span>Total</span><span>{rs(o.total)}</span></div>
          {expired ? (
            <div className="err">This price expired on {fmtDateTime(o.quote_expires)}. Message {shop.name} for a new one.</div>
          ) : (
            <>
              {o.quote_expires && <p className="small muted" style={{ margin: 0 }}>Price holds until {fmtDateTime(o.quote_expires)}. Your date is booked once you pay.</p>}
              {o.deposit_due > 0 && <PayBox shop={shop} amount={o.deposit_due} proof={proof} setProof={setProof} setError={setError} setProcessing={setProcessing} />}
              {error && <div className="err" role="alert">{error}</div>}
              <button className="btn primary block" onClick={accept} disabled={busy || processing}>{processing ? "Adding screenshot…" : busy ? "Booking…" :o.deposit_due > 0 ? `Accept and book · paid ${rs(o.deposit_due)}` : "Accept and book"}</button>
            </>
          )}
        </div>
      )}

      {(o.lines || []).length > 0 && o.status !== "quoted" && (
        <div className="card stack" style={{ gap: 8 }}>
          {o.lines.map((l, i) => <div key={i} className="row between"><span>{l.qty} × {lineLabel(l)}</span><span>{rs(l.price * l.qty)}</span></div>)}
          {o.delivery_fee > 0 && <div className="total small muted"><span>Delivery</span><span>{rs(o.delivery_fee)}</span></div>}
          <div className="total big"><span>Total</span><span>{rs(o.total)}</span></div>
          {o.deposit_due > 0 && <div className="total"><span>Advance</span><span>{rs(o.deposit_due)} · {PAY[o.payment_status]}</span></div>}
          {o.deposit_due < o.total && <div className="total"><span>Due on {o.fulfilment === "delivery" ? "delivery" : "pickup"}</span><span>{rs(o.total - o.deposit_due)}</span></div>}
        </div>
      )}

      {waLink(shop.whatsapp) && <a className="btn wa block" href={waLink(shop.whatsapp, `Hi ${shop.name}, about my order ${o.code}: `)} target="_blank" rel="noreferrer">Message {shop.name} on WhatsApp</a>}
      <div><Feedback inline role="customer" shopId={shop.id} label="Give feedback" prompt="How was ordering?" /></div>
    </div>
  );
}
