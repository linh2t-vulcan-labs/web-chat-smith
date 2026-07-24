"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const isServer = typeof window === "undefined";

const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Retry classification for queries lives in hooks/use-api-query.ts —
        // this default only covers the (rare) query that bypasses that hook.
        retry: false,
        staleTime: 60_000,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

/** SSR-safe singleton per the TanStack Query v5 docs: fresh instance per request on the server, one instance per browser tab. */
export const getQueryClient = (): QueryClient => {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
};

/**
 * Calls `getQueryClient()` directly instead of stashing it in `useState` — per
 * the TanStack Query "Advanced SSR" guide: if a descendant suspends during the
 * initial render with no Suspense boundary in between, React discards this
 * component's fiber (including any `useState`) and remounts from scratch,
 * which would re-run a `useState(() => new QueryClient())` initializer and
 * silently replace the client/cache. Reading the module-level singleton
 * directly survives that discard-and-remount instead.
 */
export const ApiQueryProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
