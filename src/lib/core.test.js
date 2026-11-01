import test from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, addDays, dayOfWeek, priceOrder, dateProblem, availableDates, prepList, costing, todayPK, validateCustomer,
  effectiveDay, configureLine, lineLabel, quoteFigures, quoteExpired, timeline, validateRequest, dayLoad, needsAction } from "./core.js";

const tart = { id: "t", name: "Tart", price: 3000, units: 2, active: true, allow_message: true,
  options: [{ name: "Size", required: true, choices: [{ label: "8 inch", price: 0, units: 0 }, { label: "10 inch", price: 1200, units: 1 }] },
            { name: "Topping", required: false, choices: [{ label: "Berries", price: 300 }] }] };

test("options change price and slots", () => {
  const c = configureLine(tart, { Size: "10 inch", Topping: "Berries" }, "  Happy birthday Ali  ");
  assert.equal(c.price, 4500);
  assert.equal(c.units, 3);
  assert.equal(c.message, "Happy birthday Ali");
  assert.throws(() => configureLine(tart, {}), /Choose size/);
  assert.throws(() => configureLine(tart, { Size: "12 inch" }), /isn't available/);
  assert.equal(configureLine({ ...tart, allow_message: false }, { Size: "8 inch" }, "hi").message, "");
  const s = { name: "S", capacity: 6, lead_days: 2, closed_days: [], deposit_pct: 100, pickup_enabled: true, delivery_zones: [] };
  const p = priceOrder(s, [tart], { fulfilment: "pickup", lines: [{ item_id: "t", qty: 2, choices: { Size: "10 inch" } }] });
  assert.equal(p.subtotal, 8400);
  assert.equal(p.units, 6);
  assert.equal(lineLabel(p.lines[0]), "Tart (10 inch)");
});

test("per-date overrides", () => {
  const s = { capacity: 6, lead_days: 2, closed_days: [1], date_overrides: { "2026-11-02": { capacity: 12 }, "2026-10-30": { closed: true } } };
  assert.deepEqual(effectiveDay(s, "2026-11-02"), { closed: false, capacity: 12, override: true }); // a Monday, normally closed
  assert.equal(dateProblem(s, "2026-11-02", 10, 0, "2026-10-26"), null);
  assert.match(dateProblem(s, "2026-10-30", 1, 0, "2026-10-26"), /Closed/);
  assert.equal(dateProblem(s, "2026-10-28", null, 99, "2026-10-26"), null); // requests only check the date
});

test("quotes and requests", () => {
  const s = { deposit_pct: 50 };
  assert.deepEqual(quoteFigures(s, 5000, 300), { subtotal: 5000, total: 5300, deposit_due: 2650 });
  assert.equal(quoteExpired({ status: "quoted", quote_expires: "2020-01-01T00:00:00Z" }), true);
  assert.equal(quoteExpired({ status: "new", quote_expires: "2020-01-01T00:00:00Z" }), false);
  assert.match(validateRequest({ due_date: "2026-11-01", request: { details: "short" } }), /Describe/);
  const steps = timeline({ status: "quoted", request: { details: "x" }, fulfilment: "pickup" });
  assert.deepEqual(steps.filter((x) => x.done).map((x) => x.key), ["request", "quoted"]);
  const orders = [{ due_date: "d", status: "request", units: 0 }, { due_date: "d", status: "quoted", units: 3 }, { due_date: "d", status: "new", units: 2 }];
  assert.equal(dayLoad(orders, "d"), 2);
  assert.equal(needsAction({ status: "quoted" }), false);
  assert.equal(needsAction({ status: "request" }), true);
});

const shop = { name: "Test", capacity: 6, lead_days: 2, closed_days: [1], deposit_pct: 50, pickup_enabled: true, delivery_zones: [{ name: "DHA", fee: 300 }] };
const items = [
  { id: "a", name: "Tart", price: 2500, units: 2, active: true },
  { id: "b", name: "Brownie box", price: 1200, units: 1, active: true },
  { id: "c", name: "Old", price: 100, units: 1, active: false },
];

test("phone numbers normalise", () => {
  assert.equal(normalizePhone("0300 1234567"), "923001234567");
  assert.equal(normalizePhone("+92 300-1234567"), "923001234567");
  assert.equal(normalizePhone("3001234567"), "923001234567");
  assert.equal(normalizePhone("021 1234567"), null);
  assert.equal(normalizePhone("123"), null);
});

test("dates", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(dayOfWeek("2026-10-26"), 1);
  assert.match(todayPK(), /^\d{4}-\d{2}-\d{2}$/);
});

