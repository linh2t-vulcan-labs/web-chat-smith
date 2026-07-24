// @cs/env — server secrets singleton. For public runtime config
// (CS_PUBLIC_*), use the dedicated subpaths instead: ./server (publicEnv),
// ./client (getPublicEnv), or ./universal (getRuntimeEnv) — never this
// barrel, so bundlers never pull server code into a client bundle by
// accident.
import { z } from "@cs/validation";

import { envBool, envNumDefault } from "./helpers";
import { lazyEnv, parseEntries } from "./parse";

export const serverSchemaEntries = {
  // Origin presented to the User Management backend on CSRF-protected anon
  // calls. In real deployments this equals CS_PUBLIC_WEB_URL (the domain is
  // in the backend allowlist). For local dev against staging, this overrides
  // it (localhost is rejected by the staging CSRF allowlist).
  ANON_CSRF_ORIGIN: z.optional(z.string()),
  APP_RELEASE: z.optional(z.string()),
  GTM_AUTH: z.optional(z.string()),
  GTM_ID: z.optional(z.string()),
  GTM_PREVIEW: z.optional(z.string()),
  GUEST_SESSION_MAX_AGE: envNumDefault("2592000"),
  GUEST_SESSION_SECRET_KEY: z.optional(
    z
      .string()
      .check(
        z.length(
          64,
          "GUEST_SESSION_SECRET_KEY must be 64 hex chars (32 bytes)"
        ),
        z.regex(
          /^[0-9a-f]+$/iu,
          "GUEST_SESSION_SECRET_KEY must be a hex string"
        )
      )
  ),
  JWT_MAX_AGE_SESSION: envNumDefault("7776000"),
  JWT_SECRET: z.optional(
    z
      .string()
      .check(
        z.minLength(44, "JWT_SECRET must be at least 32 bytes (base64 encoded)")
      )
  ),
  // Frozen compat contract (file 19) — mobile/ST Paddle product ID parity.
  // Do not rename or delete without @Compat Reviewer + /mobile-sync.
  PADDLE_VENDOR_ID: z.optional(z.string()),
  PADDLE_VENDOR_ID_SANDBOX: z.optional(z.string()),
  SANITY_API_TOKEN: z.optional(z.string()),
  SANITY_API_VERSION: z.optional(z.string()),
  SANITY_DATASET: z.optional(z.string()),
  SANITY_PROJECT_ID: z.optional(z.string()),
  SANITY_REVALIDATE_TIME: envNumDefault("3600"),
  SANITY_USE_CDN: envBool(true),
  // Frozen compat contract (file 19) — FCM push notification signing.
  // Do not rename or delete without @Compat Reviewer + /mobile-sync.
  VAPID_PRIVATE_KEY: z.optional(z.string()),
} as const;

/**
 * Server secrets singleton — lazily validated on first access, memoized.
 * Never import this from a "use client" file: it only reads process.env,
 * which is empty in the browser. For public config, use ./server (publicEnv),
 * ./client (getPublicEnv), or ./universal (getRuntimeEnv) instead.
 */
export const env = lazyEnv(() =>
  parseEntries(serverSchemaEntries, process.env, "server")
);

export type AppEnv = typeof env;
