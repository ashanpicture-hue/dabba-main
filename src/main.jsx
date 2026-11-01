import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "./styles.css";
import Landing from "./pages/Landing.jsx";
import Shop from "./pages/Shop.jsx";
import Done from "./pages/Done.jsx";
import Request from "./pages/Request.jsx";
import Status from "./pages/Status.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { DEMO } from "./lib/api.js";
import CookieBanner from "./components/CookieBanner.jsx";
import { useConsent } from "./lib/consent.js";
import { initGA4 } from "./lib/analytics.js";

const NotFound = () => (
  <div className="wrap narrow" style={{ paddingBlock: 64 }}>
    <h1>Page not found</h1>
    <p className="muted">Check the link, or go back to the <Link to="/">Dabba home page</Link>.</p>
  </div>
);

function App() {
  const { pathname } = useLocation();
  const { choice } = useConsent();

  // Initialize GA4 immediately (loads gtag.js) so Google's verification crawler detects it.
  // Events (page_view, etc.) are still gated behind consent in trackPage/trackEvent.
  if (typeof window !== "undefined") {
    const ga4Id = import.meta.env.VITE_GA4_ID;
    if (ga4Id) initGA4(ga4Id);
  }

  return (
    <>
      {DEMO && pathname !== "/" && <div className="banner">Demo mode: everything you enter stays in this browser only.</div>}
      <div key={pathname} className={`page-wrap${pathname === "/" ? " home" : ""}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/s/:slug" element={<Shop />} />
          <Route path="/s/:slug/done" element={<Done />} />
          <Route path="/s/:slug/custom" element={<Request />} />
          <Route path="/o/:code" element={<Status />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {choice?.analytics && <Analytics />}
      <CookieBanner />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
);
