import { publicEnv } from "@cs/env/server";

const DEFAULT_BASE_URL = "https://chatsmith.io";

function normalizeSiteBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/u, "");
  return trimmed || DEFAULT_BASE_URL;
}

/** Canonical site origin from `WEB_URL`, used for JSON-LD and SEO absolute URLs. */
export const BASE_URL = normalizeSiteBaseUrl(
  publicEnv.CS_PUBLIC_WEB_URL || DEFAULT_BASE_URL
);
