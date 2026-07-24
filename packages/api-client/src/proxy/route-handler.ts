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
    const [{ path }, initialAccessToken] = await Promise.all([
      context.params,
      getAccessTokenCookie(),
    ]);
    const baseUrl = resolveBaseUrl().replace(PROTOCOL_PREFIX, "");
    const prefix = options.pathPrefix
      ? `${options.pathPrefix.replaceAll(LEADING_TRAILING_SLASHES, "")}/`
      : "";
    const targetUrl = `https://${baseUrl}/${prefix}${path.join("/")}${request.nextUrl.search}`;

    const hasBody = !["GET", "HEAD"].includes(request.method);
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const forward = (accessToken: string | undefined): Promise<Response> => {
      const headers = new Headers(request.headers);
      for (const header of HOP_BY_HOP_HEADERS) {
        headers.delete(header);
      }
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return fetch(targetUrl, {
        body,
        headers,
        method: request.method,
        redirect: "manual",
        // Without this, an unresponsive/slow backend leaves the browser's
        // request (and the Next.js server handling it) hanging indefinitely —
        // core/http-client.ts's own DEFAULT_TIMEOUT_MS never applies here
        // since this is a raw passthrough `fetch`, not `httpRequest`.
        signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
      });
    };

    let upstreamResponse = await forward(initialAccessToken);

    // The mirrored `access_token` cookie (see server/cookies.ts) can go stale
    // independently of the caller's own session — e.g. it expired since the
    // last SSR request refreshed it, or a concurrent request rotated it.
    // Refresh once server-side and retry, same contract as
    // core/interceptors.ts and server/server-fetch.ts#serverFetch.
    if (upstreamResponse.status === 401) {
      const [refreshError, refreshedAccessToken] = await refreshServerSession();
      if (!refreshError) {
        upstreamResponse = await forward(refreshedAccessToken);
      }
    }

    const responseHeaders = new Headers(upstreamResponse.headers);
    for (const header of RESPONSE_HEADERS_TO_STRIP) {
      responseHeaders.delete(header);
    }

    return new NextResponse(upstreamResponse.body, {
      headers: responseHeaders,
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
