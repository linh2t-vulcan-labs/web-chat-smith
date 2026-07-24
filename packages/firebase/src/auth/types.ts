import type { JwtPayload } from "@cs/core/jwt";

/**
 * The `firebase` claim embedded in every Firebase ID token.
 */
export interface FirebaseJWTClaims {
  identities: Record<string, unknown>;
  sign_in_provider: string;
}

export interface DecodedFirebaseToken extends JwtPayload {
  firebase: FirebaseJWTClaims;
}

export const AUTH_PROVIDER_KINDS = ["google", "apple", "facebook"] as const;
export type AuthProviderKind = (typeof AUTH_PROVIDER_KINDS)[number];
