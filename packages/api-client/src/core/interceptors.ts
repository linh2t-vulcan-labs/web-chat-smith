import type { ApiResult } from "../errors/api-error";
import type { AuthMode } from "../types";
import { httpRequest } from "./http-client";
import type { HttpRequestOptions } from "./http-client";
import { withRetry } from "./retry";
import { getTokenManager } from "./token-manager";

export type AuthenticatedRequestOptions = HttpRequestOptions & {
  auth: AuthMode;
  /** Disable generic backoff retry for non-idempotent calls (e.g. POST that isn't safe to repeat). Default: true. */
  retry?: boolean;
};

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
  // Lazy: only resolved for `auth: "required"` so `auth: "none"` endpoints
  // (refreshToken, verifyOAuthToken/exchange, ...) work in any environment,
  // including server-to-server calls from a Route Handler (getTokenManager()
  // throws outside the browser — see core/token-manager.ts).
  const attempt = async (hasRetriedAuth: boolean): Promise<ApiResult<T>> => {
    let { headers } = options;

    if (options.auth === "required") {
      const tokenManager = getTokenManager();
      const [tokenError, accessToken] = await tokenManager.ensureAccessToken();
      if (tokenError) {
        return [tokenError, null];
      }
      headers = { ...headers, Authorization: `Bearer ${accessToken}` };
    }

    const result = await httpRequest<T>(url, { ...options, headers });
    const [error] = result;

    if (error?.isAuthError && options.auth === "required" && !hasRetriedAuth) {
      const [refreshError] = await getTokenManager().refresh();
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
