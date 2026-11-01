import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "../components/ui/alert.jsx";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, shrinkImage } from "../lib/api.js";
import { availableDates, validateRequest, OCCASIONS, todayPK } from "../lib/core.js";
import { CustomerFields, DatePicker, initialFulfilment } from "../components/Parts.jsx";

export default function Request() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(undefined);
  const [date, setDate] = useState("");
  const [req, setReq] = useState({ occasion: "Birthday", servings: "", flavour: "", details: "" });
  const [f, setF] = useState({ fulfilment: "pickup", zone: "", customer_name: "", customer_phone: "", address: "" });
  const [photos, setPhotos] = useState([]); // [{ blob, url }]
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]') || document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
  }, []);

  useEffect(() => {
    api.publicShop(slug).then((d) => {
      setData(d);
      if (d) { document.title = `Custom cake · ${d.shop.name}`; setF((x) => ({ ...x, fulfilment: initialFulfilment(d.shop) })); }
    }).catch((e) => { setError(e.message); setData(null); });
  }, [slug]);

  // Requests only check that the day is open and far enough ahead. Capacity is checked when the customer accepts the quote.
  const days = useMemo(() => (data ? availableDates(data.shop, {}, null, 28, todayPK(), data.shop.custom_lead_days ?? 5) : []), [data]);

  if (data === undefined) return <div className="wrap narrow" style={{ paddingBlock: 64 }}><p className="muted">Loading…</p></div>;
  if (!data || !data.shop.custom_enabled) return (
    <div className="wrap narrow" style={{ paddingBlock: 64 }}>
      <h1>Custom requests are closed</h1>
      <p className="muted">This bakery isn't taking custom cake requests here. <Link to={`/s/${slug}`}>See the menu</Link>.</p>
    </div>
  );
  const { shop } = data;
  const setR = (k) => (e) => setReq((x) => ({ ...x, [k]: e.target.value }));

  async function addPhotos(e) {
    setError("");
    const input = e.target;
    const files = [...(input.files || [])].slice(0, 3 - photos.length);
    setProcessing(true);
    try {
      const out = [];
      for (const file of files) { const blob = await shrinkImage(file, 1000, 0.75); out.push({ blob, url: URL.createObjectURL(blob) }); }
      setPhotos((p) => [...p, ...out].slice(0, 3));
    } catch (err) { setError(err.message); } finally { setProcessing(false); input.value = ""; }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const draft = { ...f, zone: f.fulfilment === "delivery" ? f.zone : null, due_date: date, request: { ...req, details: req.details.trim() } };
    const bad = validateRequest({ ...draft, photos }); if (bad) return setError(bad);
    if (f.fulfilment === "delivery" && !f.zone) return setError("Choose a delivery area.");
    setBusy(true);
    try {
      const order = await api.requestCustom(slug, draft, photos.map((p) => p.blob));
      nav(`/s/${slug}/done`, { state: { order, shop } });
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <form className="wrap narrow stack" style={{ paddingBlock: "28px 60px", gap: 20 }} onSubmit={submit}>
      <Link to={`/s/${slug}`} className="small">← {shop.name} menu</Link>
      <header>
        <h1 style={{ marginBottom: 6 }}>Request a custom cake</h1>
        <p className="muted" style={{ margin: 0 }}>Tell {shop.name} what you have in mind. They'll reply with a price. Your date is only booked once you accept the price and pay the advance.</p>
        {shop.custom_note && <div className="sunk small" style={{ marginTop: 12 }}>{shop.custom_note}</div>}
      </header>

      <section className="stack">
        <h2 style={{ fontSize: "1.4rem" }}>1. The cake</h2>
        <label htmlFor="occ">Occasion<select id="occ" value={req.occasion} onChange={setR("occasion")}>{OCCASIONS.map((o) => <option key={o}>{o}</option>)}</select></label>
        <div className="grid2">
          <label htmlFor="serv">How many people or what size<input id="serv" value={req.servings} onChange={setR("servings")} placeholder="e.g. 15 people, or 2 lb" /></label>
          <label htmlFor="flav">Flavour<input id="flav" value={req.flavour} onChange={setR("flavour")} placeholder="e.g. Chocolate fudge" /></label>
        </div>
        <label htmlFor="det">Design and details<textarea id="det" value={req.details} onChange={setR("details")} placeholder="Colours, theme, tiers, name or message on the cake, anything else" required /></label>
        <label htmlFor="photos">Inspiration photos (up to 3)
          <input id="photos" type="file" accept="image/*" multiple onChange={addPhotos} disabled={photos.length >= 3} />
        </label>
        {photos.length > 0 && (
          <div className="row">
            {photos.map((p, i) => (
              <div key={p.url} className="stack" style={{ gap: 4 }}>
                <img src={p.url} alt={`Inspiration photo ${i + 1} for custom cake request`} className="thumb" style={{ width: 90, height: 90 }} loading="lazy" />
                <button type="button" className="btn sm ghost" onClick={() => setPhotos((x) => x.filter((_, j) => j !== i))}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stack">
        <h2 style={{ fontSize: "1.4rem" }}>2. When you need it</h2>
        <p className="small muted" style={{ margin: 0 }}>Custom cakes need at least {shop.custom_lead_days} days notice.</p>
        <DatePicker days={days} value={date} onChange={setDate} showLeft={false} />
      </section>

      <section className="stack">
        <h2 style={{ fontSize: "1.4rem" }}>3. Your details</h2>
        <CustomerFields shop={shop} f={f} setF={setF} notes={false} />
      </section>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <button className="btn primary block" disabled={busy || processing}>{processing ? "Adding photo…" : busy ? "Sending…" : "Send request"}</button>
      <p className="small muted" style={{ margin: 0 }}>No payment now. You'll pay the advance only if you accept the price.</p>
    </form>
  );
}
