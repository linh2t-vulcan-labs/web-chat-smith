"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { getQueryClient } from "../core/query-client";

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
