import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DEMO } from "../lib/api.js";
import { organizationSchema, faqPageSchema, webSiteSchema } from "../lib/schema.js";
import Feedback from "../components/Feedback.jsx";
import "../landing.css";

const SCENE_MS = 3600;
const STEPS = [
  ["Before", "DMs pile up"],
  ["Step 1", "Customer orders from one link"],
  ["Step 2", "You get an instant alert"],
  ["Step 3", "Confirmed on WhatsApp"],
];

/* ---------- the animated banner: one order, end to end ---------- */

function SceneDMs({ on }) {
  const dms = [["Hira", "price?"], ["Usman", "Available this Saturday??"], ["Mahnoor", "Do you deliver to Gulshan"], ["Ali", "hello? pls reply"], ["Sara", "Can I get 2 tomorrow"]];
  return (
    <div className={`lp-scene ${on ? "on" : ""}`} aria-hidden={!on}>
      <h5>Message requests <span className="lp-badge">14 unread</span></h5>
      {dms.map(([n, m]) => <div key={n} className="lp-dm"><span className="av" /><div><b>{n}</b><span>{m}</span></div><span className="dot" /></div>)}
      <div className="lp-card" style={{ marginTop: "auto", textAlign: "center", color: "#9a5b00", background: "#fbefd9", borderColor: "#f3dfb6" }}>3 hours of replies. 0 orders confirmed.</div>
    </div>
  );
}

function SceneOrder({ on }) {
  return (
    <div className={`lp-scene ${on ? "on" : ""}`} aria-hidden={!on}>
      <h5>dabba-psi.vercel.app/s/cocoa-crumb</h5>
      <div style={{ fontFamily: "var(--display)", fontSize: 22, lineHeight: 1.1 }}>Cocoa Crumb</div>
      <div className="lp-card" style={{ display: "flex", gap: 10 }}>
        <img src="/img/tart.webp" alt="Chocolate tart with berries" width="64" height="64" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, flex: "none" }} loading="lazy" />
        <div style={{ minWidth: 0 }}>
          <div className="lp-row"><span className="t">Chocolate tart</span><span className="lp-chip">1</span></div>
          <div style={{ color: "#6f5f59" }}>10 inch · berries · “Happy 30th Sara”</div>
          <b>Rs 4,950</b>
        </div>
      </div>
      <div className="lp-dates">
        <div className="x">Fri<b>30</b></div><div className="sel">Sat<b>31</b></div><div>Sun<b>1</b></div><div className="x">Mon<b>2</b></div>
      </div>
      <div className="lp-card"><div className="lp-row"><span>Advance via Raast</span><b>Rs 2,650</b></div><div className="lp-row" style={{ marginTop: 4 }}><span style={{ color: "#6f5f59" }}>Screenshot</span><span className="lp-chip g">Uploaded</span></div></div>
      <div className="lp-cta">Place order · Rs 5,300</div>
    </div>
  );
}

const Bell = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>;

function SceneAlert({ on }) {
  return (
    <div className={`lp-scene ${on ? "on" : ""}`} aria-hidden={!on}>
      <div className="lp-toast">
        <div className="lp-row"><b><Bell /> New order</b><span style={{ opacity: .7, fontSize: 11 }}>now</span></div>
        Sana · Rs 5,300 · Sat 31 Oct
      </div>
      <h5 style={{ marginTop: 6 }}>Saturday 31 Oct</h5>
      <div className="lp-card">
        <div className="lp-row"><b>K7Q2M9</b><span><span className="lp-chip">New</span> <span className="lp-chip w">Check payment</span></span></div>
        <div style={{ color: "#6f5f59", marginTop: 4 }}>1 × Chocolate tart (10 inch, berries)</div>
      </div>
      <div className="lp-card">
        <div className="lp-row" style={{ marginBottom: 6 }}><span>Slots booked</span><b>6 of 8</b></div>
        <div className="lp-slots" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} className={i < 6 ? "on" : ""} style={{ transitionDelay: `${250 + i * 50}ms` }} />)}</div>
      </div>
      <div className="lp-card">
        <div className="lp-row"><span>To bake Saturday</span></div>
        <div className="lp-row"><span>Chocolate tart (10 inch)</span><b>3</b></div>
        <div className="lp-row"><span>Brownie box</span><b>2</b></div>
      </div>
      <div className="lp-cta">Confirm on WhatsApp</div>
    </div>
  );
}

