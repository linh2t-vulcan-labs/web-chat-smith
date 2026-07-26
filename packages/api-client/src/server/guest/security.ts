import "server-only";
import { publicEnv } from "@cs/env/server";
import type { NextRequest } from "next/server";

const BOT_USER_AGENT = /bot|crawler|spider/iu;

const isAllowedOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    const allowed = publicEnv.CS_PUBLIC_WEB_URL;

    // Local dev: accept any localhost port so the app's own browser origin
    // passes regardless of what CS_PUBLIC_WEB_URL happens to be set to.
    if (
      publicEnv.CS_PUBLIC_ENV_NAME !== "production" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    ) {
      return true;
    }

    if (!allowed) {
      return false;
    }
    const allowedUrl = new URL(allowed);
    return (
      url.host === allowedUrl.host ||
      (publicEnv.CS_PUBLIC_ENV_NAME === "production" &&
        url.host.endsWith(`.${allowedUrl.host}`))
    );
  } catch {
    return false;
  }
};

export interface GuestRequestValidation {
  isValid: boolean;
  error?: string;
}

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
  const referer = request.headers.get("referer");

  if (origin) {
    return isAllowedOrigin(origin)
      ? { isValid: true }
      : { error: "Request origin not allowed", isValid: false };
  }
  if (referer) {
    return isAllowedOrigin(referer)
      ? { isValid: true }
      : { error: "Request referer not allowed", isValid: false };
  }
  return { error: "Missing origin or referer header", isValid: false };
};

export const isLikelyBot = (request: NextRequest): boolean =>
  BOT_USER_AGENT.test(request.headers.get("user-agent") ?? "");
