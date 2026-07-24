import type { NextRequest } from "next/server";

import { XCountryKey, XTimezoneKey } from "@/utils/commons/keys";

/**
 * Extracts headers from request to proxy to external services
 */
export function getProxyHeaders(request: NextRequest): Record<string, string> {
  const { headers } = request;
  return {
    [XCountryKey]: headers.get("cf-ipcountry") || "",
    [XTimezoneKey]: headers.get("cf-timezone") || "",
    "x-forwarded-for": headers.get("x-forwarded-for") || "",
    "User-Agent": headers.get("user-agent") || "",
    Referer: headers.get("referer") || "",
  };
}
