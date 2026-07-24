import { getRuntimeEnv } from "@cs/env/universal";

/**
 * Read at call time (not module load time) so a single built Docker image
 * can be promoted across GKE environments without a rebuild, and so it
 * resolves correctly on both sides of the bundle split — server-side via
 * live `process.env`, browser-side via `window.__CS_ENV__` (see
 * `@cs/env/universal`'s `getRuntimeEnv()` and docs/runbook/api-client.md §2/§3).
 * Never call this at module top-level scope — same rule as `getRuntimeEnv()`.
 */
export const resolveBaseUrl = (): string => {
  const value = getRuntimeEnv().CS_PUBLIC_API_BASE_URL;
  if (!value) {
    throw new Error(
      "CS_PUBLIC_API_BASE_URL is not set — required by @cs/api-client to build request URLs."
    );
  }
  return value;
};
