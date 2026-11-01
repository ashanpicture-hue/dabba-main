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
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { DEMO } from "./lib/api.js";

const NotFound = () => (
  <div className="wrap narrow" style={{ paddingBlock: 64 }}>
    <h1>Page not found</h1>
    <p className="muted">Check the link, or go back to the <Link to="/">Dabba home page</Link>.</p>
  </div>
);

function App() {
  const { pathname } = useLocation();
  return (
    <>
      {DEMO && <div className="banner">Demo mode: everything you enter stays in this browser only.</div>}
      <div key={pathname} className={`page-wrap${pathname === "/" ? " home" : ""}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/s/:slug" element={<Shop />} />
          <Route path="/s/:slug/done" element={<Done />} />
          <Route path="/s/:slug/custom" element={<Request />} />
          <Route path="/o/:code" element={<Status />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Analytics />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
);
