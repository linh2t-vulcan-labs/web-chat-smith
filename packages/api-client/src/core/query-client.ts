import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

const isServer = typeof window === "undefined";

const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Every endpoint call already retries transient failures with
        // backoff at the transport layer (core/retry.ts's `withRetry()`,
        // used by `authenticatedRequest`/`serverFetch`) — retrying again
        // here would double-apply backoff on top of an already-exhausted
        // attempt. `useApiQuery` (hooks/use-api-query.ts) sets this
        // explicitly too; this is the default for the rare raw `useQuery`
        // that bypasses that hook.
        retry: false,
        staleTime: 60_000,
      },
    },
  });

/**
 * React's `cache()` scopes this to a single request lifecycle (per React
 * docs) — it has no effect in a Client Component (`isServer` is false there,
 * this branch never runs), so it's safe to define unconditionally. This is
 * the exact `const getQueryClient = cache(() => new QueryClient())` pattern
 * the TanStack Query advanced-SSR guide recommends for "single QueryClient
 * per request": if more than one Server Component on the same request calls
 * `getQueryClient()` (e.g. nested Server Components each prefetching their
 * own query), they now share the same instance instead of silently getting
 * independent `QueryClient`s that can't see each other's prefetched data.
 * Caveat from the same guide, still applies: `dehydrate(getQueryClient())`
 * serializes the ENTIRE shared client, so 2 unrelated Server Components
 * calling `dehydrate()` on this shared instance would each ship the OTHER's
 * prefetched queries too — fine for this app today (exactly one call site
 * per page, see `packages/api-client/README.md` §3), but worth knowing
 * before adding a second independent prefetch call on the same page.
 */
const getServerQueryClient = cache(makeQueryClient);

let browserQueryClient: QueryClient | undefined;

/**
 * SSR-safe singleton per the TanStack Query v5 docs: one instance per
 * request on the server (deduped within that request via `cache()` above),
 * one instance per browser tab. Deliberately its own module (not
 * `providers/query-client-provider.tsx`, which has "use client" for
 * `ApiQueryProvider`'s JSX) — a "use client" directive marks the WHOLE
 * module as a client reference, so a Server Component prefetching via
 * `getQueryClient().fetchQuery(...)` (see `packages/api-client/README.md`
 * §3) can't import it from there: "Attempted to call getQueryClient() from
 * the server but getQueryClient is on the client."
 */
export const getQueryClient = (): QueryClient => {
  if (isServer) {
    return getServerQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
};
