import "server-only";
import { decodeJwtExpiryMs } from "@cs/core/jwt";
import { cache } from "react";

import { httpRequest } from "../core/http-client";
import { buildEndpointRequest } from "../endpoints/registry";
import type { EndpointCallInput, EndpointCaller } from "../endpoints/types";
import { ApiError } from "../errors/api-error";
import type { ApiResult } from "../errors/api-error";
import { userManagement } from "../services/user-management";
import { parseWithSchema } from "../utils/parse-response";
import { resolveBaseUrl } from "../utils/runtime-env";
import {
  clearSessionCookies,
  getAccessTokenCookie,
  getRefreshTokenCookie,
  setSessionCookies,
} from "./cookies";

/**
 * Server Components/Actions each run as an independent, stateless request —
 * `cache()` only dedupes WITHIN one request's lifecycle (per React/Next.js
 * docs), so at most one refresh call happens per SSR request no matter how
 * many components on the page call an authenticated endpoint. Exported for
 * the app's `/api/auth/refresh` Route Handler that the browser TokenManager
 * calls (see §4.1/§4.3).
 *
 * Reuses `services/user-management/`'s `refreshToken` endpoint (safe here
 * since it's `auth: "none"` — only `auth: "required"` endpoints need the
 * browser-only TokenManager, see core/interceptors.ts) instead of duplicating
 * the request by hand, so the header name/path/schema can't drift between
 * the client contract and this server-side call.
 */
export const refreshServerSession = cache(
  async (): Promise<ApiResult<string>> => {
    const refreshToken = await getRefreshTokenCookie();
    if (!refreshToken) {
      return [
        new ApiError({
          httpStatus: 401,
          kind: "backend",
          message: "Missing refresh_token cookie",
          reason: "ERROR_INVALID_AUTHORIZATION",
        }),
        null,
      ];
    }

    const [error, result] = await userManagement.refreshToken({ refreshToken });
    if (error) {
      return [error, null];
    }

    await setSessionCookies({
      accessToken: result.accessToken,
      accessTokenExpiresAt: decodeJwtExpiryMs(result.accessToken),
      refreshToken: result.refreshToken,
    });

    return [null, result.accessToken];
  }
);

/**
 * Reads the mirrored `access_token` cookie first — only refreshes when it's
 * missing (see §4.1/§4.3 point 1). Exported for the app's `GET
 * /api/auth/session` Route Handler, which the browser `TokenManager` calls
 * exactly once per tab (`restoreSessionOnce()`) — reusing this instead of
 * unconditionally calling `refreshServerSession()` is what avoids forcing a
 * real refresh-token rotation on every page reload when the mirrored access
 * token is still valid.
 */
export const ensureServerAccessToken = async (): Promise<ApiResult<string>> => {
  const cached = await getAccessTokenCookie();
  if (cached) {
    return [null, cached];
  }
  return refreshServerSession();
};

/**
 * Direct-to-backend call for Server Components/Actions (see §12) — takes the
 * SAME endpoint object `services/*` exports (its `.config`, attached by
 * `defineService().endpoint()` in endpoints/registry.ts) instead of a
 * hand-copied `{method, service, path, version, responseSchema}` — a
 * field/param added to the client endpoint is automatically what
 * `serverFetch()` sends too, it cannot drift out of sync (see
 * docs/runbook/api-client.md §2). Same `ApiError`/reason registry as the
 * client path, refresh-and-retry-once on 401, no cookie-vs-BroadcastChannel
 * machinery needed since each request is independent and stateless (no
 * in-process session state, per the GKE rule in §4.2).
 */
export const serverFetch = async <TInput extends EndpointCallInput, TResponse>(
  endpoint: EndpointCaller<TInput, TResponse>,
  input?: TInput
): Promise<ApiResult<TResponse>> => {
  const { config, serviceName, serviceOptions } = endpoint.config;
  const {
    url,
    method,
    headers: baseHeaders,
    body,
  } = buildEndpointRequest(serviceName, serviceOptions, config, input, {
    baseUrl: serviceOptions.baseUrl ?? resolveBaseUrl(),
    forceDirect: true,
  });

  const attempt = async (
    accessToken: string | undefined,
    hasRetriedAuth: boolean
  ): Promise<ApiResult<unknown>> => {
    const headers = accessToken
      ? { ...baseHeaders, Authorization: `Bearer ${accessToken}` }
      : baseHeaders;
    const result = await httpRequest<unknown>(url, { body, headers, method });
    const [error] = result;

    if (error?.isAuthError && config.auth === "required" && !hasRetriedAuth) {
      const [refreshError, newAccessToken] = await refreshServerSession();
      if (refreshError) {
        return [refreshError, null];
      }
      return attempt(newAccessToken, true);
    }

    return result;
  };

  let accessToken: string | undefined;
  if (config.auth === "required") {
    const [tokenError, token] = await ensureServerAccessToken();
    if (tokenError) {
      return [tokenError, null];
    }
    accessToken = token;
  }

  const [error, data] = await attempt(accessToken, false);
  if (error) {
    return [error, null];
  }
  return parseWithSchema(config.responseSchema, data);
};

/**
 * Best-effort backend revoke (ignored on failure) + always clears local
 * cookies — for the app's `/api/auth/logout` Route Handler. Reuses
 * `userManagement.logout`'s config (same `buildEndpointRequest` as
 * `serverFetch()`) purely for the URL, but skips `serverFetch()`'s
 * refresh-and-retry: logout should never trigger a fresh refresh, it should
 * best-effort revoke whatever access token is currently cached and move on.
 */
export const logoutSession = async (): Promise<void> => {
  const accessToken = await getAccessTokenCookie();
  if (accessToken) {
    const { url, method } = buildEndpointRequest(
      userManagement.logout.config.serviceName,
      userManagement.logout.config.serviceOptions,
      userManagement.logout.config.config,
      undefined,
      { baseUrl: resolveBaseUrl(), forceDirect: true }
    );
    try {
      await httpRequest(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        method,
      });
    } catch {
      // Best-effort — cookies are cleared below regardless.
    }
  }
  await clearSessionCookies();
};
