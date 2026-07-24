import { createProxyRouteHandler } from "@cs/api-client/proxy/route-handler";

/**
 * Generic BFF passthrough for any endpoint declared `transport: "proxy"` (see
 * docs/runbook/api-client.md §1/§3 and packages/api-client/README.md §3).
 * No per-endpoint/per-service code needed here — the handler resolves the
 * target service/path from the URL itself.
 */
export const { GET, POST, PUT, PATCH, DELETE } = createProxyRouteHandler();
