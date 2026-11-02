import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "../components/ui/alert.jsx";
import { useNavigate, Link } from "react-router-dom";
import { api, DEMO } from "../lib/api.js";
import { setPageSEO } from "../lib/seo.js";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPageSEO({
      title: "Sign In · Dabba Baker Dashboard",
      description: "Sign in to your Dabba baker dashboard. Manage your menu, orders, baking list, and settings. One-time email link — no password needed.",
      canonical: "https://dabba.devs.surf/login",
      noIndex: true,
    });
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
          <Alert variant="success"><AlertDescription>Check {email} for a sign-in link. Open it on this device.</AlertDescription></Alert>
        ) : (
          <form className="stack" onSubmit={go}>
            <p className="muted">We'll email you a one-time sign-in link. No password needed.</p>
            <label htmlFor="email">Email<input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <button className="btn primary" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
