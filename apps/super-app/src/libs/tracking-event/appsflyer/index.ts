import type { TAppsFlyerEvent } from "./types";

/**
 * Sends an AppsFlyer event without throwing errors.
 * Guards against missing SDK; no-op if unavailable (e.g. during SSR or
 * before the SDK script loads).
 */
const sendAppsFlyerEvent = ({ name, payload = {} }: TAppsFlyerEvent): void => {
  if (typeof window === "undefined" || typeof window.AF !== "function") {
    return;
  }
  window.AF("event", name, payload);
};

export * from "./provider";

export { sendAppsFlyerEvent };
