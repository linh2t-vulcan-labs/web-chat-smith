import { formatIssuesReport } from "@cs/validation";

import { getReasonDefinition, isAuthReason } from "./reasons";

/** Duck-types a zod `$ZodError`-shaped cause (has `.issues`) without depending on a zod class export. */
const hasZodIssues = (
  cause: unknown
): cause is { issues: { path: PropertyKey[]; message: string }[] } =>
  typeof cause === "object" &&
  cause !== null &&
  "issues" in cause &&
  Array.isArray((cause as { issues: unknown }).issues);

export interface ApiErrorDetail {
  reason?: string;
  httpStatusCode?: number;
  metadata?: Record<string, unknown>;
}

export interface ApiErrorShape {
  code: number;
  reason: string;
  status: string;
  message: string;
  details: ApiErrorDetail[];
}

export type ApiErrorKind =
  | "backend"
  | "network"
  | "timeout"
  | "parse"
  | "aborted"
  | "handler";

interface ApiErrorInit {
  kind: ApiErrorKind;
  reason: string;
  message: string;
  httpStatus: number;
  code?: number;
  status?: string;
  details?: ApiErrorDetail[];
  cause?: unknown;
  /** From the response's `Retry-After` header, when present (mainly ERROR_EXCEED_API_RATE_LIMIT). */
  retryAfterMs?: number;
}

/**
 * Single normalized error shape for every failure this package can produce —
 * replaces the 4 divergent error types the legacy code carried
 * (see docs/runbook/api-client.md §5).
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly code: number;
  readonly reason: string;
  readonly status: string;
  readonly httpStatus: number;
  readonly details: ApiErrorDetail[];
  readonly isRetryable: boolean;
  readonly isAuthError: boolean;
  readonly i18nKey: string;
  readonly retryAfterMs?: number;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.kind = init.kind;
    this.code = init.code ?? -1;
    this.reason = init.reason;
    this.status = init.status ?? init.kind.toUpperCase();
    this.httpStatus = init.httpStatus;
    this.details = init.details ?? [];
    this.cause = init.cause;
    this.retryAfterMs = init.retryAfterMs;

    const definition = getReasonDefinition(init.reason);
    this.isRetryable =
      init.kind === "backend"
        ? definition.retryable
        : init.kind === "timeout" || init.kind === "network";
    // Also treat any 401 as an auth error even when `reason` doesn't map to
    // a known auth reason — a malformed/empty error body on a 401 must still
    // trigger refresh-and-retry-once, not silently skip it (see core/interceptors.ts).
    this.isAuthError =
      init.kind === "backend" &&
      (isAuthReason(init.reason) || init.httpStatus === 401);
    this.i18nKey = definition.i18nKey;
  }

  static fromBackendPayload(
    payload: ApiErrorShape,
    httpStatus: number,
    retryAfterMs?: number
  ): ApiError {
    return new ApiError({
      code: payload.code,
      details: payload.details,
      httpStatus,
      kind: "backend",
      message: payload.message,
      reason: payload.reason,
      retryAfterMs,
      status: payload.status,
    });
  }

  static network(cause: unknown): ApiError {
    return new ApiError({
      cause,
      httpStatus: 0,
      kind: "network",
      message: "Network request failed",
      reason: "ERROR_UNKNOWN",
    });
  }

  static timeout(): ApiError {
    return new ApiError({
      httpStatus: 408,
      kind: "timeout",
      message: "The request timed out",
      reason: "ERROR_REQUEST_TIMEOUT",
    });
  }

  static aborted(): ApiError {
    return new ApiError({
      httpStatus: 0,
      kind: "aborted",
      message: "The request was aborted",
      reason: "ERROR_ABORTED",
    });
  }

  /**
   * `cause` is either a raw `SyntaxError` (malformed JSON body,
   * core/http-client.ts) or a zod schema-validation failure (backend
   * response drifted from `responseSchema`, endpoints/registry.ts /
   * server/server-fetch.ts) — the latter gets a field-by-field breakdown
   * via `@cs/validation`'s shared formatter so a contract-drift bug is
   * immediately readable in dev, not just "failed to parse".
   */
  static parseFailure(cause: unknown): ApiError {
    const message = hasZodIssues(cause)
      ? formatIssuesReport(cause.issues, {
          title: "Response failed schema validation",
        })
      : "Failed to parse response body";
    return new ApiError({
      cause,
      httpStatus: 0,
      kind: "parse",
      message,
      reason: "ERROR_UNKNOWN",
    });
  }

  /**
   * A consumer-supplied callback (e.g. `onEvent` in core/sse.ts) threw —
   * this is a business-logic bug in the caller, not a transport failure, so
   * it must never be reported as `network`/`parse` (those drive different
   * retry/i18n treatment and would mislead whoever reads `kind`/`reason`).
   */
  static handlerFailure(cause: unknown): ApiError {
    return new ApiError({
      cause,
      httpStatus: 0,
      kind: "handler",
      message: cause instanceof Error ? cause.message : "Event handler threw",
      reason: "ERROR_UNKNOWN",
    });
  }

  static isApiError(value: unknown): value is ApiError {
    return value instanceof ApiError;
  }
}

export type ApiResult<T> = [ApiError, null] | [null, T];
