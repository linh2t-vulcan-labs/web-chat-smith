/**
 * Base request security context shared by the anon and auth-v2 API route
 * groups. Both derive from this shape:
 *  - auth-v2 uses it directly (`TSecurityContext`)
 *  - anon extends it with `timezone` (`TAnonSecurityContext`)
 */
export interface TSecurityContext {
  origin: string | null;
  userAgent: string | null;
  ip: string | null;
  countryCode: string | null;
}
