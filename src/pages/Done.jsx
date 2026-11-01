import { useLocation, useParams, Link } from "react-router-dom";
import { fmtDate, rs, waLink, customerMessage, lineLabel } from "../lib/core.js";
import Feedback from "../components/Feedback.jsx";

export default function Done() {
  const { slug } = useParams();
  const { state } = useLocation();
  if (!state?.order) return (
    <div className="wrap narrow" style={{ paddingBlock: 64 }}>
      <h1>Order placed</h1>
      <p className="muted">If you placed an order, the baker has it. Go back to the <Link to={`/s/${slug}`}>order page</Link>.</p>
    </div>
  );
  const { order: o, shop } = state;
  const isRequest = o.status === "request";
  const wa = waLink(shop.whatsapp, customerMessage(shop, o, location.origin));
  return (
    <div className="wrap narrow stack" style={{ paddingBlock: "40px 100px", gap: 18 }}>
      <span className="chip good" style={{ justifySelf: "start" }}>{isRequest ? "Request sent" : "Order sent"}</span>
      <h1>Thank you, {o.customer_name.split(" ")[0]}</h1>
      <p className="muted">
        {isRequest
          ? `${shop.name} will look at your idea and send you a price. Nothing is booked or paid yet.`
          : `${shop.name} will check your payment and confirm on WhatsApp.`}
        {" "}Save your order link to check progress any time.
      </p>
      <div className="card stack" style={{ gap: 8 }}>
        <div className="row between"><span className="muted">Order code</span><b style={{ fontSize: "1.3rem", letterSpacing: ".08em" }}>{o.code}</b></div>
        <div className="row between"><span className="muted">Date</span><b>{fmtDate(o.due_date, { weekday: "long", day: "numeric", month: "long" })}</b></div>
        <div className="row between"><span className="muted">{o.fulfilment === "delivery" ? `Delivery to ${o.zone}` : "Pickup"}</span></div>
        {(o.lines || []).map((l, i) => <div key={i} className="row between"><span>{l.qty} × {lineLabel(l)}</span><span>{rs(l.price * l.qty)}</span></div>)}
        {!isRequest && <>
          <div className="total big"><span>Total</span><span>{rs(o.total)}</span></div>
          {o.deposit_due > 0 && <div className="total"><span>Paid in advance</span><span>{rs(o.deposit_due)}</span></div>}
          {o.deposit_due < o.total && <div className="total"><span>Due on {o.fulfilment === "delivery" ? "delivery" : "pickup"}</span><span>{rs(o.total - o.deposit_due)}</span></div>}
        </>}
      </div>
      <Link className="btn primary block" to={`/o/${o.code}`}>Track this order</Link>
      {wa && <a className="btn wa block" href={wa} target="_blank" rel="noreferrer">Message {shop.name} on WhatsApp</a>}
      <Link className="btn block" to={`/s/${slug}`}>Back to the menu</Link>
      <div className="card stack" style={{ gap: 6 }}><b>Was this easy?</b><span className="small muted">Your answer helps the baker and us improve this page.</span><div><Feedback inline role="customer" shopId={shop.id} label="Rate ordering" prompt="How easy was it to order?" /></div></div>
    </div>
  );
}
