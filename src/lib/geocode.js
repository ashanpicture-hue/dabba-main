// Address lookup. Local rules run first (core.js); this adds one optional map check on top.
//
// Provider: OpenStreetMap Nominatim. Free, no key, CORS enabled. Its public usage policy applies:
// at most 1 request per second, no search-as-you-type, no bulk use. We only look up after the
// person finishes typing, and we cache. Before real traffic, point VITE_GEOCODER_URL at a
// Nominatim-compatible endpoint you control or pay for (Geoapify, LocationIQ, self-hosted).
// Only the address text is sent. Never the name or phone number.
import { assessAddress, lookupQuery, matchGeocode, combineAddress } from "./core.js";

const ENDPOINT = import.meta.env.VITE_GEOCODER_URL || "https://nominatim.openstreetmap.org/search";
const MIN_GAP_MS = 1100;
const TIMEOUT_MS = 9000;

let lastCall = 0;
const cache = new Map();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q, signal) {
  const gap = MIN_GAP_MS - (Date.now() - lastCall);
  if (gap > 0) await wait(gap);
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  lastCall = Date.now();
  const url = new URL(ENDPOINT);
  url.search = new URLSearchParams({ q, format: "jsonv2", addressdetails: "1", limit: "5", countrycodes: "pk", "accept-language": "en" });
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoder returned ${res.status}`);
  return res.json();
}

/** Tries the full address, then without the house number, then just the last two parts (usually phase and area). */
function queriesFor(address, city) {
  const tail = address.split(",").map((x) => x.trim()).filter(Boolean).slice(-2).join(", ");
  const withPlace = (a) => [a, city, "Pakistan"].filter(Boolean).join(", ");
  return [...new Set([withPlace(address), withPlace(lookupQuery(address)), withPlace(tail)])];
}

/**
 * Check a delivery address. Always resolves to { status, title, lines } where status is
 * "ok" | "warn" | "error" | "unverified". A network failure is "unverified", never a thrown error,
 * so a flaky free service can't stop someone ordering.
 */
export async function verifyAddress(address, { city = "", signal } = {}) {
  const local = assessAddress(address);
  if (local.blocking) return combineAddress(local, null, { city });

  const key = `${city}|${local.parts.text.toLowerCase()}`;
  if (cache.has(key)) return cache.get(key);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    let match = { found: false };
    for (const q of queriesFor(local.parts.text, city)) {
      const results = await search(q, ctrl.signal);
      match = matchGeocode(results, { city, house: local.parts.house });
      if (match.found) break;
    }
    const out = combineAddress(local, match, { city });
    cache.set(key, out);
    return out;
  } catch {
    // Aborted by the caller, timed out, offline or rate limited: fall back to local advice only.
    return combineAddress(local, null, { city });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
