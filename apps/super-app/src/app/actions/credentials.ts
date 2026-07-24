"use server";

import { randomBytes } from "node:crypto";

import { cookies, headers } from "next/headers";

import type { TRefreshToken } from "@/core/models/signin";
import { RefreshTokenModel } from "@/core/models/signin";
import type { TCredentialActions } from "@/core/models/user";
import { userServerService } from "@/core/repositories";
import { extractUserId } from "@/utils/commons/auth";
import {
  CSRF_COOKIE_TOKEN,
  REFRESH_TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_NAME,
} from "@/utils/commons/keys";

export const getCredentialsAction = async (): Promise<TCredentialActions> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
  const userId =
    extractUserId(token ?? "") || extractUserId(refreshToken ?? "");

  return {
    refreshToken,
    token,
    userId,
  };
};

// Cloudflare emits these as `CF-IPCountry` when it cannot resolve a real country.
// `XX` = unknown; `EU` / `AP` = continent-level fallbacks. All three pass the 2-letter
// regex but are NOT valid ISO 3166-1 countries, so reject them. (`T1` = Tor is already
// rejected by the regex because it contains a digit.)
const CF_NON_COUNTRY = new Set(["XX", "EU", "AP"]);

/**
 * Resolve the visitor's ISO 3166-1 alpha-2 country code from the Cloudflare
 * `CF-IPCountry` edge header, or `null` when it cannot be determined.
 *
 */
export const getCloudFlareCountry = async (): Promise<string | null> => {
  const requestHeaders = await headers();
  const raw = requestHeaders.get("CF-IPCountry")?.toUpperCase();

  return raw && /^[A-Z]{2}$/u.test(raw) && !CF_NON_COUNTRY.has(raw)
    ? raw
    : null;
};

export const refreshTokenAction = async (
  refreshToken: string,
  _enabledHandleAuthError?: boolean
) => {
  const [_error, result] = await userServerService.refreshToken(
    refreshToken,
    false
  );

  await saveUserTokenAction(result || new RefreshTokenModel());

  return result;
};

export const saveUserTokenAction = async (
  refreshTokenResult: TRefreshToken
) => {
  const { accessToken, refreshToken, accessTokenMaxAge, refreshTokenMaxAge } =
    refreshTokenResult;
  const csrfToken = randomBytes(32).toString("hex");
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE_NAME, accessToken, {
    path: "/",
    // domain: COOKIE_DOMAIN,
    httpOnly: true,
    secure: true,
    maxAge: accessTokenMaxAge,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    path: "/",
    // domain: COOKIE_DOMAIN,
    httpOnly: true,
    secure: true,
    maxAge: refreshTokenMaxAge,
  });

  cookieStore.set(CSRF_COOKIE_TOKEN, csrfToken, {
    path: "/",
    // domain: COOKIE_DOMAIN,
    httpOnly: false,
    secure: true,
    maxAge: refreshTokenMaxAge,
  });
};

const getServerCookieValue = async (
  key: string
): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value;
};

export { getServerCookieValue };
