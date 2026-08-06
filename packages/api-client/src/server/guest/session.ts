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

const readCachedCsrfAndNonce = async (): Promise<CsrfAndNonce | null> => {
  const [existingCsrf, existingNonce] = await Promise.all([
    getGuestCsrfCookie(),
    getGuestNonceCookie(),
  ]);
  return existingCsrf && existingNonce
    ? { csrfToken: existingCsrf, nonce: existingNonce }
    : null;
};

const ensureCsrfAndNonce = async (
  forceRefetch = false
): Promise<CsrfAndNonce | null> => {
  if (!forceRefetch) {
    const cached = await readCachedCsrfAndNonce();
    if (cached) {
      return cached;
    }
  }
  const [error, bootstrap] = await bootstrapGuestSession();
  return error ? null : bootstrap;
};

/**
 * A stale CSRF token is the one transient, retryable failure — re-bootstrap
 * once and try again, same as apps/super-app's create-session route. A
 * captcha failure comes back as a different status (confirmed live: 500, not
 * 403) and is NOT retried here — the caller must get a fresh Turnstile token
 * and call again.
 *
 * Takes `retry` as a callback (rather than calling `createGuestSession`
 * directly) so this helper doesn't forward-reference the function it's
 * defined above.
 */
const handleCreateSessionError = async (
  error: ApiError,
  retryAttempt: number,
  retry: () => Promise<ApiResult<GuestSession>>
): Promise<ApiResult<GuestSession>> => {
  if (error.httpStatus === 403 && retryAttempt === 0) {
    return retry();
  }
  await clearGuestSessionCookie();
  return [error, null];
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
    return handleCreateSessionError(error, retryAttempt, () =>
      createGuestSession(captchaToken, 1)
    );
  }

  await setGuestSessionCookie(session);
  return [null, session];
};

interface RefreshGuestTokenResult {
  accessToken: string;
  refreshToken?: string;
}

const applyRefreshedGuestSession = async (
  current: GuestSession,
  result: RefreshGuestTokenResult
): Promise<ApiResult<{ accessToken: string }>> => {
  const updated: GuestSession = {
    ...current,
    accessToken: result.accessToken,
    ...(result.refreshToken ? { refreshToken: result.refreshToken } : {}),
  };
  await setGuestSessionCookie(updated);
  return [null, { accessToken: updated.accessToken }];
};

const hasRefreshToken = (
  session: GuestSession | null
): session is GuestSession => Boolean(session?.refreshToken);

/**
 * A retryable stale CSRF token (403, not yet retried) re-bootstraps and
 * retries the whole rotation once. Only a genuine auth failure
 * (invalid/expired/revoked refresh token) means the stored refresh token is
 * actually dead — any other error (5xx, network) is left as-is so a later
 * retry can still use the still-good refresh token, same gate
 * `TokenManager.performRefresh()` applies client-side.
 *
 * Takes `retry` as a callback (rather than calling `refreshGuestSession`
 * directly) so this helper doesn't forward-reference the function it's
 * defined above.
 */
const handleRefreshTokenError = async (
  error: ApiError,
  retryAttempt: number,
  retry: () => Promise<ApiResult<{ accessToken: string }>>
): Promise<ApiResult<{ accessToken: string }>> => {
  if (error.httpStatus === 403 && retryAttempt === 0) {
    return retry();
  }
  if (error.isAuthError) {
    await clearGuestSessionCookie();
  }
  return [error, null];
};

/** Rotates the guest access token using the stored refresh token. */
export const refreshGuestSession = async (
  retryAttempt = 0
): Promise<ApiResult<{ accessToken: string }>> => {
  const current = await getGuestSessionCookie();
  if (!hasRefreshToken(current)) {
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
    return handleRefreshTokenError(error, retryAttempt, () =>
      refreshGuestSession(1)
    );
  }

  return applyRefreshedGuestSession(current, result);
};
