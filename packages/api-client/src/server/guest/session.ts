import "server-only";
import { env } from "@cs/env";
import { publicEnv } from "@cs/env/server";

import type { ApiResult } from "../../errors/api-error";
import { ApiError } from "../../errors/api-error";
import { userManagement } from "../../services/user-management";
import type { GuestSession } from "./cookies";
import {
  clearGuestSessionCookie,
  getGuestCsrfCookie,
  getGuestNonceCookie,
  getGuestSessionCookie,
  setGuestCsrfCookie,
  setGuestNonceCookie,
  setGuestSessionCookie,
} from "./cookies";

/**
 * Origin sent on CSRF-protected anon/guest calls to the User Management
 * Service. `ANON_CSRF_ORIGIN` overrides `CS_PUBLIC_WEB_URL` for local dev
 * against a staging backend allowlist (localhost is rejected there) — same
 * override apps/super-app relies on. Resolved here (server-only) and passed
 * into the endpoint calls as plain input, so `services/user-management`
 * never imports the server-only env accessor itself.
 */
const resolveCsrfOrigin = (): string =>
  env.ANON_CSRF_ORIGIN || publicEnv.CS_PUBLIC_WEB_URL || "";

/**
 * These 2 failures are local/logical (missing cookie state, upstream
 * dependency unobtainable), not a transport-level network failure —
 * `ApiError.network()` always hardcodes `message: "Network request failed"`
 * regardless of the `Error` passed as `cause`, which would otherwise bury
 * the real reason in logs. `kind: "handler"` is this package's existing
 * category for a synthesized, non-transport failure (see core/sse.ts).
 */
const missingCsrfTokenError = (): ApiError =>
  new ApiError({
    httpStatus: 502,
    kind: "handler",
    message: "Unable to obtain CSRF token",
    reason: "ERROR_UNKNOWN",
  });

const noSessionToRefreshError = (): ApiError =>
  new ApiError({
    httpStatus: 401,
    kind: "handler",
    message: "No guest session to refresh",
    reason: "ERROR_UNKNOWN",
  });

export interface BootstrapResult {
  csrfToken: string;
  nonce: string;
}

/** Always called first (directly, or lazily by `ensureCsrfToken` below); issues a CSRF token + nonce bound to our origin. */
export const bootstrapGuestSession = async (): Promise<
  ApiResult<BootstrapResult>
> => {
  const [error, bootstrap] = await userManagement.bootstrapGuestSession({
    origin: resolveCsrfOrigin(),
  });
  if (error) {
    return [error, null];
  }
  await Promise.all([
    setGuestCsrfCookie(bootstrap.csrfToken),
    setGuestNonceCookie(bootstrap.nonce),
  ]);
  return [null, bootstrap];
};

interface CsrfAndNonce {
  csrfToken: string;
  nonce: string;
}

const ensureCsrfAndNonce = async (
  forceRefetch = false
): Promise<CsrfAndNonce | null> => {
  if (!forceRefetch) {
    const [existingCsrf, existingNonce] = await Promise.all([
      getGuestCsrfCookie(),
      getGuestNonceCookie(),
    ]);
    if (existingCsrf && existingNonce) {
      return { csrfToken: existingCsrf, nonce: existingNonce };
    }
  }
  const [error, bootstrap] = await bootstrapGuestSession();
  return error ? null : bootstrap;
};

/**
 * Creates a guest session from a Turnstile `captchaToken` (see
 * `components/providers/guest-session-provider.tsx`), or short-circuits to
 * the one already stored in the `guest_session` cookie — the short-circuit
 * runs BEFORE the captcha check, so a second/racing call never needs a
 * fresh token.
 */
export const createGuestSession = async (
  captchaToken: string,
  retryAttempt = 0
): Promise<ApiResult<GuestSession>> => {
  const existing = await getGuestSessionCookie();
  if (existing) {
    return [null, existing];
  }

  const csrfAndNonce = await ensureCsrfAndNonce(retryAttempt > 0);
  if (!csrfAndNonce) {
    return [missingCsrfTokenError(), null];
  }

  const [error, session] = await userManagement.createGuestSession({
    captchaToken,
    csrfToken: csrfAndNonce.csrfToken,
    nonce: csrfAndNonce.nonce,
    origin: resolveCsrfOrigin(),
  });

  if (error) {
    // A stale CSRF token is the one transient, retryable failure — re-bootstrap
    // once and try again, same as apps/super-app's create-session route.
    // A captcha failure comes back as a different status (confirmed live:
    // 500, not 403) and is NOT retried here — the caller must get a fresh
    // Turnstile token and call again.
    if (error.httpStatus === 403 && retryAttempt === 0) {
      return createGuestSession(captchaToken, 1);
    }
    await clearGuestSessionCookie();
    return [error, null];
  }

  await setGuestSessionCookie(session);
  return [null, session];
};

/** Rotates the guest access token using the stored refresh token. */
export const refreshGuestSession = async (
  retryAttempt = 0
): Promise<ApiResult<{ accessToken: string }>> => {
  const current = await getGuestSessionCookie();
  if (!current?.refreshToken) {
    await clearGuestSessionCookie();
    return [noSessionToRefreshError(), null];
  }

  const csrfAndNonce = await ensureCsrfAndNonce(retryAttempt > 0);
  if (!csrfAndNonce) {
    return [missingCsrfTokenError(), null];
  }

  const [error, result] = await userManagement.refreshGuestToken({
    csrfToken: csrfAndNonce.csrfToken,
    nonce: csrfAndNonce.nonce,
    origin: resolveCsrfOrigin(),
    refreshToken: current.refreshToken,
  });

  if (error) {
    if (error.httpStatus === 403 && retryAttempt === 0) {
      return refreshGuestSession(1);
    }
    await clearGuestSessionCookie();
    return [error, null];
  }

  const updated: GuestSession = {
    ...current,
    accessToken: result.accessToken,
    ...(result.refreshToken ? { refreshToken: result.refreshToken } : {}),
  };
  await setGuestSessionCookie(updated);
  return [null, { accessToken: updated.accessToken }];
};
