"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtoolsPanel } from "./devtools";
import { getQueryClient } from "./query-client";

export default function ReactQueryProvider({
  children,
}: React.PropsWithChildren) {
  // No useState/useRef needed: getQueryClient() already returns the same
  // singleton on every browser render, and a fresh instance per render on
  // the server — exactly the memoization React state would otherwise give.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtoolsPanel />
    </QueryClientProvider>
  );
}
