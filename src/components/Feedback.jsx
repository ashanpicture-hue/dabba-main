import { useState } from "react";
import { Alert, AlertDescription } from "./ui/alert.jsx";
import { api } from "../lib/api.js";

/** Floating feedback button. Every page carries one, so real users can tell us what to change. */
export default function Feedback({ role = "visitor", shopId = null, label = "Feedback", prompt = "What should we change or add?", inline = false }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  async function send(e) {
    e.preventDefault();
    if (!rating && !message.trim()) { setError("Pick a rating or write a note."); return; }
    setState("sending"); setError("");
    try {
      await api.feedback({ role, shop_id: shopId, rating: rating || null, message: message.trim().slice(0, 2000), contact: contact.trim().slice(0, 120) || null, page: location.pathname });
      setState("sent");
    } catch (err) { setError(err.message); setState("idle"); }
  }

  return (
    <>
      <button className={inline ? "btn sm ghost" : "btn fab"} onClick={() => { setOpen(true); setState("idle"); }}>{label}</button>
      {open && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form className="modal stack" onSubmit={send} aria-label="Send feedback">
            {state === "sent" ? (
              <>
                <h3>Thank you</h3>
                <p className="muted">We read every note and use it to decide what to build next.</p>
                <button type="button" className="btn primary" onClick={() => setOpen(false)}>Close</button>
              </>
            ) : (
              <>
                <h3>{prompt}</h3>
                <div className="stars" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} className={n <= rating ? "on" : ""} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-checked={n === rating} role="radio" onClick={() => setRating(n)}>★</button>
                  ))}
                </div>
                <label htmlFor="fb-msg">Your note<textarea id="fb-msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What was hard, missing or confusing?" /></label>
                <label htmlFor="fb-contact">WhatsApp or email, if you want a reply<input id="fb-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Optional" /></label>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="row">
                  <button className="btn primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send"}</button>
                  <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}
