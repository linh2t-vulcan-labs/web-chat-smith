import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

import type { ApiError, ApiResult } from "../errors/api-error";

export type UseApiQueryOptions<T> = Omit<
  UseQueryOptions<T, ApiError>,
  "queryFn"
> & {
  /** Receives TanStack Query's own `AbortSignal` — forward it to the endpoint call so unmount/refetch actually cancels the in-flight request. */
  queryFn: (context: { signal: AbortSignal }) => Promise<ApiResult<T>>;
};

/**
 * Thin wrapper over TanStack Query that unwraps the package's `ApiResult`
 * tuple. Retry is always `false` here — `options.queryFn` calls an endpoint
 * that already went through `authenticatedRequest`'s `withRetry()`
 * (core/retry.ts), which retries `ApiError.isRetryable` errors with backoff
 * BEFORE this hook ever sees a result. Retrying again at this layer for the
 * same `isRetryable` classification would double-apply backoff on top of an
 * already-exhausted transport-level retry — e.g. a transient network error
 * compounds to ~9-12 real HTTP attempts (3 transport retries × up to 4
 * query-level retries) instead of the intended ~3, and takes proportionally
 * longer to finally surface as an error.
 */
export const useApiQuery = <T>(
  options: UseApiQueryOptions<T>
): UseQueryResult<T, ApiError> =>
  useQuery({
    ...options,
    queryFn: async (context) => {
      const [error, data] = await options.queryFn(context);
      if (error) {
        throw error;
      }
      return data;
    },
    retry: false,
  });
