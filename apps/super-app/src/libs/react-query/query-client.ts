import {
  QueryClient,
  defaultShouldDehydrateQuery,
  environmentManager,
} from "@tanstack/react-query";

// Data is treated as fresh for this long after fetch, so components mounting
// right after SSR hydration (or after a soft nav) reuse the cache instead of
// immediately re-firing the same request — the "request waterfalls" guide's
// main SSR pitfall. Individual queries still override this via their own
// `staleTime` (e.g. list queries that want `Infinity`, or ones that want 0).
const DEFAULT_STALE_TIME_MS = 30 * 1000;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      dehydrate: {
        // Include pending queries in the dehydrated state so a Server
        // Component can kick off a prefetch, start streaming immediately,
        // and let the client finish + resolve the Suspense boundary.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      mutations: {
        retry: 0,
      },
      queries: {
        refetchOnWindowFocus: false,
        retry: 0,
        staleTime: DEFAULT_STALE_TIME_MS,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Server: a fresh `QueryClient` per call, so cache never leaks across
 * requests/users.
 * Browser: a single shared instance, created lazily and reused across
 * re-renders.
 */
export function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
