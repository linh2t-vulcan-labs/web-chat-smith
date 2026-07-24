import { jwtDecode } from "@cs/core/jwt";

import type { DecodedFirebaseToken } from "./types";

export type { AuthProviderKind } from "./types";

/**
 * Decodes a Firebase ID token and extracts which social provider the user
 * signed in with (the part of `sign_in_provider` before the first `.`, e.g.
 * `"google"` from `"google.com"`).
 *
 * Never throws: returns `null` for an empty or malformed token.
 */
export const decodeFirebaseToken = (
  token: string
): (DecodedFirebaseToken & { providerKind: string }) | null => {
  if (!token) {
    return null;
  }
  try {
    const decoded = jwtDecode<DecodedFirebaseToken>(token);
    const [providerKind] = decoded.firebase.sign_in_provider.split(".");
    return { ...decoded, providerKind: providerKind ?? "" };
  } catch {
    return null;
  }
};

/**
 * Extracts the Firebase user id (`sub` claim) from an ID token, or `""` if
 * the token is empty/malformed.
 */
export const extractUserId = (token: string): string => {
  if (!token) {
    return "";
  }
  try {
    return jwtDecode<{ sub?: string }>(token).sub ?? "";
  } catch {
    return "";
  }
};
