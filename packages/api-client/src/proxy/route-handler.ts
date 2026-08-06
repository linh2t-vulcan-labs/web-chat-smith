import "server-only";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAccessTokenCookie } from "../server/cookies";
import { refreshServerSession } from "../server/server-fetch";
import { resolveBaseUrl } from "../utils/runtime-env";

const HOP_BY_HOP_HEADERS = ["host", "cookie", "content-length", "connection"];
// `fetch()` transparently decompresses a gzip/br upstream body while leaving
// `content-encoding`/`content-length` on `Response.headers` untouched — if
// those were forwarded as-is, the browser would try to re-decompress an
// already-decompressed body and fail to parse every compressed response.
const RESPONSE_HEADERS_TO_STRIP = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
];
const LEADING_TRAILING_SLASHES = /^\/+|\/+$/gu;
const PROTOCOL_PREFIX = /^https?:\/\//u;
const PROXY_TIMEOUT_MS = 30_000;

export interface ProxyRouteHandlerOptions {
  /** Same override as endpoints/types.ts ServiceOptions#pathPrefix — for a single catch-all route proxying one anomalous service. */
  pathPrefix?: string;
}

const resolveTargetUrl = (
  request: NextRequest,
  path: string[],
  pathPrefix: string | undefined
): string => {
  const baseUrl = resolveBaseUrl().replace(PROTOCOL_PREFIX, "");
  const prefix = pathPrefix
    ? `${pathPrefix.replaceAll(LEADING_TRAILING_SLASHES, "")}/`
    : "";
  return `https://${baseUrl}/${prefix}${path.join("/")}${request.nextUrl.search}`;
};

const resolveForwardBody = async (
  request: NextRequest
): Promise<ArrayBuffer | undefined> => {
  const hasBody = !["GET", "HEAD"].includes(request.method);
  return hasBody ? await request.arrayBuffer() : undefined;
};

const buildForwardHeaders = (
  request: NextRequest,
  accessToken: string | undefined
): Headers => {
  const headers = new Headers(request.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return headers;
};

const forwardRequest = (
  targetUrl: string,
  request: NextRequest,
  body: ArrayBuffer | undefined,
  accessToken: string | undefined
): Promise<Response> =>
  fetch(targetUrl, {
    body,
    headers: buildForwardHeaders(request, accessToken),
    method: request.method,
    redirect: "manual",
    // Without this, an unresponsive/slow backend leaves the browser's
    // request (and the Next.js server handling it) hanging indefinitely —
    // core/http-client.ts's own DEFAULT_TIMEOUT_MS never applies here
    // since this is a raw passthrough `fetch`, not `httpRequest`.
    signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
  });

/**
 * The mirrored `access_token` cookie (see server/cookies.ts) can go stale
 * independently of the caller's own session — e.g. it expired since the last
 * SSR request refreshed it, or a concurrent request rotated it. Refreshes
 * once server-side and retries, same contract as core/interceptors.ts and
 * server/server-fetch.ts#serverFetch.
 */
const retryOnUnauthorized = async (
  response: Response,
  retry: (accessToken: string | undefined) => Promise<Response>
): Promise<Response> => {
  if (response.status !== 401) {
    return response;
  }
  const [refreshError, refreshedAccessToken] = await refreshServerSession();
  return refreshError ? response : retry(refreshedAccessToken);
};

const stripResponseHeaders = (headers: Headers): Headers => {
  const stripped = new Headers(headers);
  for (const header of RESPONSE_HEADERS_TO_STRIP) {
    stripped.delete(header);
  }
  return stripped;
};

/**
 * Generic BFF passthrough — a single route handles every proxied service by
 * path, not one handler per microservice (see docs/runbook/api-client.md §1/§3).
 * Only used for endpoints explicitly declared `transport: "proxy"`; direct is
 * the default. Mount at `app/api/proxy/[...path]/route.ts` and re-export the
 * object this returns.
 */
export const createProxyRouteHandler = (
  options: ProxyRouteHandlerOptions = {}
) => {
  const handle = async (
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
  ): Promise<Response> => {
    const [{ path }, initialAccessToken, body] = await Promise.all([
      context.params,
      getAccessTokenCookie(),
      resolveForwardBody(request),
    ]);
    const targetUrl = resolveTargetUrl(request, path, options.pathPrefix);
    const retry = (accessToken: string | undefined) =>
      forwardRequest(targetUrl, request, body, accessToken);

    const initialResponse = await retry(initialAccessToken);
    const upstreamResponse = await retryOnUnauthorized(initialResponse, retry);

    return new NextResponse(upstreamResponse.body, {
      headers: stripResponseHeaders(upstreamResponse.headers),
      status: upstreamResponse.status,
    });
  };

  return {
    DELETE: handle,
    GET: handle,
    PATCH: handle,
    POST: handle,
    PUT: handle,
  };
};
