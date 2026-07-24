// @cs/env/constants — shared constants for env validation.

/** Prefix for runtime-resolved public vars, read via publicEnv/getPublicEnv/getRuntimeEnv. */
export const CS_PUBLIC_PREFIX = "CS_PUBLIC_" as const;

/** Prefix for Sanity Studio vars (inlined into the studio bundle by Vite). */
export const STUDIO_PREFIX = "SANITY_STUDIO_" as const;

/**
 * Key names whose values must NOT appear in error messages.
 * Add a key here if its value is a secret (token, key, credentials, etc.).
 */
export const SECRET_KEYS: ReadonlySet<string> = new Set([
  "GTM_AUTH",
  "GUEST_SESSION_SECRET_KEY",
  "JWT_SECRET",
  "SANITY_API_TOKEN",
  "VAPID_PRIVATE_KEY",
]);
