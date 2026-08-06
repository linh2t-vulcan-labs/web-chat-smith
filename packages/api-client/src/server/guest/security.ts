import "server-only";
import { publicEnv } from "@cs/env/server";
import type { NextRequest } from "next/server";

const BOT_USER_AGENT = /bot|crawler|spider/iu;

// Local dev: accept any localhost port so the app's own browser origin
// passes regardless of what CS_PUBLIC_WEB_URL happens to be set to.
const isLocalDevOrigin = (url: URL): boolean =>
  publicEnv.CS_PUBLIC_ENV_NAME !== "production" &&
  (url.hostname === "localhost" || url.hostname === "127.0.0.1");

const matchesAllowedHost = (url: URL, allowedUrl: URL): boolean =>
  url.host === allowedUrl.host ||
  (publicEnv.CS_PUBLIC_ENV_NAME === "production" &&
    url.host.endsWith(`.${allowedUrl.host}`));

const isAllowedOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    if (isLocalDevOrigin(url)) {
      return true;
    }

    const allowed = publicEnv.CS_PUBLIC_WEB_URL;
    if (!allowed) {
      return false;
    }
    return matchesAllowedHost(url, new URL(allowed));
  } catch {
    return false;
  }
};

export interface GuestRequestValidation {
  isValid: boolean;
  error?: string;
}

const validateOriginHeader = (
  value: string,
  disallowedMessage: string
): GuestRequestValidation =>
  isAllowedOrigin(value)
    ? { isValid: true }
    : { error: disallowedMessage, isValid: false };

/**
 * Origin/referer check for the guest-session BFF routes
 * (`app/api/anon/*`) — same shape as `apps/super-app`'s anon security
 * middleware, trimmed to the checks that matter for a same-origin browser
 * call: no captcha/content-type plumbing here since `apps/web` doesn't ship
 * a captcha widget yet (see docs/runbook/api-client.md §4.5 follow-up).
 */
export const validateGuestRequest = (
  request: NextRequest
): GuestRequestValidation => {
  const origin = request.headers.get("origin");
  if (origin) {
    return validateOriginHeader(origin, "Request origin not allowed");
  }

  const referer = request.headers.get("referer");
  if (referer) {
    return validateOriginHeader(referer, "Request referer not allowed");
  }

  return { error: "Missing origin or referer header", isValid: false };
};

export const isLikelyBot = (request: NextRequest): boolean =>
  BOT_USER_AGENT.test(request.headers.get("user-agent") ?? "");
