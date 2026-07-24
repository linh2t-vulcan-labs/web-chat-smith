export type ErrorCategory =
  | "transient"
  | "auth"
  | "platform"
  | "validation"
  | "billing"
  | "rate-limit"
  | "unknown";

export interface ReasonDefinition {
  httpStatus: number;
  /** Generic backoff-retry eligibility. 401 reasons are handled by the refresh-and-retry-once flow instead, not this flag. */
  retryable: boolean;
  category: ErrorCategory;
  i18nKey: string;
}

const APIERRORS_NAMESPACE = "ApiErrors";

const toI18nKey = (reason: string) => `${APIERRORS_NAMESPACE}.${reason}`;

/**
 * Single source of truth mapping backend `reason` -> retry/i18n behavior.
 * Adding a new backend reason means adding exactly one entry here
 * (see docs/runbook/api-client.md §5/§14).
 */
export const REASONS = {
  ERROR_EXCEED_API_RATE_LIMIT: {
    category: "rate-limit",
    httpStatus: 429,
    retryable: true,
  },
  ERROR_FIELD_CANNOT_BE_EMPTY: {
    category: "validation",
    httpStatus: 400,
    retryable: false,
  },
  ERROR_INVALID_AUTHORIZATION: {
    category: "auth",
    httpStatus: 401,
    retryable: false,
  },
  ERROR_INVALID_REQUEST: {
    category: "validation",
    httpStatus: 400,
    retryable: false,
  },
  ERROR_PREMIUM_MODEL_LIMIT: {
    category: "billing",
    httpStatus: 402,
    retryable: false,
  },
  ERROR_REQUEST_TIMEOUT: {
    category: "transient",
    httpStatus: 408,
    retryable: true,
  },
  ERROR_TOKEN_FIREBASE: {
    category: "auth",
    httpStatus: 401,
    retryable: false,
  },
  ERROR_TOKEN_FIREBASE_NOT_FOUND: {
    category: "auth",
    httpStatus: 401,
    retryable: false,
  },
  ERROR_UNKNOWN: {
    category: "transient",
    httpStatus: 500,
    retryable: true,
  },
  ERROR_UNSUPPORTED_PLATFORM: {
    category: "platform",
    httpStatus: 403,
    retryable: false,
  },
  // Both confirmed directly against stg-api.vulcanlabs.co's refresh endpoint
  // (2026-07-21, see docs/runbook/api-client.md §4.3 point 5) — the backend
  // does NOT use the `ERROR_*` prefix for these two. `retryable: false` here
  // is the generic backoff flag (core/retry.ts); the short jittered
  // retry-once for a `TOKEN_EXPIRED` refresh failure is separate, targeted
  // logic in core/token-manager.ts, not this generic mechanism.
  INVALID_TOKEN: {
    category: "auth",
    httpStatus: 401,
    retryable: false,
  },
  TOKEN_EXPIRED: {
    category: "auth",
    httpStatus: 401,
    retryable: false,
  },
} as const satisfies Record<string, Omit<ReasonDefinition, "i18nKey">>;

export type KnownReason = keyof typeof REASONS;

export const UNKNOWN_REASON_DEFINITION: ReasonDefinition = {
  category: "unknown",
  httpStatus: 500,
  i18nKey: toI18nKey("UNKNOWN"),
  retryable: true,
};

const AUTH_REASONS = new Set<KnownReason>([
  "ERROR_INVALID_AUTHORIZATION",
  "ERROR_TOKEN_FIREBASE",
  "ERROR_TOKEN_FIREBASE_NOT_FOUND",
]);

export const isKnownReason = (reason: string): reason is KnownReason =>
  Object.hasOwn(REASONS, reason);

export const getReasonDefinition = (
  reason: string | undefined
): ReasonDefinition => {
  if (reason && isKnownReason(reason)) {
    return { ...REASONS[reason], i18nKey: toI18nKey(reason) };
  }
  return UNKNOWN_REASON_DEFINITION;
};

export const isAuthReason = (reason: string | undefined): boolean =>
  !!reason && isKnownReason(reason) && AUTH_REASONS.has(reason);
