import { useState } from "react";
import { shrinkImage } from "../lib/api.js";
import { rs, fmtDate, STATUS, PAY } from "../lib/core.js";

/** Pickup or delivery, area, name, phone, address. Shared by the order and custom request forms. */
export function CustomerFields({ shop, f, setF, notes = true, fulfilment = true }) {
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <>
      {fulfilment && shop.pickup_enabled && shop.delivery_zones?.length > 0 && (
        <div className="row" role="radiogroup" aria-label="Pickup or delivery">
          <label className="check"><input type="radio" name="ff" checked={f.fulfilment === "delivery"} onChange={() => setF((x) => ({ ...x, fulfilment: "delivery" }))} />Delivery</label>
          <label className="check"><input type="radio" name="ff" checked={f.fulfilment === "pickup"} onChange={() => setF((x) => ({ ...x, fulfilment: "pickup" }))} />Pickup</label>
        </div>
      )}
      {fulfilment && f.fulfilment === "pickup" && shop.pickup_address && <p className="small muted" style={{ margin: 0 }}>Pickup from {shop.pickup_address}</p>}
      {fulfilment && f.fulfilment === "delivery" && (
        <label htmlFor="zone">Delivery area
          <select id="zone" value={f.zone} onChange={set("zone")} required>
            <option value="">Choose your area</option>
            {shop.delivery_zones.map((z) => <option key={z.name} value={z.name}>{z.name} · {rs(z.fee)}</option>)}
          </select>
        </label>
      )}
      <label htmlFor="name">Name<input id="name" value={f.customer_name} onChange={set("customer_name")} autoComplete="name" required /></label>
      <label htmlFor="phone">WhatsApp number<input id="phone" value={f.customer_phone} onChange={set("customer_phone")} inputMode="tel" autoComplete="tel" placeholder="0300 1234567" required /></label>
      {fulfilment && f.fulfilment === "delivery" && <label htmlFor="addr">Full address<textarea id="addr" value={f.address} onChange={set("address")} autoComplete="street-address" placeholder="House, street, block, area" /></label>}
      {notes && <label htmlFor="notes">Note for the baker<input id="notes" value={f.notes} onChange={set("notes")} placeholder="Optional: allergies, timing" /></label>}
    </>
  );
}

export const initialFulfilment = (shop) => (shop.delivery_zones?.length ? "delivery" : "pickup");

/** Where to send money, a copy button, and the screenshot upload. */
export function PayBox({ shop, amount, proof, setProof, setError, setProcessing = () => {} }) {
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState("");
  const copy = async () => { try { await navigator.clipboard.writeText(shop.payment_info); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };
  async function pick(e) {
    const file = e.target.files?.[0];
    setError("");
    if (!file) return;
    setProcessing(true);
    try { const small = await shrinkImage(file); setProof(small); setPreview(URL.createObjectURL(small)); }
    catch (err) { setError(err.message); } finally { setProcessing(false); }
  }
  return (
    <div className="stack">
      <div className="sunk stack" style={{ gap: 8 }}>
        <div>Send <b>{rs(amount)}</b> to:</div>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", font: "500 15px var(--body)" }}>{shop.payment_info || "Ask the baker on WhatsApp for payment details."}</pre>
        {shop.payment_info && <button type="button" className="btn sm" style={{ justifySelf: "start" }} onClick={copy}>{copied ? "Copied" : "Copy details"}</button>}
      </div>
      <label htmlFor="proof">Payment screenshot<input id="proof" type="file" accept="image/*" onChange={pick} /></label>
      {preview && proof && <img src={preview} alt="Your payment screenshot" style={{ maxWidth: 160, borderRadius: 10, border: "1px solid var(--line)" }} />}
    </div>
  );
}

export const payChip = (s) => <span className={`chip ${s === "verified" ? "good" : s === "submitted" ? "warn" : s === "rejected" ? "bad" : ""}`}>{PAY[s]}</span>;
export const statusChip = (s) => <span className={`chip ${["new", "request"].includes(s) ? "accent" : ["cancelled", "declined"].includes(s) ? "bad" : s === "delivered" ? "good" : s === "quoted" ? "warn" : ""}`}>{STATUS[s]}</span>;

/** A row of selectable dates. */
export function DatePicker({ days, value, onChange, showLeft = true }) {
  return (
    <div className="dates">
      {days.map((d) => (
        <button type="button" key={d.ymd} className="date" disabled={!!d.problem} aria-pressed={value === d.ymd} title={d.problem || `${d.left} slots left`} onClick={() => onChange(d.ymd)}>
          {fmtDate(d.ymd, { weekday: "short" })}<b>{fmtDate(d.ymd, { day: "numeric", month: "short" })}</b>
          <span className="small">{d.problem ? (d.problem.startsWith("Closed") ? "Closed" : "Full") : showLeft && d.left <= 2 ? `${d.left} left` : "Open"}</span>
        </button>
      ))}
    </div>
  );
}
