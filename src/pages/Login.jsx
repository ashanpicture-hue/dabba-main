import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, DEMO } from "../lib/api.js";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]') || document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
  }, []);

  async function go(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const r = await api.signIn(email.trim());
      if (r.demo) nav("/app"); else setSent(true);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="wrap narrow" style={{ paddingBlock: 48 }}>
      <Link to="/" className="logo">Dabba</Link>
      <div className="card stack" style={{ marginTop: 24 }}>
        <h2>Baker sign in</h2>
        {DEMO ? (
          <>
            <p className="muted">This copy runs in demo mode. Open the dashboard with a sample bakery and try everything. Nothing leaves your browser.</p>
            <button className="btn primary" onClick={go} disabled={busy}>Open the demo dashboard</button>
          </>
        ) : sent ? (
          <div className="ok">Check {email} for a sign-in link. Open it on this device.</div>
        ) : (
          <form className="stack" onSubmit={go}>
            <p className="muted">We'll email you a one-time sign-in link. No password needed.</p>
            <label htmlFor="email">Email<input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            {error && <div className="err">{error}</div>}
            <button className="btn primary" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
