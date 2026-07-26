import "server-only";
import type { QueryClient, QueryKey } from "@tanstack/react-query";

import type { EndpointCallInput, EndpointCaller } from "../endpoints/types";
import { serverFetch } from "./server-fetch";

export interface PrefetchServerQueryOptions<
  TInput extends EndpointCallInput,
  TResponse,
> {
  queryClient: QueryClient;
  queryKey: QueryKey;
  endpoint: EndpointCaller<TInput, TResponse>;
  input?: TInput;
}

/**
 * The ONLY sanctioned way to prefetch an endpoint into a `QueryClient` from
 * a Server Component (see `packages/api-client/README.md` §3's decision
 * guide) — refuses at call time to prefetch an `auth: "required"` endpoint.
 *
 * Why this exists, not just a docs warning: under this app's Cache
 * Components config, a Server Component that prefetches via TanStack Query
 * can be speculatively re-invoked by Next (TanStack's internal `Date.now()`
 * timestamping on query settle trips Cache Components' "bail out of
 * prerendering" retry — confirmed directly, not theoretical). Each
 * re-invocation independently re-runs `serverFetch()`'s auth chain; for an
 * endpoint requiring a token refresh, that means a REAL refresh-token
 * *rotation* against the backend on every re-invocation — measured 3 real
 * rotations for one page load instead of 1, against a backend with no
 * rotation grace period (see `core/token-manager.ts`). A docs-only warning
 * is easy to miss two years and ten contributors from now; a thrown error
 * at the exact call site isn't.
 *
 * If you're here because this threw: the fix is almost always "fetch this
 * client-side with `useApiQuery` instead" (verified to dedupe/cache
 * correctly across remounts via `staleTime` — see `auth-status.tsx` in
 * `apps/web` for the reference implementation). This function intentionally
 * has no escape hatch/override param — if you're certain your case is a
 * true exception, that certainty needs to survive a second person's review,
 * not a boolean flag slipped past it.
 */
export const prefetchServerQuery = async <
  TInput extends EndpointCallInput,
  TResponse,
>(
  options: PrefetchServerQueryOptions<TInput, TResponse>
): Promise<void> => {
  const { queryClient, queryKey, endpoint, input } = options;

  if (endpoint.config.config.auth === "required") {
    throw new Error(
      `prefetchServerQuery: refusing to prefetch "${endpoint.config.serviceName}" from a Server Component — ` +
        'its endpoint config has `auth: "required"`. See packages/api-client/README.md §3 ' +
        '("Chọn pattern fetch nào?") — fetch this client-side with useApiQuery instead.'
    );
  }

  await queryClient.prefetchQuery({
    queryFn: async () => {
      const [error, data] = await serverFetch(endpoint, input);
      if (error) {
        throw error;
      }
      return data;
    },
    queryKey,
  });
};
