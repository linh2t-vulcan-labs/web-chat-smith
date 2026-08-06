/**
 * Turns a cookie/app domain into its wildcard subdomain form (e.g. for CSP
 * `Set-Cookie` domain matching or CORS allowed-origin lists). `localhost`
 * has no meaningful subdomains, so it's left as `undefined` rather than
 * producing `*.localhost`.
 */
export const toDomainWildcard = (
  domain: string | undefined
): string | undefined =>
  domain && domain !== "localhost" ? `*.${domain}` : undefined;

/** Type guard for a non-empty string — useful as an `Array#filter` predicate. */
export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;