test("pricing uses server prices and deposit", () => {
  const p = priceOrder(shop, items, { fulfilment: "delivery", zone: "DHA", lines: [{ item_id: "a", qty: 2, price: 1 }, { item_id: "b", qty: 1 }] });
  assert.equal(p.subtotal, 6200);
  assert.equal(p.total, 6500);
  assert.equal(p.deposit_due, 3250);
  assert.equal(p.units, 5);
  assert.throws(() => priceOrder(shop, items, { fulfilment: "pickup", lines: [{ item_id: "c", qty: 1 }] }), /no longer available/);
  assert.throws(() => priceOrder(shop, items, { fulfilment: "delivery", zone: "Nowhere", lines: [{ item_id: "a", qty: 1 }] }), /delivery area/);
  assert.throws(() => priceOrder(shop, items, { fulfilment: "pickup", lines: [] }), /at least one/);
});

test("date rules", () => {
  const today = "2026-10-26"; // Monday
  assert.match(dateProblem(shop, "2026-10-27", 1, 0, today), /notice/);
  assert.equal(dateProblem(shop, "2026-10-28", 1, 0, today), null);
  assert.match(dateProblem(shop, "2026-11-02", 1, 0, today), /Closed/); // Monday
  assert.match(dateProblem(shop, "2026-10-28", 2, 5, today), /Fully booked/);
  assert.equal(dateProblem(shop, "2026-10-28", 1, 5, today), null);
  const days = availableDates(shop, { "2026-10-28": 6 }, 1, 5, today);
  assert.equal(days[0].ymd, "2026-10-28");
  assert.match(days[0].problem, /Fully/);
});

test("customer validation", () => {
  assert.match(validateCustomer({ customer_name: "", customer_phone: "03001234567" }), /name/);
  assert.match(validateCustomer({ customer_name: "Ali", customer_phone: "12" }), /mobile/);
  assert.match(validateCustomer({ customer_name: "Ali", customer_phone: "03001234567", fulfilment: "delivery", address: "x" }), /address/);
  assert.equal(validateCustomer({ customer_name: "Ali", customer_phone: "03001234567", fulfilment: "pickup" }), null);
});

test("prep list and costing", () => {
  const orders = [
    { due_date: "2026-10-28", status: "new", lines: [{ name: "Tart", qty: 2 }] },
    { due_date: "2026-10-28", status: "cancelled", lines: [{ name: "Tart", qty: 5 }] },
    { due_date: "2026-10-28", status: "confirmed", lines: [{ name: "Tart", qty: 1 }, { name: "Brownie box", qty: 3 }] },
  ];
  assert.deepEqual(prepList(orders, "2026-10-28"), [{ name: "Tart", qty: 3 }, { name: "Brownie box", qty: 3 }]);
  const c = costing([{ pack_price: 1000, pack_size: 500, used: 250 }, { pack_price: 600, pack_size: 200, used: 100 }], 2, 100, 2000);
  assert.equal(c.ingredients, 800);
  assert.equal(c.perPiece, 500);
  assert.equal(c.profit, 1500);
});

import { parseAddress, assessAddress, lookupQuery, matchGeocode, combineAddress } from "./core.js";

