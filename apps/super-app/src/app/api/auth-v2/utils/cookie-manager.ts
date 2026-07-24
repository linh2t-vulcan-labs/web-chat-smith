import { env } from "@cs/env";
import { publicEnv } from "@cs/env/server";
import { cookies } from "next/headers";

import { JoseEncryption } from "@/libs/jose";
import { COOKIE_NAME, USER_ID_KEY } from "@/utils/commons/keys";

import type { TCookieConfig } from "../types";

// Next 16: cookies() is async and must be awaited before access.
function getCookieStore() {
  return cookies();
}

/**
 * Cookie management utility for auth-v2 API routes
 * Follows DRY principles and provides consistent cookie handling
 */
export const CookieManager = {
  /**
   * Clears all authentication cookies
   */
  async clearAuthCookies(): Promise<void> {
    await CookieManager.clearCookie(USER_ID_KEY);
    await CookieManager.clearCookie(COOKIE_NAME.VULCAN_AUTH_TOKEN);
  },

  /**
   * Clears a specific cookie
   */
  async clearCookie(name: string): Promise<void> {
    const store = await getCookieStore();
    store.delete(name);
  },

  /**
   * Gets access token from encrypted VULCAN_AUTH_TOKEN cookie
   */
  async getAccessTokenFromEncrypted(): Promise<string | null> {
    const encryptedToken = await CookieManager.getVulcanAuthToken();
    if (!encryptedToken) {
      return null;
    }

    try {
      return await JoseEncryption.extractAccessToken(encryptedToken);
    } catch (error) {
      console.error("[CookieManager] Failed to extract access token:", error);
      // Clear corrupted cookie
      await CookieManager.clearCookie(COOKIE_NAME.VULCAN_AUTH_TOKEN);
      return null;
    }
  },

  /**
   * Gets all decrypted auth data from VULCAN_AUTH_TOKEN cookie
   */
  async getDecryptedAuthData(): Promise<{
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  } | null> {
    const encryptedToken = await CookieManager.getVulcanAuthToken();
    if (!encryptedToken) {
      return null;
    }

    try {
      return await JoseEncryption.decryptAuthData(encryptedToken);
    } catch (error) {
      console.error("[CookieManager] Failed to decrypt auth data:", error);
      // Clear corrupted cookie
      await CookieManager.clearCookie(COOKIE_NAME.VULCAN_AUTH_TOKEN);
      return null;
    }
  },

  /**
   * Gets refresh token from encrypted VULCAN_AUTH_TOKEN cookie
   */
  async getRefreshTokenFromEncrypted(): Promise<string | null> {
    const encryptedToken = await CookieManager.getVulcanAuthToken();
    if (!encryptedToken) {
      return null;
    }

    try {
      return await JoseEncryption.extractRefreshToken(encryptedToken);
    } catch (error) {
      console.error("[CookieManager] Failed to extract refresh token:", error);
      // Clear corrupted cookie
      await CookieManager.clearCookie(COOKIE_NAME.VULCAN_AUTH_TOKEN);
      return null;
    }
  },

  /**
   * Gets cookie configuration for debugging
   */
  getTCookieConfig(): {
    isProduction: boolean;
    isSecure: boolean;
    maxAge: number;
    sameSite: string;
  } {
    return {
      isProduction: publicEnv.CS_PUBLIC_ENV_NAME === "production",
      isSecure: publicEnv.CS_PUBLIC_WEB_URL?.startsWith("https://") || false,
      maxAge: env.JWT_MAX_AGE_SESSION,
      sameSite: "lax",
    };
  },

  /**
   * Gets user ID from cookies
   */
  async getUserId(): Promise<string | null> {
    const store = await getCookieStore();
    return store.get(USER_ID_KEY)?.value || null;
  },

  /**
   * Gets user ID from encrypted VULCAN_AUTH_TOKEN cookie
   */
  async getUserIdFromEncrypted(): Promise<string | null> {
    const encryptedToken = await CookieManager.getVulcanAuthToken();
    if (!encryptedToken) {
      return null;
    }

    try {
      return await JoseEncryption.extractUserId(encryptedToken);
    } catch (error) {
      console.error("[CookieManager] Failed to extract user ID:", error);
      // Clear corrupted cookie
      await CookieManager.clearCookie(COOKIE_NAME.VULCAN_AUTH_TOKEN);
      return null;
    }
  },

  /**
   * Gets encrypted VULCAN_AUTH_TOKEN from cookies
   */
  async getVulcanAuthToken(): Promise<string | null> {
    const store = await getCookieStore();
    return store.get(COOKIE_NAME.VULCAN_AUTH_TOKEN)?.value || null;
  },

  /**
   * Sets authentication cookies with consistent configuration
   * Now uses JOSE encryption for VULCAN_AUTH_TOKEN cookie
   * Also clears any guest session cookies to prevent conflicts
   */
  async setAuthCookies(
    userId: string,
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    // Set user ID cookie (non-httpOnly for client-side access)
    await CookieManager.setCookie({
      name: USER_ID_KEY,
      options: {
        httpOnly: false,
        maxAge: env.JWT_MAX_AGE_SESSION,
        path: "/",
        sameSite: "lax",
        secure: publicEnv.CS_PUBLIC_ENV_NAME === "production",
      },
      value: userId,
    });

    // Set encrypted VULCAN_AUTH_TOKEN cookie with all auth data
    try {
      const encryptedAuthData = await JoseEncryption.encryptAuthData({
        accessToken,
        refreshToken,
        userId,
      });

      await CookieManager.setCookie({
        name: COOKIE_NAME.VULCAN_AUTH_TOKEN,
        options: {
          httpOnly: true,
          maxAge: env.JWT_MAX_AGE_SESSION,
          path: "/",
          sameSite: "lax",
          secure: publicEnv.CS_PUBLIC_ENV_NAME === "production",
        },
        value: encryptedAuthData,
      });
    } catch (error) {
      console.error("[CookieManager] Failed to encrypt auth data:", error);
      await CookieManager.clearAuthCookies();
      throw new Error("Failed to set encrypted auth cookie", { cause: error });
    }
  },

  /**
   * Sets a cookie with the given configuration
   */
  async setCookie(config: TCookieConfig): Promise<void> {
    const store = await getCookieStore();
    store.set(config.name, config.value, config.options);
  },

  /**
   * Updates token cookies after refresh
   * Now also updates the encrypted VULCAN_AUTH_TOKEN cookie
   */
  async updateTokenCookies(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    // Update encrypted VULCAN_AUTH_TOKEN cookie
    try {
      const store = await getCookieStore();
      const currentEncryptedToken = store.get(
        COOKIE_NAME.VULCAN_AUTH_TOKEN
      )?.value;

      if (!currentEncryptedToken) {
        throw new Error("Existing auth cookie not found during refresh");
      }

      const updatedEncryptedToken = await JoseEncryption.updateAuthData(
        currentEncryptedToken,
        {
          accessToken,
          refreshToken,
        }
      );

      if (!updatedEncryptedToken) {
        throw new Error("Unable to rotate encrypted auth data");
      }

      await CookieManager.setCookie({
        name: COOKIE_NAME.VULCAN_AUTH_TOKEN,
        options: {
          httpOnly: true,
          maxAge: env.JWT_MAX_AGE_SESSION,
          path: "/",
          sameSite: "lax",
          secure: publicEnv.CS_PUBLIC_ENV_NAME === "production",
        },
        value: updatedEncryptedToken,
      });
    } catch (error) {
      console.error(
        "[CookieManager] Failed to update encrypted auth data:",
        error
      );
      await CookieManager.clearAuthCookies();
      throw new Error("Failed to rotate encrypted auth cookie", {
        cause: error,
      });
    }
  },

  /**
   * Validates cookie security settings
   */
  validateCookieSecurity(): boolean {
    const isProduction = publicEnv.CS_PUBLIC_ENV_NAME === "production";
    const isSecure = publicEnv.CS_PUBLIC_WEB_URL?.startsWith("https://");

    // In production, ensure we're using HTTPS
    if (isProduction && !isSecure) {
      console.warn(
        "[CookieManager] Production environment should use HTTPS for secure cookies"
      );
      return false;
    }

    return true;
  },
};
