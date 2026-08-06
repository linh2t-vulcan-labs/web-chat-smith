import type { ApiError, ApiResult } from "../errors/api-error";
import type { AuthMode, IdentityMode } from "../types";
import { httpRequest } from "./http-client";
import type { HttpRequestOptions } from "./http-client";
import { withRetry } from "./retry";
import { resolveTokenManager } from "./token-manager";

export type AuthenticatedRequestOptions = HttpRequestOptions & {
  auth: AuthMode;
  /** Which credential source to attach for `auth: "required"` — default "authenticated". See docs/runbook/api-client.md §4.5. */
  identity?: IdentityMode;
  /** Disable generic backoff retry for non-idempotent calls (e.g. POST that isn't safe to repeat). Default: true. */
  retry?: boolean;
};

/**
 * Attaches the `Authorization` header for `auth: "required"` calls, leaving
 * `headers` untouched for `auth: "none"` endpoints (refreshToken,
 * verifyOAuthToken/exchange, ...) so they work in any environment, including
 * server-to-server calls from a Route Handler (`getTokenManager()` throws
 * outside the browser — see core/token-manager.ts).
 */
const withAuthHeader = async (
  headers: Record<string, string> | undefined,
  options: AuthenticatedRequestOptions
): Promise<ApiResult<Record<string, string> | undefined>> => {
  if (options.auth !== "required") {
    return [null, headers];
  }
  const tokenManager = resolveTokenManager(options.identity);
  const [tokenError, accessToken] = await tokenManager.ensureAccessToken();
  if (tokenError) {
    return [tokenError, null];
  }
  return [null, { ...headers, Authorization: `Bearer ${accessToken}` }];
};

const isRetryableAuthFailure = (
  error: ApiError | null,
  options: AuthenticatedRequestOptions,
  hasRetriedAuth: boolean
): boolean =>
  Boolean(error?.isAuthError) && options.auth === "required" && !hasRetriedAuth;

/**
 * The single place that:
 * 1) attaches the Authorization header for `auth: "required"` endpoints,
 * 2) implements refresh-and-retry-once on 401 (see docs/runbook/api-client.md §4.3/§5),
 * 3) layers generic backoff retry for transient/rate-limited errors.
 * Replaces the `proxyHeaders`-threaded-through-every-function pattern from the legacy code (§2).
 */
export const authenticatedRequest = <T>(
  url: string,
  options: AuthenticatedRequestOptions
): Promise<ApiResult<T>> => {
  const attempt = async (hasRetriedAuth: boolean): Promise<ApiResult<T>> => {
    const [headerError, headers] = await withAuthHeader(
      options.headers,
      options
    );
    if (headerError) {
      return [headerError, null];
    }

    const result = await httpRequest<T>(url, { ...options, headers });
    const [error] = result;

    if (isRetryableAuthFailure(error, options, hasRetriedAuth)) {
      const [refreshError] = await resolveTokenManager(
        options.identity
      ).refresh();
      if (refreshError) {
        return [refreshError, null];
      }
      return attempt(true);
    }

    return result;
  };

  const executeOnce = () => attempt(false);

  if (options.retry === false) {
    return executeOnce();
  }
  return withRetry(executeOnce, { signal: options.signal });
};
