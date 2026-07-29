import type { ApiResult } from "../errors/api-error";
import type {
  AuthMode,
  HttpMethod,
  IdentityMode,
  QueryParams,
  TransportMode,
} from "../types";
import type { ResponseSchema } from "../utils/parse-response";

// `object`, not `Record<string, unknown>` — an interface/type literal without
// an explicit index signature (e.g. a named per-endpoint input type) does
// not structurally satisfy `Record<string, unknown>`, which would make every
// concrete endpoint input type fail this constraint.
export type EndpointCallInput = object | undefined;

export type { ResponseSchema } from "../utils/parse-response";

export interface EndpointConfig<
  TInput extends EndpointCallInput = EndpointCallInput,
  TResponse = unknown,
> {
  method: HttpMethod;
  /** Static path, or a function of the call input — used for the rare backend endpoint with a runtime-variable version segment (see §8, `product`). */
  path: string | ((input: TInput) => string);
  version?: string;
  auth: AuthMode;
  /** Which credential source to attach for `auth: "required"` — default "authenticated". See docs/runbook/api-client.md §4.5. */
  identity?: IdentityMode;
  /** Per-endpoint escape hatch — default "direct" (see §3). */
  transport?: TransportMode;
  /** Set false for non-idempotent calls that shouldn't be silently retried on a transient error. Default: true. */
  retry?: boolean;
  /**
   * Send a stable `Idempotency-Key` header so the backend can safely dedupe
   * this call if the client retries it (network drop before the response
   * arrives, accidental double-submit, refresh-and-retry-on-401 in
   * core/interceptors.ts, etc.) — see docs/runbook/api-client.md §20. The key
   * is generated once per logical call and reused across every retry of that
   * *same* call, but a fresh call (new user action) always gets a new key.
   * Use for non-idempotent mutations with real side effects (payment, order
   * creation) — most such endpoints already set `retry: false` for the same reason.
   */
  idempotent?: boolean;
  /** Derive the query string from the call input. Defaults to no query string. */
  toQuery?: (input: TInput) => QueryParams | undefined;
  /** Derive the JSON body from the call input. Defaults to the input object itself for non-GET/DELETE methods. */
  toBody?: (input: TInput) => unknown;
  /**
   * Skip the global camelCase->snake_case body conversion (core/http-client.ts)
   * for this endpoint. Use only when the backend genuinely expects camelCase
   * keys on the wire for this specific route (confirmed real exception, not
   * a style preference) — see message-feedback.ts.
   */
  skipBodyCaseConversion?: boolean;
  /** Static extra headers this specific endpoint always needs (e.g. `X-Application-Id`) — not for auth, that's automatic. */
  headers?:
    | Record<string, string>
    | ((input: TInput) => Record<string, string>);
  responseSchema?: ResponseSchema<TResponse>;
}

export interface ServiceOptions {
  /** Override the default "/{service}/api/{version}" convention (e.g. notification, see §8). */
  pathPrefix?: string;
  baseUrl?: string;
  /** Same-origin mount point for the generic proxy Route Handler, used by endpoints with `transport: "proxy"` (see §3/§8). Default "/api/proxy". */
  proxyBasePath?: string;
}

// A heterogeneous map of endpoint configs is fundamentally a covariance/contravariance
// mismatch for TypeScript to model precisely (TInput appears contravariantly in
// `path`/`toBody`/`headers`), so the map itself is typed with `any` here —
// every *consumer*-facing type (ServiceDefinition, the generated client methods)
// stays fully typed per endpoint. This is the one deliberate, contained `any`
// the registry needs (see endpoints/registry.ts for the matching runtime side).
// oxlint-disable-next-line typescript/no-explicit-any
export type AnyEndpointConfig = EndpointConfig<any, any>;

/** Per-call overrides that aren't part of the domain input — currently just cancellation. */
export interface CallOptions {
  /** Forwarded to the underlying fetch — wire this to TanStack Query's `queryFn` signal so unmount/refetch actually cancels the in-flight request. */
  signal?: AbortSignal;
}

/**
 * The exact triple `serverFetch()` needs to rebuild a request byte-for-byte
 * the same way the client caller does — attached to every generated
 * endpoint function (see endpoints/registry.ts) so a Server Component call
 * reads the SAME `method`/`path`/`version`/`responseSchema` the client uses,
 * instead of a hand-copied duplicate that can drift (see
 * docs/runbook/api-client.md §2).
 */
export interface ResolvedEndpointConfig<
  TInput extends EndpointCallInput = EndpointCallInput,
  TResponse = unknown,
> {
  serviceName: string;
  serviceOptions: ServiceOptions;
  config: EndpointConfig<TInput, TResponse>;
}

export type EndpointCaller<TInput extends EndpointCallInput, TResponse> = ((
  input?: TInput,
  callOptions?: CallOptions
) => Promise<ApiResult<TResponse>>) & {
  /** Raw config for this endpoint — pass to `serverFetch()` from `@cs/api-client/server/server-fetch` (§12), never build a parallel request by hand. */
  config: ResolvedEndpointConfig<TInput, TResponse>;
};

export type ServiceClient<
  TEndpoints extends Record<string, AnyEndpointConfig>,
> = {
  [K in keyof TEndpoints]: TEndpoints[K] extends EndpointConfig<
    infer TInput,
    infer TResponse
  >
    ? EndpointCaller<TInput, TResponse>
    : never;
};

export type ServiceDefinition<
  TEndpoints extends Record<string, AnyEndpointConfig>,
> = ServiceClient<TEndpoints> & {
  endpoint: <K extends string, TInput extends EndpointCallInput, TResponse>(
    name: K,
    config: EndpointConfig<TInput, TResponse>
  ) => ServiceDefinition<
    TEndpoints & Record<K, EndpointConfig<TInput, TResponse>>
  >;
};
