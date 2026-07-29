import { authenticatedRequest } from "../core/interceptors";
import type { ApiResult } from "../errors/api-error";
import type { HttpMethod } from "../types";
import { buildProxyUrl, buildUrl } from "../utils/build-url";
import { parseWithSchema } from "../utils/parse-response";
import { resolveBaseUrl } from "../utils/runtime-env";
import type {
  AnyEndpointConfig,
  CallOptions,
  EndpointCallInput,
  ServiceDefinition,
  ServiceOptions,
} from "./types";

export interface BuiltEndpointRequest {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body: unknown;
}

export interface BuildEndpointRequestOptions {
  /** Override the base URL for direct calls (defaults to `resolveBaseUrl()`). */
  baseUrl?: string;
  /** Skip the `transport: "proxy"` branch and always build the real backend URL — used by `serverFetch()`, which is already server-to-server and never needs the same-origin proxy. */
  forceDirect?: boolean;
}

/**
 * Builds the URL/method/headers/body for one endpoint call from its
 * `EndpointConfig` — the single source of truth shared by the client caller
 * below AND `server/server-fetch.ts`, so a Server Component call can never
 * drift from what the client sends (see docs/runbook/api-client.md §2/§12).
 * Does not attach auth or run retries — those differ between the browser
 * (`TokenManager`) and server (cookie-based) call paths.
 */
export const buildEndpointRequest = (
  serviceName: string,
  serviceOptions: ServiceOptions,
  config: AnyEndpointConfig,
  input: EndpointCallInput,
  requestOptions: BuildEndpointRequestOptions = {}
): BuiltEndpointRequest => {
  const path =
    typeof config.path === "function" ? config.path(input) : config.path;
  const query = config.toQuery?.(input);
  const rawBody =
    config.method === "GET" || config.method === "DELETE"
      ? undefined
      : (config.toBody?.(input) ?? input);
  // Pre-stringifying hands http-client's serializeBody an already-JSON
  // string, whose `typeof body === "string"` branch returns it verbatim —
  // the one way to opt a single endpoint out of the global body-casing
  // transform without threading a flag through core/http-client.ts.
  const body =
    config.skipBodyCaseConversion && rawBody !== undefined
      ? JSON.stringify(rawBody)
      : rawBody;

  // "proxy" endpoints call the app's own same-origin Route Handler (see
  // proxy/route-handler.ts) instead of the backend directly — the browser
  // never resolves/needs the real backend host for these (see §3/§8).
  const url =
    !requestOptions.forceDirect && config.transport === "proxy"
      ? buildProxyUrl({
          params: query,
          path,
          pathPrefix: serviceOptions.pathPrefix,
          proxyBasePath: serviceOptions.proxyBasePath,
          service: serviceName,
          version: config.version,
        })
      : buildUrl({
          baseUrl:
            requestOptions.baseUrl ??
            serviceOptions.baseUrl ??
            resolveBaseUrl(),
          params: query,
          path,
          pathPrefix: serviceOptions.pathPrefix,
          service: serviceName,
          version: config.version,
        });

  const headers =
    typeof config.headers === "function"
      ? config.headers(input)
      : config.headers;

  // Generated once per call (here, outside authenticatedRequest's internal
  // retry loop) so every automatic retry of THIS call — transient backoff
  // in core/retry.ts, refresh-and-retry-on-401 in core/interceptors.ts —
  // reuses the same key, while a separate caller-triggered call always gets
  // a fresh one.
  const idempotencyHeaders = config.idempotent
    ? { "Idempotency-Key": crypto.randomUUID() }
    : undefined;

  return {
    body,
    headers: { ...headers, ...idempotencyHeaders },
    method: config.method,
    url,
  };
};

const makeCaller =
  (serviceName: string, options: ServiceOptions, config: AnyEndpointConfig) =>
  async (
    input: EndpointCallInput,
    callOptions?: CallOptions
  ): Promise<ApiResult<unknown>> => {
    const { url, method, headers, body } = buildEndpointRequest(
      serviceName,
      options,
      config,
      input
    );

    const [error, data] = await authenticatedRequest<unknown>(url, {
      auth: config.auth,
      body,
      headers,
      identity: config.identity,
      method,
      retry: config.retry,
      signal: callOptions?.signal,
    });

    if (error) {
      return [error, null];
    }
    return parseWithSchema(config.responseSchema, data);
  };

/**
 * Single source of truth for a microservice's endpoints — replaces the
 * legacy per-repository, class-transformer + manually-instantiated-twice
 * approach (see docs/runbook/api-client.md §2/§7/§8). Every endpoint is a
 * declarative config object; adding one never touches core/*.
 */
export const defineService = <
  TEndpoints extends Record<string, AnyEndpointConfig> = Record<never, never>,
>(
  serviceName: string,
  options: ServiceOptions = {}
): ServiceDefinition<TEndpoints> => {
  const builder = {
    endpoint(name: string, config: AnyEndpointConfig) {
      const caller = makeCaller(serviceName, options, config);
      // Attached so `serverFetch()` (server/server-fetch.ts) can rebuild the
      // exact same request via `buildEndpointRequest` instead of a
      // hand-copied duplicate config (see docs/runbook/api-client.md §2/§12).
      (caller as unknown as Record<string, unknown>).config = {
        config,
        serviceName,
        serviceOptions: options,
      };
      (builder as Record<string, unknown>)[name] = caller;
      return builder;
    },
  } as ServiceDefinition<TEndpoints>;

  return builder;
};
