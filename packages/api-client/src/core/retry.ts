import type { ApiResult } from "../errors/api-error";

const DEFAULT_MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 300;
const MAX_DELAY_MS = 5000;
const JITTER_RATIO = 0.2;

const backoffDelayMs = (attempt: number): number => {
  const exponential = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
  const jitter = Math.random() * exponential * JITTER_RATIO;
  return exponential + jitter;
};

export const sleep = (ms: number): Promise<void> =>
  // oxlint-disable-next-line promise/avoid-new -- setTimeout has no promise-returning equivalent in the standard lib
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export interface WithRetryOptions {
  maxAttempts?: number;
  signal?: AbortSignal;
}

/**
 * Generic backoff wrapper for transient/rate-limited failures — retry
 * eligibility comes entirely from `ApiError.isRetryable`
 * (see errors/reasons.ts), never from ad-hoc `if` checks per call site.
 * 401s are NOT retried here — see core/interceptors.ts for refresh-and-retry-once.
 *
 * The attempt loop is intentionally sequential (each attempt depends on the
 * previous one's outcome, unlike an independent fan-out) — oxlint's
 * no-await-in-loop guard doesn't apply here.
 */
export const withRetry = async <T>(
  execute: () => Promise<ApiResult<T>>,
  options: WithRetryOptions = {}
): Promise<ApiResult<T>> => {
  const maxAttempts = Math.max(1, options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);

  // No loop condition — every branch below either `return`s or `await`s
  // once more, so this can never fall through and never needs a dead
  // trailing statement after the loop (unlike a `while` with a counter check).
  for (let attempt = 0; ; attempt += 1) {
    // oxlint-disable-next-line no-await-in-loop -- sequential by design: each retry depends on the previous attempt's result
    const result = await execute();
    const [error] = result;

    if (
      !error ||
      !error.isRetryable ||
      attempt >= maxAttempts - 1 ||
      options.signal?.aborted
    ) {
      return result;
    }

    // oxlint-disable-next-line no-await-in-loop -- must wait before the next sequential attempt
    await sleep(error.retryAfterMs ?? backoffDelayMs(attempt));
  }
};
