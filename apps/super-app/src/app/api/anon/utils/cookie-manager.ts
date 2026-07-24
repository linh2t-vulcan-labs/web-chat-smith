import { env } from "@cs/env";
import { publicEnv } from "@cs/env/server";
import { cookies } from "next/headers";

import { JoseEncryption } from "@/libs/jose";
import { COOKIE_NAME } from "@/utils/commons/keys";

import type { TAnonCookieConfig, TBootstrap, TGuestSession } from "../types";

// Next 16: cookies() is async and must be awaited before access.
function getCookieStore() {
  return cookies();
}

/**
 * Sets a cookie with the given configuration
 */
async function setCookie(config: TAnonCookieConfig): Promise<void> {
  const store = await getCookieStore();
  store.set(config.name, config.value, config.options);
}

/**
 * Clears a specific cookie
 */
async function clearCookie(name: string): Promise<void> {
  const store = await getCookieStore();
  store.delete(name);
}

/**
 * Cookie management utility for anon API routes
 * Follows DRY principles and provides consistent cookie handling
 */
export const AnonCookieManager = {
  /**
   * Clears captcha token cookie
   */
  async clearCaptchaTokenCookie(): Promise<void> {
    await clearCookie(COOKIE_NAME.CAPTCHA_TOKEN);
  },

  /**
   * Clears all guest session cookies
   */
  async clearGuestSessionCookie(): Promise<void> {
    await clearCookie(COOKIE_NAME.VULCAN_GUEST_TOKEN);
    await clearCookie(COOKIE_NAME.CSRF_TOKEN);
    await clearCookie(COOKIE_NAME.CAPTCHA_TOKEN);
  },

  /**
   * Gets captcha token from cookie
   * @returns The captcha token if it exists and is valid, null otherwise
   */
  async getCaptchaTokenCookie(): Promise<string | null> {
    try {
      const store = await getCookieStore();
      const cookie = store.get(COOKIE_NAME.CAPTCHA_TOKEN);
      return cookie?.value || null;
    } catch (error) {
      console.error(
        "[AnonCookieManager] Failed to get captcha token cookie:",
        error
      );
      return null;
    }
  },

  /**
   * Gets cookie configuration for debugging
   */
  getCookieConfig(): {
    isProduction: boolean;
    isSecure: boolean;
    maxAge: number;
    sameSite: string;
  } {
    return {
      isProduction: publicEnv.CS_PUBLIC_ENV_NAME === "production",
      isSecure: publicEnv.CS_PUBLIC_WEB_URL?.startsWith("https://") || false,
      maxAge: env.GUEST_SESSION_MAX_AGE,
      sameSite: "lax",
    };
  },

  /**
   * Gets CSRF token from cookie
   */
  async getCsrfToken(): Promise<string | null> {
    const store = await getCookieStore();
    return store.get(COOKIE_NAME.CSRF_TOKEN)?.value || null;
  },

  /**
   * Gets guest session from encrypted cookie
   */
  async getGuestSessionCookie(): Promise<TGuestSession | null> {
    try {
      const store = await getCookieStore();
      const cookie = store.get(COOKIE_NAME.VULCAN_GUEST_TOKEN);

      if (!cookie) {
        return null;
      }

      const session = await JoseEncryption.decryptGuestSession<TGuestSession>(
        cookie.value
      );
      return session;
    } catch (error) {
      console.error(
        "[AnonCookieManager] Failed to get guest session cookie:",
        error
      );
      // Clear corrupted cookie
      await AnonCookieManager.clearGuestSessionCookie();
      return null;
    }
  },

  /**
   * Sets bootstrap cookie (CSRF token)
   */
  async setBootstrapCookie(bootstrap: TBootstrap): Promise<void> {
    try {
      await setCookie({
        name: COOKIE_NAME.CSRF_TOKEN,
        options: {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: publicEnv.CS_PUBLIC_ENV_NAME === "production",
        },
        value: bootstrap.csrfToken,
      });
    } catch (error) {
      console.error(
        "[AnonCookieManager] Failed to set bootstrap cookie:",
        error
      );
      throw error;
    }
  },

  /**
   * Sets captcha token cookie to store the actual captcha token
   * @param token The captcha token to store
   */
  async setCaptchaTokenCookie(token: string): Promise<void> {
    try {
      await setCookie({
        name: COOKIE_NAME.CAPTCHA_TOKEN,
        options: {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: publicEnv.CS_PUBLIC_ENV_NAME === "production",
        },
        value: token,
      });
    } catch (error) {
      console.error(
        "[AnonCookieManager] Failed to set captcha token cookie:",
        error
      );
      throw error;
    }
  },

  /**
   * Sets guest session cookies with encrypted data
   */
  async setGuestSessionCookie(session: TGuestSession): Promise<void> {
    try {
      const encrypted = await JoseEncryption.encryptGuestSession(session);

      await setCookie({
        name: COOKIE_NAME.VULCAN_GUEST_TOKEN,
        options: {
          httpOnly: true,
          maxAge: env.GUEST_SESSION_MAX_AGE,
          path: "/",
          sameSite: "lax",
          secure: publicEnv.CS_PUBLIC_ENV_NAME === "production",
        },
        value: encrypted,
      });
    } catch (error) {
      console.error(
        "[AnonCookieManager] Failed to set guest session cookie:",
        error
      );
      throw error;
    }
  },

  /**
   * Updates guest session cookie with new tokens
   */
  async updateGuestSessionCookie(
    accessToken: string,
    refreshToken?: string
  ): Promise<void> {
    try {
      const currentSession = await AnonCookieManager.getGuestSessionCookie();

      if (!currentSession) {
        throw new Error("No existing guest session to update");
      }

      const updatedSession: TGuestSession = {
        ...currentSession,
        accessToken,
        ...(refreshToken && { refreshToken }),
      };

      await AnonCookieManager.setGuestSessionCookie(updatedSession);
    } catch (error) {
      console.error(
        "[AnonCookieManager] Failed to update guest session cookie:",
        error
      );
      throw error;
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
        "[AnonCookieManager] Production environment should use HTTPS for secure cookies"
      );
      return false;
    }

    return true;
  },
};