test("address parsing", () => {
  const a = parseAddress("House 12, Street 4, Phase 6, DHA");
  assert.equal(a.house, "12"); assert.equal(a.street, true); assert.match(a.block, /Phase 6/i);
  assert.equal(parseAddress("Plot 45-B, Block 7, Gulshan-e-Iqbal").house, "45-B");
  assert.equal(parseAddress("H# 9, Khayaban-e-Shamsheer").house, "9");
  assert.equal(parseAddress("Flat 3, Sea View Apartments, Clifton Block 2").house, "3");
  assert.equal(parseAddress("A-45, Block 2, Gulshan").house, "A-45");
  assert.equal(parseAddress("12/B Street 3 Nazimabad").house, "12/B");
  assert.match(parseAddress("House 5, F-7/2, Islamabad").block, /F-7\/2/i);
  assert.equal(parseAddress("Near Dolmen Mall, Clifton").landmark, true);
  assert.equal(parseAddress("Near Dolmen Mall, Clifton").house, null);
});

test("address assessment: junk blocks, gaps only nudge", () => {
  assert.equal(assessAddress("").blocking, true);
  assert.equal(assessAddress("asdf asdf").blocking, true);
  assert.equal(assessAddress("xxxxxxxxx").blocking, true);
  assert.equal(assessAddress("12345678").blocking, true);
  assert.equal(assessAddress("House 12, Street 4, Phase 6, DHA").level, "ok");
  const noHouse = assessAddress("Clifton Block 5 near Dolmen");
  assert.equal(noHouse.blocking, false); assert.equal(noHouse.level, "warn"); assert.match(noHouse.issues[0], /house/i);
  assert.equal(assessAddress("اوکھائی کا گھر نمبر ۱۲ کلفٹن").blocking, false); // Urdu is not junk
});

test("validateCustomer rejects junk delivery addresses only", () => {
  const base = { customer_name: "Ali", customer_phone: "03001234567", fulfilment: "delivery" };
  assert.match(validateCustomer({ ...base, address: "asdf asdf asdf" }), /doesn't look like an address/);
  assert.equal(validateCustomer({ ...base, address: "Near Dolmen Mall, Clifton" }), null);
  assert.equal(validateCustomer({ ...base, fulfilment: "pickup", address: "asdf asdf asdf" }), null);
});

test("lookup query drops the house number", () => {
  assert.equal(lookupQuery("House 12, Street 4, Phase 6, DHA"), "Street 4, Phase 6, DHA");
  assert.equal(lookupQuery("12/B, Block 5, Clifton"), "Block 5, Clifton");
});

const hit = (over = {}) => ({ lat: "24.8", lon: "67.0", display_name: "Block 5, Clifton, Karachi, Sindh, Pakistan", address: { road: "Block 5", suburb: "Clifton", city: "Karachi" }, ...over });

test("geocoder matches and messages", () => {
  assert.deepEqual(matchGeocode([], { city: "Karachi" }), { found: false });
  const m = matchGeocode([hit()], { city: "Karachi", house: "12" });
  assert.equal(m.precision, "street"); assert.equal(m.place, "Clifton, Karachi"); assert.equal(m.cityMismatch, false);
  assert.equal(matchGeocode([hit({ address: { house_number: "12", road: "x", suburb: "Clifton", city: "Karachi" } })], { city: "Karachi", house: "12" }).precision, "exact");
  const lahore = matchGeocode([hit({ display_name: "Gulberg, Lahore, Punjab, Pakistan", address: { suburb: "Gulberg", city: "Lahore" } })], { city: "Karachi" });
  assert.equal(lahore.cityMismatch, true);
  const good = assessAddress("House 12, Street 4, Phase 6, DHA");
  assert.equal(combineAddress(good, m, { city: "Karachi" }).status, "ok");
  assert.equal(combineAddress(good, lahore, { city: "Karachi" }).status, "warn");
  assert.equal(combineAddress(good, { found: false }).status, "warn");
  assert.equal(combineAddress(good, null).status, "unverified");
  assert.equal(combineAddress(assessAddress("asdf asdf"), m).status, "error");
  assert.equal(combineAddress(assessAddress("Block 5 Clifton"), m).status, "warn"); // no house number
});
