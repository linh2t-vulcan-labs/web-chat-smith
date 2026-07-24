export type {
  ApiError,
  ApiErrorDetail,
  ApiErrorKind,
  ApiErrorShape,
  ApiResult,
} from "../errors/api-error";

export type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

/** "required" attaches the current access token; "none" is used for endpoints like refresh/exchange that must not depend on one. */
export type AuthMode = "required" | "none";

/** Per-endpoint escape hatch — see docs/runbook/api-client.md §3. "direct" is the default. */
export type TransportMode = "direct" | "proxy";

/** Which credential source the request is authenticated with. */
export type IdentityMode = "authenticated" | "guest";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type QueryParams = Record<string, JsonValue | undefined>;

/**
 * Per-request override, used by the server-side layer to pass an
 * explicit token/cookie context instead of relying on the browser-side
 * in-memory TokenStore (see docs/runbook/api-client.md §12).
 */
export interface RequestContext {
  accessToken?: string;
  identity?: IdentityMode;
  signal?: AbortSignal;
}

export type ProcessStatus = "done" | "error" | "pending";

export type ProcessTransport = "poll" | "sse";
