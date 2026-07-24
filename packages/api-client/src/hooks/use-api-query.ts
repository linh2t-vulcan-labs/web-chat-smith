import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

import type { ApiError, ApiResult } from "../errors/api-error";

const MAX_QUERY_RETRIES = 3;

export type UseApiQueryOptions<T> = Omit<
  UseQueryOptions<T, ApiError>,
  "queryFn"
> & {
  /** Receives TanStack Query's own `AbortSignal` — forward it to the endpoint call so unmount/refetch actually cancels the in-flight request. */
  queryFn: (context: { signal: AbortSignal }) => Promise<ApiResult<T>>;
};

/**
 * Thin wrapper over TanStack Query that unwraps the package's `ApiResult`
 * tuple and wires retry to `ApiError.isRetryable` — the same classification
 * `core/retry.ts` uses, so callers don't re-decide retry policy per query.
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
    retry: (failureCount, error) =>
      error.isRetryable && failureCount < MAX_QUERY_RETRIES,
  });
