import { useEffect, useRef, useState } from "react";
import { verifyAddress } from "../lib/geocode.js";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert.jsx";

const VARIANT = { ok: "success", warn: "warning", error: "destructive", unverified: "default" };

/**
 * Delivery address box that checks itself. Local rules show on blur; the map lookup runs once when the
 * person stops typing (blur) or taps Check address. It never blocks: junk is stopped by validateCustomer,
 * everything else is advice.
 */
export default function AddressField({ id = "addr", value, onChange, shop, label = "Full address" }) {
  const [phase, setPhase] = useState("idle"); // idle | checking | done
  const [result, setResult] = useState(null);
  const checked = useRef("");
  const ctrl = useRef(null);
  const text = value.trim();

  useEffect(() => () => ctrl.current?.abort(), []);

  async function check(force = false) {
    if (text.length < 8) { setPhase("idle"); setResult(null); return; }
    if (!force && text === checked.current) return;
    checked.current = text;
    ctrl.current?.abort();
    const c = (ctrl.current = new AbortController());
    setPhase("checking");
    const r = await verifyAddress(text, { city: shop?.city || "", signal: c.signal });
    if (c.signal.aborted) return;
    setResult(r); setPhase("done");
  }

  function edit(e) {
    onChange(e.target.value);
    if (e.target.value.trim() !== checked.current) { ctrl.current?.abort(); setPhase("idle"); setResult(null); }
  }


  return (
    <div className="stack" style={{ gap: 8 }}>
      <label htmlFor={id}>{label}
        <textarea id={id} value={value} onChange={edit} onBlur={() => check(false)} autoComplete="street-address" placeholder="House, street, block, area" aria-describedby={`${id}-note`} />
      </label>
      <div aria-live="polite" className="stack" style={{ gap: 8 }}>
        {phase === "checking" && <p className="small muted" style={{ margin: 0 }}>Checking address…</p>}
        {phase === "done" && result && (
          <Alert variant={VARIANT[result.status]}>
            <AlertTitle>{result.title}</AlertTitle>
            {result.lines.map((l) => <AlertDescription key={l}>{l}</AlertDescription>)}
          </Alert>
        )}
      </div>
      <div className="row between" style={{ gap: 12, flexWrap: "nowrap", alignItems: "flex-start" }}>
        <span id={`${id}-note`} className="small muted" style={{ flex: 1, minWidth: 0 }}>Checked against OpenStreetMap. Only the address is sent.</span>
        <button type="button" className="btn sm ghost" style={{ flex: "none" }} onClick={() => check(true)} disabled={phase === "checking" || text.length < 8}>{phase === "done" ? "Check again" : "Check address"}</button>
      </div>
    </div>
  );
}
