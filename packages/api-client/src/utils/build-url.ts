import type { JsonValue, QueryParams } from "../types";
import { toSnakeCase } from "./case-convert";

export interface BuildUrlOptions {
  baseUrl: string;
  /** e.g. "user-management" — path segment for the microservice under the single base URL. */
  service: string;
  /** Override the default "/{service}/api/{version}" convention (e.g. notification, see §8). */
  pathPrefix?: string;
  version?: string;
  path: string;
  params?: QueryParams;
}

const LEADING_SLASHES = /^\/+/u;
const TRAILING_SLASHES = /\/+$/u;
const PROTOCOL = /^(?<protocol>[a-z]+):\/\//iu;
const DEFAULT_PROTOCOL = "https";

const trimSlashes = (segment: string) =>
  segment.replace(LEADING_SLASHES, "").replace(TRAILING_SLASHES, "");

/** Preserves an explicit `http://` (local/dev backends) instead of always forcing `https://`. */
const splitProtocol = (segment: string): { protocol: string; host: string } => {
  const match = segment.match(PROTOCOL);
  return match
    ? {
        host: segment.slice(match[0].length),
        protocol: match.groups?.protocol ?? DEFAULT_PROTOCOL,
      }
    : { host: segment, protocol: DEFAULT_PROTOCOL };
};

const buildServicePrefix = (
  options: Pick<BuildUrlOptions, "service" | "pathPrefix" | "version">
) =>
  options.pathPrefix
    ? trimSlashes(options.pathPrefix)
    : `${trimSlashes(options.service)}/api${options.version ? `/${options.version}` : ""}`;

/**
 * `String(value)` is only correct for primitives — an object/array becomes
 * the useless literal `"[object Object]"` (or a naive comma-join, silently
 * dropping its own nested-key snake_case conversion), and a `Date` becomes
 * `Date.prototype.toString()`'s locale-formatted string rather than the
 * ISO 8601 a backend actually expects.
 */
const serializeQueryValue = (value: JsonValue): string => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

const buildSearchString = (params: QueryParams | undefined): string => {
  if (!params) {
    return "";
  }
  const snakeParams =
    toSnakeCase<Record<string, JsonValue | undefined>>(params);
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(snakeParams)) {
    if (value === undefined || value === null) {
      continue;
    }
    search.set(key, serializeQueryValue(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const buildUrl = (options: BuildUrlOptions): string => {
  const { protocol, host } = splitProtocol(options.baseUrl);
  const base = trimSlashes(host);
  const prefix = buildServicePrefix(options);
  const path = trimSlashes(options.path);

  return `${protocol}://${base}/${prefix}/${path}${buildSearchString(options.params)}`;
};

export interface BuildProxyUrlOptions {
  /** Same-origin mount point for the generic proxy Route Handler (see proxy/route-handler.ts). Default "/api/proxy". */
  proxyBasePath?: string;
  service: string;
  pathPrefix?: string;
  version?: string;
  path: string;
  params?: QueryParams;
}

const DEFAULT_PROXY_BASE_PATH = "/api/proxy";

/**
 * Relative-URL counterpart of `buildUrl()` for `transport: "proxy"` endpoints
 * (see docs/runbook/api-client.md §3/§8) — the browser never needs to know
 * the real backend host for these; the proxy Route Handler resolves it
 * server-side and reconstructs this same "/{prefix}/{path}" shape.
 */
export const buildProxyUrl = (options: BuildProxyUrlOptions): string => {
  const prefix = buildServicePrefix(options);
  const path = trimSlashes(options.path);
  const base = trimSlashes(options.proxyBasePath ?? DEFAULT_PROXY_BASE_PATH);

  return `/${base}/${prefix}/${path}${buildSearchString(options.params)}`;
};
