import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "./styles.css";
import { Alert, AlertDescription } from "./components/ui/alert.jsx";
import Landing from "./pages/Landing.jsx";
import Shop from "./pages/Shop.jsx";
import Done from "./pages/Done.jsx";
import Request from "./pages/Request.jsx";
import Status from "./pages/Status.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CityPage from "./pages/programmatic/CityPage.jsx";
import FeaturePage from "./pages/programmatic/FeaturePage.jsx";
import ComparisonPage from "./pages/programmatic/ComparisonPage.jsx";
import ToolPage from "./pages/programmatic/ToolPage.jsx";
import { DEMO } from "./lib/api.js";
import CookieBanner from "./components/CookieBanner.jsx";
import { useConsent } from "./lib/consent.js";
import { initGA4, trackPage } from "./lib/analytics.js";

const NotFound = () => (
  <div className="wrap narrow" style={{ paddingBlock: 64 }}>
    <h1>Page not found</h1>
    <p className="muted">Check the link, or go back to the <Link to="/">Dabba home page</Link>.</p>
  </div>
);

function App() {
  const { pathname } = useLocation();
  const { choice } = useConsent();

  // GA4 loads once, and only after the person accepts analytics. Page views follow route changes.
  const analyticsOn = !!choice?.analytics;
  useEffect(() => {
    const id = import.meta.env.VITE_GA4_ID;
    if (id && analyticsOn) initGA4(id);
  }, [analyticsOn]);
  useEffect(() => { if (analyticsOn) trackPage(pathname, document.title); }, [pathname, analyticsOn]);

  return (
    <>
      {DEMO && pathname !== "/" && <div className="demo-note"><Alert variant="warning"><AlertDescription>Demo mode: everything you enter stays in this browser only.</AlertDescription></Alert></div>}
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
          <Route path="/bakeries/:city" element={<CityPage />} />
          <Route path="/features/:feature" element={<FeaturePage />} />
          <Route path="/compare/:competitor" element={<ComparisonPage />} />
          <Route path="/tools/:tool" element={<ToolPage />} />
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
