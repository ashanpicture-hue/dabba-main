// Cookie and analytics choice, kept in this browser. No server round trip.
import { useSyncExternalStore } from "react";

const KEY = "dabba-consent-v1";
const MAX_AGE_MS = 365 * 24 * 3600e3; // ask again after a year

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (v && typeof v.analytics === "boolean" && Date.now() - v.at < MAX_AGE_MS) return v;
  } catch {}
  return null;
}

const initial = read();
let state = { choice: initial, open: !initial };
const subs = new Set();
const set = (next) => { state = next; subs.forEach((f) => f()); };

export function setConsent(analytics) {
  const choice = { analytics, at: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch {}
  set({ choice, open: false });
}

/** Reopen the banner, from the footer or the privacy page. */
export const openCookieSettings = () => set({ ...state, open: true });
export const closeCookieSettings = () => set({ ...state, open: false });

/** { choice: { analytics, at } | null, open } */
export const useConsent = () => useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state, () => state);
