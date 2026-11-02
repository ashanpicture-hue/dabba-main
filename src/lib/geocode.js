// Address lookup. Local rules run first (core.js); this adds one optional map check on top.
//
// Provider: Geoapify Geocoding API. The key comes from VITE_GEOAPIFY_KEY (never hard-code it).
// Geoapify keys are public in the browser bundle by design, so in the Geoapify dashboard restrict
// the key to your domains (dabba.devs.surf, localhost). Free plan allows 5 requests per second.
// We still only look up after the person finishes typing, and we cache.
// Only the address text is sent. Never the name or phone number.
import { assessAddress, lookupQuery, matchGeocode, combineAddress } from "./core.js";

const ENDPOINT = "https://api.geoapify.com/v1/geocode/search";
const API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
const MIN_GAP_MS = 300;
const TIMEOUT_MS = 9000;

let lastCall = 0;
const cache = new Map();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Geoapify result -> the Nominatim shape matchGeocode() already understands. */
function toNominatim(r) {
  return {
    lat: r.lat,
    lon: r.lon,
    display_name: r.formatted || "",
    address: {
      house_number: r.housenumber,
      road: r.street,
      neighbourhood: r.neighbourhood,
      suburb: r.suburb || r.district,
      city: r.city || r.town || r.village,
      state_district: r.county,
    },
  };
}

async function search(q, signal) {
  const gap = MIN_GAP_MS - (Date.now() - lastCall);
  if (gap > 0) await wait(gap);
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  lastCall = Date.now();
  const url = new URL(ENDPOINT);
  url.search = new URLSearchParams({ text: q, format: "json", limit: "5", lang: "en", filter: "countrycode:pk", apiKey: API_KEY });
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoder returned ${res.status}`);
  const body = await res.json();
  return (body.results || []).map(toNominatim);
}

/** Tries the full address, then without the house number, then just the last two parts (usually phase and area). */
function queriesFor(address, city) {
  const tail = address.split(",").map((x) => x.trim()).filter(Boolean).slice(-2).join(", ");
  const withPlace = (a) => [a, city, "Pakistan"].filter(Boolean).join(", ");
  return [...new Set([withPlace(address), withPlace(lookupQuery(address)), withPlace(tail)])];
}

/**
 * Check a delivery address. Always resolves to { status, title, lines } where status is
 * "ok" | "warn" | "error" | "unverified". A network failure or a missing key is "unverified",
 * never a thrown error, so the geocoder can't stop someone ordering.
 */
export async function verifyAddress(address, { city = "", signal } = {}) {
  const local = assessAddress(address);
  if (local.blocking) return combineAddress(local, null, { city });
  if (!API_KEY) return combineAddress(local, null, { city });

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
    return combineAddress(local, null, { city });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
