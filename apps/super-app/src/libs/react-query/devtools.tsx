"use client";

import dynamic from "next/dynamic";

// Lazy + client-only: keeps the devtools chunk (and its client-only APIs)
// out of the server bundle and out of the initial client bundle entirely.
const ReactQueryDevtools = dynamic(
  async () => {
    const mod = await import("@tanstack/react-query-devtools");
    return mod.ReactQueryDevtools;
  },
  { ssr: false }
);

const isDevelopment = process.env.NODE_ENV === "development";

export function ReactQueryDevtoolsPanel() {
  if (!isDevelopment) {
    return null;
  }

  return <ReactQueryDevtools initialIsOpen={false} />;
}
