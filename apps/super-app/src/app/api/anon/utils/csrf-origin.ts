import { env } from "@cs/env";
import { publicEnv } from "@cs/env/server";

/**
 * Origin sent on CSRF-protected anon/guest calls. `ANON_CSRF_ORIGIN` overrides
 * `CS_PUBLIC_WEB_URL` for local dev against a staging backend allowlist
 * (localhost is rejected there). Falls back to `""` — both are optional in
 * the shared schema, but a request should never be sent with `origin:
 * undefined`.
 */
export const resolveCsrfOrigin = (): string =>
  env.ANON_CSRF_ORIGIN || publicEnv.CS_PUBLIC_WEB_URL || "";
