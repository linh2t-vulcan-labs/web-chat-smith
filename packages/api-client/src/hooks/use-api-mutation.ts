import { useMutation } from "@tanstack/react-query";
import type {
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";

import type { ApiError, ApiResult } from "../errors/api-error";

export type UseApiMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, ApiError, TVariables>,
  "mutationFn"
> & {
  mutationFn: (variables: TVariables) => Promise<ApiResult<TData>>;
};

/**
 * Same `ApiResult` unwrapping as useApiQuery — mutations aren't retried by
 * default (non-idempotent by nature). Cache invalidation after a mutation
 * is the caller's responsibility via `onSuccess`, same as raw TanStack Query.
 */
export const useApiMutation = <TData, TVariables = void>(
  options: UseApiMutationOptions<TData, TVariables>
): UseMutationResult<TData, ApiError, TVariables> =>
  // oxlint-disable-next-line react-doctor/query-mutation-missing-invalidation -- this is a generic wrapper; cache invalidation is the caller's responsibility via `options.onSuccess`
  useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      const [error, data] = await options.mutationFn(variables);
      if (error) {
        throw error;
      }
      return data;
    },
  });
