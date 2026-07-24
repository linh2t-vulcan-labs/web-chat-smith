"use client";

// Session-stable seed for the home logo-template shuffle (AC9).
//
// The server generates a fresh shuffle seed on every render (the design-studio tree is force-dynamic),
// so a plain soft-navigation back to the home would reshuffle the templates every time. To keep the
// order stable within a browsing session while STILL reshuffling on a real reload, we cache the first
// seed in a module-level variable:
//   - soft-navigation keeps the same browser JS context  -> the cached seed survives -> order stable
//   - a full document reload (F5) starts a fresh context  -> the cache is wiped       -> order reshuffles
// (sessionStorage/localStorage would survive a reload too, so they are deliberately NOT used here.)

// First seed observed in this browser JS context; null until the first client render sets it.
let cachedSeed: number | null = null;

// On the server, the per-request seed is returned untouched — module state is shared across requests
// there, so caching it would leak one request's order into another. The cache is browser-only.
export const resolveSessionSeed = (serverSeed: number): number => {
  if (typeof window === "undefined") {
    return serverSeed;
  }

  if (cachedSeed === null) {
    cachedSeed = serverSeed;
  }

  return cachedSeed;
};