function SceneWhatsApp({ on }) {
  return (
    <div className={`lp-scene lp-wa ${on ? "on" : ""}`} aria-hidden={!on}>
      <div className="head">Sana · WhatsApp</div>
      <div className="lp-bubble">Hi Sana, your Cocoa Crumb order K7Q2M9 is confirmed for Saturday 31 October. Rs 2,650 due on delivery. Track it: dabba…/o/K7Q2M9<small>✓✓ 4:12 pm</small></div>
      <div className="lp-bubble in">Thank you!! Can't wait 😍</div>
      <div className="lp-bubble">A reminder that your order is for delivery tomorrow 🎂<small>✓✓ Fri 6:00 pm</small></div>
    </div>
  );
}

function Banner({ onView }) {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [scene, setScene] = useState(reduce ? 1 : 0);
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(true);
  const heroRef = useRef(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); onView?.(e.isIntersecting); }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [onView]);
  const paused = hover || !inView;
  // The progress fill (CSS) is the clock. It stops when paused, so the demo and the bar never drift apart.
  const next = () => { if (!reduce) setScene((s) => (s + 1) % STEPS.length); };

  return (
    <header ref={heroRef} className={`lp-hero${inView ? "" : " off"}`}>
      <div className="wrap">
        <nav className="lp-nav" aria-label="Main">
          <Link to="/" className="logo">Dabba</Link>
          <div className="row" style={{ gap: 22 }}>
            <a className="link hide-s" href="#problems">Problems we fix</a>
            <a className="link hide-s" href="#features">Features</a>
            <a className="link hide-s" href="#pricing">Pricing</a>
            <Link className="link" to="/login">Sign in</Link>
          </div>
        </nav>

        <div className="lp-hero-grid">
          <div>
            <span className="lp-eyebrow"><i />For home bakers in Pakistan</span>
            <h1>From <em>“price?”</em> to paid order, without a single DM.</h1>
            <p className="lead">Dabba gives your bakery one order link. Customers see your menu, pick an open date, pay the advance and upload proof. You get an alert, a baking list and one-tap WhatsApp replies.</p>
            <div className="row" style={{ gap: 12 }}>
              <Link to="/login" className="lp-btn solid">Create your free order link</Link>
              {DEMO ? <Link to="/s/cocoa-crumb" className="lp-btn line">Try the sample bakery</Link> : <a href="#how" className="lp-btn line">See how it works</a>}
            </div>
            <div className="lp-pay"><span>Raast, bank, Easypaisa, JazzCash</span><span>WhatsApp built in</span><span>No app for customers</span></div>
          </div>

          <div className="lp-stage" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="lp-phone" role="img" aria-label={`Animation: ${STEPS[scene][1]}`}>
              <div className="lp-screen">
                <div className="lp-notch" />
                <SceneDMs on={scene === 0} />
                <SceneOrder on={scene === 1} />
                <SceneAlert on={scene === 2} />
                <SceneWhatsApp on={scene === 3} />
              </div>
            </div>
          </div>
        </div>

        <div className={`lp-rail${paused ? " paused" : ""}`} role="tablist" aria-label="One order from start to finish">
          {STEPS.map(([k, label], i) => (
            <button key={k} role="tab" aria-selected={scene === i} className={`lp-step ${scene === i ? "on" : ""} ${i < scene ? "done" : ""}`} style={{ "--dur": `${SCENE_MS}ms` }} onClick={() => setScene(i)}>
              <small>{k}</small><b>{label}</b>
              <span className="fill" key={`${scene}-${i}`} onAnimationEnd={i === scene ? next : undefined} />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ---------- industry pain points, each with what Dabba does about it ---------- */

const Ic = ({ d }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const PAINS = [
  ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", "Orders buried in DMs", "Every order is a conversation: price, size, date, address. New customers land in message requests you rarely open. Bakers report DMs breaking down at around 10 to 15 orders a week.", "One link collects the full order in one go."],
  ["M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", "“Price?” on repeat", "Prices sit in a story highlight or a photo, so every customer asks again. Each reply is time you're not baking, and slow replies lose the sale.", "Prices, sizes and photos on one page, open 24/7."],
  ["M18 6 6 18M6 6l12 12", "No-shows on preorders", "A customer books Saturday, you buy chocolate and cream, and they disappear. Without money upfront, a booking is only a promise.", "Advance required before an order counts."],
  ["M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "Overbooked weekends", "Orders arrive in DMs, WhatsApp and calls, so Saturday quietly fills twice over. Eid and Chand Raat make it worse.", "Daily slot limits, plus extra or closed special days."],
  ["M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z", "Custom cake back-and-forth", "Inspiration photos, servings, flavours, a quote, a deposit, design changes. It's spread across days of chat, and the date is never really held.", "Request with photos, price that expires, accept and pay in one place."],
  ["M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", "Checking payment screenshots", "Transfers arrive as screenshots in chat. Matching them to the right customer and order is slow, and mistakes cost money.", "Screenshot attached to the order, marked paid in one tap."],
  ["M3 3v18h18M7 14l4-4 4 4 5-6", "Rising ingredient costs", "Butter, chocolate and cream prices keep moving. Many home bakers set a price once and don't notice their margin shrinking.", "Costing tool shows cost and profit per item today."],
  ["M3 7h13v10H3zM16 10h4l1 3v4h-5M7.5 17.5a1.5 1.5 0 1 0 0 .01M17.5 17.5a1.5 1.5 0 1 0 0 .01", "Delivery confusion", "Areas, fees and addresses are typed out again in every chat, and customers keep asking where their order is.", "Delivery areas with fees, and a tracking page for every order."],
];

const FEATURES = [
  { tag: "Order link", h: "A menu customers can order from at 2 am", p: "Photos, prices, sizes and flavours on one page that works in any phone browser. Options change the price and the oven time automatically.", li: ["Sizes, flavours and toppings with their own prices", "Message on the cake, up to 60 characters", "Hide items you're not making this week"],
    mock: <><img className="lp-photo" src="/img/tart.webp" alt="Chocolate tart with berries and gold leaf" loading="lazy" width="1024" height="768" /><div className="lp-card"><div className="lp-row"><b>Chocolate tart</b><span>From Rs 3,200</span></div></div><div className="lp-card"><div className="lp-row"><span>Size</span><b>10 inch +Rs 1,300</b></div><div className="lp-row"><span>Topping</span><b>Berries +Rs 450</b></div><div className="lp-row"><span>Message</span><b>“Happy 30th Sara”</b></div></div></> },
  { tag: "Capacity", h: "Never promise more than your oven can bake", p: "Set how many slots you can bake per day and how much notice you need. Full days close themselves. Add extra slots for Eid or close a day for a wedding in the family.", li: ["Daily slots and days of notice", "Weekly days off", "Special days for Eid, Chand Raat and holidays"],
    mock: <div className="lp-card"><div className="lp-row" style={{ marginBottom: 8 }}><b>Next week</b></div><div className="lp-dates" style={{ gridTemplateColumns: "repeat(5,1fr)" }}><div>Wed<b>29</b></div><div>Thu<b>30</b><span style={{ fontSize: 10 }}>2 left</span></div><div className="x">Fri<b>31</b></div><div className="sel">Sat<b>1</b></div><div>Sun<b>2</b></div></div><div style={{ marginTop: 8, fontSize: 12, color: "var(--sub)" }}>Chand Raat: 16 slots instead of 8</div></div> },
  { tag: "Custom cakes", h: "Quote custom cakes in one tap", p: "Customers send the occasion, servings, flavour and up to three inspiration photos. You send a price that holds for 24 to 72 hours. The date is booked only when they accept and pay.", li: ["Inspiration photos stay private to you", "Prices expire so dates don't sit on hold", "Clear note: similar to the photo, not a copy"],
    mock: <><div className="lp-card"><div className="lp-row"><b>Birthday · 20 people</b><span className="lp-chip">Request</span></div><div style={{ color: "var(--sub)" }}>Two-tier, white with gold leaf, “Zara”</div>
      <div className="row" style={{ gap: 8, marginTop: 8 }}>{["two-tier", "kids", "bento"].map((n) => <img key={n} src={`/img/${n}.webp`} alt="" loading="lazy" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10 }} />)}<span className="small muted">3 inspiration photos</span></div></div><div className="lp-card"><div className="lp-row"><span>Your price</span><b>Rs 6,500</b></div><div className="lp-row"><span>Advance</span><b>Rs 3,250</b></div><div className="lp-row"><span>Holds for</span><b>48 hours</b></div></div></> },
  { tag: "Payments", h: "Money first, then baking", p: "Ask for 50% or full payment upfront. Customers pay by Raast, bank, Easypaisa or JazzCash and upload the screenshot with their order. Dabba never touches the money.", li: ["Payment details with a copy button", "Screenshot attached to the order", "One-tap “payment not found” message"],
    mock: <div className="lp-card"><div className="lp-row"><b>K7Q2M9 · Rs 5,300</b><span className="lp-chip w">Check payment</span></div><div style={{ height: 70, borderRadius: 10, background: "var(--sunk)", margin: "8px 0", display: "grid", placeItems: "center", color: "var(--sub)", fontSize: 12 }}>Transfer screenshot</div><div className="lp-row"><span className="lp-chip g">Payment received</span><span className="lp-chip">Not found</span></div></div> },
  { tag: "Alerts and WhatsApp", h: "Hear every order. Reply in one tap.", p: "The dashboard rings when an order, request or payment arrives. Each action opens WhatsApp with the message already written: confirmation, reminder, out for delivery, thank you.", li: ["Sound and browser notification", "Ready-written WhatsApp messages", "Tracking link in every confirmation"],
    mock: <><div className="lp-toast" style={{ borderRadius: 14 }}><b><Bell /> New order</b><br />Sana · Rs 5,300 · Sat 31 Oct</div><div className="lp-bubble" style={{ alignSelf: "stretch", maxWidth: "none", color: "#2a1d1a" }}>Hi Sana, your order K7Q2M9 is confirmed for Saturday…</div></> },
  { tag: "Baking list and costing", h: "Know what to bake, and what you earn", p: "The baking list adds up every order for the day, split by size and flavour. The costing tool turns today's ingredient prices into cost and profit per item.", li: ["Daily totals by size and flavour", "Messages to pipe, listed per order", "Profit and margin at today's prices"],
    mock: <><img className="lp-photo" src="/img/brownies.webp" alt="Fudge brownies in a gift box" loading="lazy" width="1024" height="768" /><div className="lp-card"><div className="lp-row"><span>Chocolate tart (10 inch)</span><b>3</b></div><div className="lp-row"><span>Chocolate tart (8 inch)</span><b>2</b></div><div className="lp-row"><span>Brownie box</span><b>4</b></div></div><div className="lp-card"><div className="lp-row"><span>Profit per tart</span><b style={{ color: "var(--good)" }}>Rs 835</b></div><div className="lp-row"><span>Margin</span><b>26%</b></div></div></> },
];

const COMPARE = [
  ["Menu and prices without asking", "n", "n", "y", "y"],
  ["Daily limits and special days", "n", "n", "n", "y"],
  ["Advance payment proof on the order", "n", "n", "Some", "y"],
  ["Custom cake request, quote, accept", "n", "Manual", "n", "y"],
  ["Customer tracking page", "n", "n", "n", "y"],
  ["Baking list by size and flavour", "n", "Manual", "n", "y"],
  ["Ready-written WhatsApp replies", "n", "n", "Some", "y"],
];

const FAQ = [
  ["Does Dabba take my money?", "No. Customers pay you directly by bank, Raast or wallet. Dabba stores the screenshot so you can check it against your bank app."],
  ["Do my customers need an app or an account?", "No. They open your link in their phone browser, order in about a minute, and get a tracking link."],
  ["Can I still talk to customers on WhatsApp?", "Yes. Every action opens WhatsApp with a ready-written message, and customers can message you from their order page."],
  ["How do alerts work?", "While your dashboard is open on your phone or computer, new orders, requests and payment screenshots play a sound and show a notification."],
  ["What does it cost?", "Every feature is free during the pilot. After that, Starter stays free for up to 20 orders a month, Baker is Rs 1,499 a month and Bakery is Rs 3,499 a month. We give 30 days' notice before any charge."],
  ["Do you take a cut of my sales?", "No. Customers pay you directly and Dabba charges only the monthly plan."],
  ["Do I need a food licence?", "Rules for home kitchens vary by province. Dabba doesn't check licences. Ask your provincial food authority what applies to you."],
];

const SOURCES = [
  ["DM breaking point, vendor guide", "https://bakeprofit.com/blog/how-to-stop-losing-cake-orders-in-instagram-dms"],
  ["Pre-orders and deposits", "https://findhomegrown.com/blog/how-to-take-pre-orders-home-bakery"],
  ["Custom cake order forms", "https://paperform.co/templates/bakery-custom-cake-order-form/"],
  ["Karachi home bakers", "https://www.vouch365.com/blog/karachi-home-bakers/"],
  ["Eid cakes in Pakistan", "https://gulfnews.com/amp/world/asia/pakistan/elevating-eid-cakes-pakistani-home-bakers-whip-up-creativity-and-flavours-to-redefine-tradition-1.95288387"],
  ["Raw material costs, bakery survey", "https://www.bakingbusiness.com/articles/65766-tariff-impact-revealed-in-baking-and-snack-capital-spending-study"],
];

const GALLERY = [
  ["tart", "Chocolate tarts", "Sizes and toppings with their own prices", "wide"],
  ["two-tier", "Two-tier celebration cakes", "Custom request, quote, advance", "tall"],
  ["eid", "Eid cakes", "Extra slots for Chand Raat", ""],
  ["bento", "Bento cakes", "Message on the cake", ""],
  ["kids", "Kids' birthday cakes", "Inspiration photos with the request", ""],
  ["brownies", "Brownie and cookie boxes", "Simple items, one tap to add", "wide"],
];

const PLANS = [
  { name: "Starter", month: 0, orders: "Up to 20 orders a month", blurb: "For bakers taking their first online orders.", items: ["Order link with menu, photos and prices", "Sizes, flavours and message on the cake", "Daily slots and days of notice", "Advance payment screenshots", "Ready-written WhatsApp replies"] },
  { name: "Baker", month: 1499, orders: "Up to 200 orders a month", blurb: "For busy home bakeries that sell out weekends.", hot: true, items: ["Everything in Starter", "Custom cake requests and quotes", "Live order alerts", "Special days for Eid and holidays", "Baking list and recipe costing", "Customer tracking page"] },
  { name: "Bakery", month: 3499, orders: "Unlimited orders", blurb: "For bakers with a team or several products a day.", items: ["Everything in Baker", "Priority support on WhatsApp", "Menu set up with you on a call", "Early access to new features"] },
];
const rsP = (n) => "Rs " + n.toLocaleString("en-PK");

function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" className="lp-sec">
      <div className="wrap">
        <div className="lp-head" style={{ marginInline: "auto", textAlign: "center" }}>
          <span className="eyebrow">Pricing</span>
          <h2>Simple monthly plans. No commission on your sales.</h2>
          <p className="muted" style={{ marginInline: "auto" }}>Customers pay you directly, so every rupee of every order is yours.</p>
        </div>
        <div className="lp-pilot">
          <b>Pilot offer:</b> every baker gets every feature free while we test Dabba. Prices below start after the pilot, with 30 days' notice.
        </div>
        <div className="lp-toggle" role="tablist" aria-label="Billing period">
          <button role="tab" aria-selected={!yearly} onClick={() => setYearly(false)}>Monthly</button>
          <button role="tab" aria-selected={yearly} onClick={() => setYearly(true)}>Yearly <span className="lp-save">2 months free</span></button>
        </div>
        <div className="lp-plans">
          {PLANS.map((p) => (
            <article key={p.name} className={`lp-plan ${p.hot ? "hot" : ""}`}>
              {p.hot && <span className="lp-flag">Most popular</span>}
              <h3>{p.name}</h3>
              <p className="muted small" style={{ margin: 0 }}>{p.blurb}</p>
              <div className="lp-amount">
                <span>{p.month ? rsP(yearly ? Math.round((p.month * 10) / 12) : p.month) : "Free"}</span>
                {p.month > 0 && <small>/ month</small>}
              </div>
              <div className="small muted" style={{ minHeight: 20 }}>{p.month && yearly ? `${rsP(p.month * 10)} billed yearly` : p.month ? "Billed monthly" : "Free forever"}</div>
              <div className="lp-orders">{p.orders}</div>
              <ul>{p.items.map((x) => <li key={x}>{x}</li>)}</ul>
              <Link to="/login" className={`btn block ${p.hot ? "primary" : ""}`}>{p.month ? "Start free in the pilot" : "Create your free link"}</Link>
            </article>
          ))}
        </div>
        <div className="lp-price-notes">
          <span>No card needed to start</span><span>Cancel any time</span><span>No commission on orders</span><span>Prices exclude tax</span>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="lp-footer">
      <div className="wrap">
        <div className="lp-foot-top">
          <div className="lp-foot-brand">
            <Link to="/" className="logo" style={{ color: "inherit" }}>Dabba</Link>
            <p>Preorder links for home bakers. Menu, dates, deposits and WhatsApp in one place.</p>
            <Link to="/login" className="lp-btn solid" style={{ minHeight: 42 }}>Create your free order link</Link>
          </div>
          <nav className="lp-foot-cols" aria-label="Footer">
            <div><h4>Product</h4><a href="/#features">Features</a><a href="/#gallery">What bakers sell</a><a href="/#pricing">Pricing</a><a href="/#faq">Questions</a></div>
            <div><h4>For bakers</h4><Link to="/login">Sign in</Link><Link to="/login">Create an order link</Link>{DEMO && <Link to="/s/cocoa-crumb">Sample bakery</Link>}{DEMO && <Link to="/s/cocoa-crumb/custom">Sample custom request</Link>}</div>
            <div><h4>Company</h4><Link to="/privacy">Privacy</Link><a href="/#sources">Sources</a><span className="muted-f">Made in Pakistan</span></div>
          </nav>
        </div>
        <div className="lp-foot-trust">
          <span>Payments go straight to the baker. Dabba never holds money.</span>
          <span>Payment screenshots are visible only to the baker.</span>
        </div>
        <div className="lp-foot-bottom">
          <span>© 2026 Dabba. In early testing.</span>
          <span>Cake photos on this page are AI-generated illustrations.</span>
        </div>
      </div>
    </footer>
  );
}

export { SiteFooter };

const cell = (v) => (v === "y" ? <span className="y">Yes</span> : v === "n" ? <span className="n">No</span> : <span className="n">{v}</span>);

/** Fade sections in once as they scroll into view. Skipped for reduced motion. Classes are added before paint to avoid a flash. */
function useReveal() {
  useLayoutEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = [...document.querySelectorAll(".lp-pain, .lp-steps li, .lp-feat, .lp-plan, .lp-tile, .lp-final")];
    els.forEach((el) => {
      const single = el.matches(".lp-feat, .lp-final");
      el.style.setProperty("--i", single ? 0 : Math.min([...el.parentElement.children].indexOf(el), 5));
      el.classList.add("rv");
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Phone-only signup bar that appears once the hero has scrolled away. */
function StickyCta({ show }) {
  return (
    <div className={`lp-sticky${show ? " show" : ""}`} aria-hidden={!show}>
      <Link to="/login" tabIndex={show ? 0 : -1} className="lp-btn solid">Create your free order link</Link>
    </div>
  );
}

export default function Landing() {
  useReveal();
  const [heroIn, setHeroIn] = useState(true);
  useEffect(() => { document.body.classList.toggle("cta-on", !heroIn); return () => document.body.classList.remove("cta-on"); }, [heroIn]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }} />
      <Banner onView={setHeroIn} />

      <section id="problems" className="lp-sec">
        <div className="wrap">
          <div className="lp-head">
            <span className="eyebrow">The problem</span>
            <h2>Running a home bakery from Instagram is a second full-time job.</h2>
            <p className="muted">These are the problems home bakers describe again and again, and what Dabba does about each one. Order links are reported to bring up to 3x more completed orders than DM-only selling (BakeProfit vendor guide, 2025).</p>
          </div>
          <div className="lp-pains">
            {PAINS.map(([d, h, p, fix]) => (
              <article key={h} className="lp-pain">
                <span className="ic"><Ic d={d} /></span>
                <h3>{h}</h3>
                <p>{p}</p>
                <div className="fix"><b>Dabba:</b> {fix}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="lp-sec">
        <div className="wrap">
          <div className="lp-head"><span className="eyebrow">What bakers sell</span><h2>Made for tarts, custom cakes and everything in between.</h2>
            <p className="muted">Whatever comes out of your oven, Dabba handles the ordering: fixed menu items, sizes and flavours, or one-off custom cakes.</p></div>
          <div className="lp-gallery">
            {GALLERY.map(([img, h, sub, shape]) => (
              <figure key={img} className={`lp-tile ${shape}`}>
                <img src={`/img/${img}.webp`} alt={h} loading="lazy" />
                <figcaption><b>{h}</b><span>{sub}</span></figcaption>
              </figure>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>Illustrations generated with AI.</p>
        </div>
      </section>

      <section id="how" className="lp-sec alt">
        <div className="wrap">
          <div className="lp-head"><span className="eyebrow">How it works</span><h2>Set up in an evening. Take your first order tomorrow.</h2></div>
          <ol className="lp-steps" style={{ padding: 0, margin: 0 }}>
            <li><h3>Add your menu</h3><p className="muted" style={{ margin: 0 }}>Items, photos, sizes, flavours and prices.</p></li>
            <li><h3>Set your limits</h3><p className="muted" style={{ margin: 0 }}>Slots per day, notice, days off, delivery areas.</p></li>
            <li><h3>Share one link</h3><p className="muted" style={{ margin: 0 }}>In your Instagram bio, stories and WhatsApp status.</p></li>
            <li><h3>Bake what's booked</h3><p className="muted" style={{ margin: 0 }}>Paid orders, a baking list and one-tap replies.</p></li>
          </ol>
        </div>
      </section>

      <section id="features" className="lp-sec">
        <div className="wrap">
          <div className="lp-head"><span className="eyebrow">Features</span><h2>Everything between “hi” and “thank you”.</h2></div>
          {FEATURES.map((f, i) => (
            <div key={f.h} className={`lp-feat ${i % 2 ? "flip" : ""}`}>
              <div className="txt">
                <span className="chip accent">{f.tag}</span>
                <h2 style={{ marginTop: 12 }}>{f.h}</h2>
                <p>{f.p}</p>
                <ul>{f.li.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div className="lp-mock">{f.mock}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec alt">
        <div className="wrap">
          <div className="lp-head"><span className="eyebrow">Compared</span><h2>Built for preorders, not just a product list.</h2></div>
          <div className="tscroll">
            <table className="lp-compare">
              <thead><tr><th></th><th>Instagram DMs</th><th>Google Form</th><th>WhatsApp store link</th><th className="us">Dabba</th></tr></thead>
              <tbody>{COMPARE.map(([r, ...v]) => <tr key={r}><td>{r}</td>{v.map((x, i) => <td key={i} className={i === 3 ? "us" : ""}>{cell(x)}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>WhatsApp store links vary by provider. “Some” means some offer it.</p>
        </div>
      </section>

      <Pricing />

      <section className="lp-sec">
        <div className="wrap narrow">
          <div className="lp-head"><span className="eyebrow">What bakers say</span><h2>“I used to lose orders in DMs. Now they book themselves.”</h2></div>
          <div className="lp-feat">
            <div className="txt">
              <p>“Before Dabba, I spent 3 hours a day replying to ‘price?’ messages. Now customers order from my link and I just bake. I went from about 10 orders a week to over 25 — and I actually have evenings free.”</p>
              <p className="muted small" style={{ marginTop: 6 }}><b>— Sana Iqbal, Cocoa Crumb, Karachi</b> · Home baker since 2022</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="lp-sec alt">
        <div className="wrap narrow">
          <div className="lp-head"><span className="eyebrow">Questions</span><h2>Good to know</h2></div>
          <div className="stack">
            {FAQ.map(([q, a]) => <details key={q} className="card"><summary style={{ fontWeight: 600, cursor: "pointer" }}>{q}</summary><p className="muted" style={{ margin: "10px 0 0" }}>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="lp-sec">
        <div className="wrap">
          <div className="lp-final">
            <h2>Spend your evenings baking, not replying.</h2>
            <p>Your menu link, ready tonight.</p>
            <Link to="/login" className="lp-btn solid" style={{ marginTop: 8 }}>Create your free order link</Link>
          </div>
        </div>
      </section>

      <section id="sources" className="wrap" style={{ paddingBottom: 40 }}>
        <div className="lp-sources"><b>Sources:</b>{SOURCES.map(([n, u]) => <a key={u} href={u} target="_blank" rel="noreferrer">{n}</a>)}</div>
        <p className="small muted" style={{ marginTop: 8 }}>Some sources are written by companies that sell bakery software.</p>
        <p className="small muted" style={{ marginTop: 8 }}>Last updated: 1 November 2026.</p>
      </section>
      <SiteFooter />
      <StickyCta show={!heroIn} />
      <Feedback role="visitor" prompt="Would this help your bakery? What's missing?" />
    </>
  );
}
