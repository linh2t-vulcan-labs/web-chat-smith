import "server-only";
import { env } from "@cs/env";
import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";

export const GUEST_SESSION_COOKIE = "guest_session";
export const GUEST_CSRF_COOKIE = "guest_csrf_token";
export const GUEST_NONCE_COOKIE = "guest_nonce";

const ISSUER = "cs-guest-session";
const ALGORITHM = "dir";

export interface GuestSession {
  anonId: string;
  deviceId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
}

const baseCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: true,
};

const getSecretKey = (): Uint8Array => {
  const secret = env.GUEST_SESSION_SECRET_KEY;
  if (!secret) {
    throw new Error("GUEST_SESSION_SECRET_KEY is not configured");
  }
  return new Uint8Array(Buffer.from(secret, "hex"));
};

/**
 * The guest session (access + refresh token, plus anon/device/session ids)
 * is stored as a single encrypted cookie — unlike the authenticated flow's
 * two plain httpOnly cookies (`server/cookies.ts`), because there is no
 * mirrored-access-token-for-SSR concern here: guest pages don't need a
 * separate fast-path cookie, and encrypting the whole blob keeps the
 * anon/device/session ids (used for backend-side analytics correlation) out
 * of a readable cookie value.
 */
export const setGuestSessionCookie = async (
  session: GuestSession
): Promise<void> => {
  const encrypted = await new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: ALGORITHM, enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${env.GUEST_SESSION_MAX_AGE}s`)
    .setIssuer(ISSUER)
    .encrypt(getSecretKey());

  const store = await cookies();
  store.set(GUEST_SESSION_COOKIE, encrypted, {
    ...baseCookieOptions,
    maxAge: env.GUEST_SESSION_MAX_AGE,
  });
};

export const clearGuestSessionCookie = async (): Promise<void> => {
  const store = await cookies();
  store.delete(GUEST_SESSION_COOKIE);
  store.delete(GUEST_CSRF_COOKIE);
  store.delete(GUEST_NONCE_COOKIE);
};

export const getGuestSessionCookie = async (): Promise<GuestSession | null> => {
  const store = await cookies();
  const cookie = store.get(GUEST_SESSION_COOKIE);
  if (!cookie) {
    return null;
  }

  try {
    const { payload } = await jwtDecrypt(cookie.value, getSecretKey(), {
      issuer: ISSUER,
    });
    const { iat: _iat, exp: _exp, iss: _iss, ...session } = payload;
    return session as unknown as GuestSession;
  } catch {
    // Corrupted/rotated-secret cookie — clear it so the caller re-provisions
    // a fresh guest session instead of looping on a decrypt failure.
    await clearGuestSessionCookie();
    return null;
  }
};

export const setGuestCsrfCookie = async (csrfToken: string): Promise<void> => {
  const store = await cookies();
  store.set(GUEST_CSRF_COOKIE, csrfToken, baseCookieOptions);
};

export const getGuestCsrfCookie = async (): Promise<string | undefined> => {
  const store = await cookies();
  return store.get(GUEST_CSRF_COOKIE)?.value;
};

/**
 * The backend's `POST /anon/sessions` and `POST /anon/tokens:refresh` both
 * require an `X-Nonce` header bound to the CSRF token from the same
 * bootstrap call (confirmed live: omitting it fails with "Nonce validation
 * failed: nonce cannot be empty") — stored alongside the CSRF token so both
 * survive together across requests.
 */
export const setGuestNonceCookie = async (nonce: string): Promise<void> => {
  const store = await cookies();
  store.set(GUEST_NONCE_COOKIE, nonce, baseCookieOptions);
};

export const getGuestNonceCookie = async (): Promise<string | undefined> => {
  const store = await cookies();
  return store.get(GUEST_NONCE_COOKIE)?.value;
};
