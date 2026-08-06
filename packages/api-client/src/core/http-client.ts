import { ApiError } from "../errors/api-error";
import type { ApiErrorShape, ApiResult } from "../errors/api-error";
import type { HttpMethod } from "../types";
import { toCamelCase, toSnakeCase } from "../utils/case-convert";

const DEFAULT_TIMEOUT_MS = 30_000;
const NO_CONTENT_STATUS = 204;

export interface HttpRequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Skip snake_case request transform + JSON stringify — required for FormData/binary uploads. */
  raw?: boolean;
}

const isFormDataBody = (body: unknown): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

/**
 * A body that must skip BOTH the default JSON `Content-Type` header AND the
 * camelCase->snake_case + `JSON.stringify` transform — the caller either
 * sets its own `Content-Type` (raw binary/text) or `fetch` derives one
 * itself (FormData's multipart boundary). One predicate shared by the
 * header logic and `serializeBody` below, so they can't silently drift
 * apart (previously the header logic only special-cased FormData, while
 * `serializeBody` separately also passed a `Blob` through unconverted —
 * meaning a `Blob` body still got a forced `Content-Type: application/json`).
 *
 * A plain **string** body is deliberately NOT included here: it still gets
 * the default JSON `Content-Type` unless the caller overrides it, because
 * a string body is how a caller opts a single endpoint out of the
 * camelCase/snake_case transform while keeping valid JSON on the wire (see
 * `skipBodyCaseConversion` in endpoints/registry.ts) — it isn't necessarily
 * non-JSON like `raw`/`FormData`/`Blob` are.
 */
const isPassthroughBody = (body: unknown, raw: boolean | undefined): boolean =>
  raw === true || isFormDataBody(body) || body instanceof Blob;

export const mergeSignals = (
  a?: AbortSignal,
  b?: AbortSignal
): AbortSignal | undefined => {
  if (!a) {
    return b;
  }
  if (!b) {
    return a;
  }
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([a, b]);
  }
  // Manual fallback for runtimes without AbortSignal.any (Baseline 2024) —
  // without this, `b` (the timeout signal) would be silently dropped and the
  // request would never time out whenever a caller signal is also present.
  const controller = new AbortController();
  const abort = () => controller.abort();
  a.addEventListener("abort", abort, { once: true });
  b.addEventListener("abort", abort, { once: true });
  return controller.signal;
};

const serializeBody = (
  body: unknown,
  raw: boolean | undefined
): BodyInit | undefined => {
  if (body === undefined) {
    return;
  }
  if (isPassthroughBody(body, raw) || typeof body === "string") {
    return body as BodyInit;
  }
  return JSON.stringify(toSnakeCase(body));
};

const parseRetryAfterMs = (headerValue: string | null): number | undefined => {
  if (!headerValue) {
    return;
  }
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds)) {
    return seconds * 1000;
  }
  const date = Date.parse(headerValue);
  return Number.isNaN(date) ? undefined : Math.max(date - Date.now(), 0);
};

const parseErrorBody = async (
  response: Response
): Promise<ApiErrorShape | undefined> => {
  try {
    const text = await response.text();
    if (!text) {
      return;
    }
    return JSON.parse(text) as ApiErrorShape;
  } catch {
    // Malformed/non-JSON error body — caller falls back to a generic ApiError.
  }
};

const parseSuccessBody = async <T>(response: Response): Promise<T> => {
  if (response.status === NO_CONTENT_STATUS) {
    return undefined as T;
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }
  const json = await response.json();
  return toCamelCase<T>(json);
};

const buildRequestInit = (
  options: HttpRequestOptions,
  signal: AbortSignal | undefined
): RequestInit => ({
  body: serializeBody(options.body, options.raw),
  headers: {
    ...(isPassthroughBody(options.body, options.raw)
      ? {}
      : { "Content-Type": "application/json" }),
    ...options.headers,
  },
  method: options.method,
  signal,
});

const resolveErrorMessage = (
  errorBody: ApiErrorShape | undefined,
  response: Response
): string => errorBody?.message ?? response.statusText ?? "Request failed";

const buildErrorResult = async (
  response: Response
): Promise<ApiResult<never>> => {
  const errorBody = await parseErrorBody(response);
  const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
  if (errorBody?.reason) {
    return [
      ApiError.fromBackendPayload(errorBody, response.status, retryAfterMs),
      null,
    ];
  }
  return [
    new ApiError({
      httpStatus: response.status,
      kind: "backend",
      message: resolveErrorMessage(errorBody, response),
      reason: "ERROR_UNKNOWN",
      retryAfterMs,
    }),
    null,
  ];
};

const isAbortDomException = (error: unknown): error is DOMException =>
  error instanceof DOMException && error.name === "AbortError";

/** Distinguishes a genuine abort (the caller's own signal fired) from a timeout (the internal `DEFAULT_TIMEOUT_MS` controller fired instead). */
const mapAbortError = (callerSignal: AbortSignal | undefined): ApiError =>
  callerSignal?.aborted ? ApiError.aborted() : ApiError.timeout();

/** Maps a caught `fetch`/parse failure to the right `ApiError` variant — abort vs. timeout, a re-thrown `ApiError`, a JSON parse failure, or a generic network error. */
const mapCaughtError = (
  error: unknown,
  callerSignal: AbortSignal | undefined
): ApiError => {
  if (isAbortDomException(error)) {
    return mapAbortError(callerSignal);
  }
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof SyntaxError) {
    return ApiError.parseFailure(error);
  }
  return ApiError.network(error);
};

/**
 * Native-fetch wrapper: timeout via AbortController, error-body normalization
 * into ApiError, camelCase<->snake_case body transforms. No auth/retry here —
 * see core/interceptors.ts for the layer that adds those.
 */
export const httpRequest = async <T>(
  url: string,
  options: HttpRequestOptions
): Promise<ApiResult<T>> => {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);
  const signal = mergeSignals(options.signal, timeoutController.signal);

  try {
    const response = await fetch(url, buildRequestInit(options, signal));

    if (!response.ok) {
      return await buildErrorResult(response);
    }

    const data = await parseSuccessBody<T>(response);
    return [null, data];
  } catch (error) {
    return [mapCaughtError(error, options.signal), null];
  } finally {
    clearTimeout(timer);
  }
};
