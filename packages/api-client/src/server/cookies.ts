import "server-only";
import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const baseCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: true,
};

export interface SessionCookiesInput {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken?: string;
  refreshTokenExpiresAt?: number;
}

/**
 * Both cookies are httpOnly — `access_token` is mirrored here purely so
 * Server Components/Actions can read a valid token without triggering their
 * own refresh call, which is the main defense against the "no grace period"
 * constraint on the SSR side (see docs/runbook/api-client.md §4.1/§4.3).
 */
export const setSessionCookies = async (
  input: SessionCookiesInput
): Promise<void> => {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, input.accessToken, {
    ...baseCookieOptions,
    expires: new Date(input.accessTokenExpiresAt),
  });
  if (input.refreshToken) {
    store.set(REFRESH_TOKEN_COOKIE, input.refreshToken, {
      ...baseCookieOptions,
      expires: input.refreshTokenExpiresAt
        ? new Date(input.refreshTokenExpiresAt)
        : undefined,
    });
  }
};

export const clearSessionCookies = async (): Promise<void> => {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
};

export const getAccessTokenCookie = async (): Promise<string | undefined> => {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value;
};

export const getRefreshTokenCookie = async (): Promise<string | undefined> => {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value;
};
