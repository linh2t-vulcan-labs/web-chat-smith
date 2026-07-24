import { publicEnv } from "@cs/env/server";

import { BootstrapModel } from "@/features/guest-mode/models";
import { TransformerBuilder } from "@/libs/class-transformer";

import type { TAnonSecurityContext, TBootstrap } from "../types";
import { AnonCookieManager } from "./cookie-manager";
import { resolveCsrfOrigin } from "./csrf-origin";
import { AnonLogger } from "./logger";
import { ProxyFetch } from "./proxy-fetch";

/**
 * Centralized bootstrap utility for anon API routes
 * Handles fetching and storing CSRF tokens and nonces
 * Follows Single Responsibility Principle
 */
export const AnonBootstrapHelper = {
  /**
   * Ensures CSRF token exists, fetches new one if missing
   * Returns the CSRF token or null if bootstrap fails
   */
  async ensureCsrfToken(
    securityContext: TAnonSecurityContext
  ): Promise<string | null> {
    const existingCsrf = await AnonCookieManager.getCsrfToken();
    if (existingCsrf) {
      return existingCsrf;
    }

    const bootstrap =
      await AnonBootstrapHelper.fetchAndStoreBootstrap(securityContext);
    return bootstrap?.csrfToken || null;
  },

  /**
   * Fetches bootstrap data (CSRF token and nonce) from external service
   * and stores it in cookies
   * Returns the bootstrap data on success, null on failure
   */
  async fetchAndStoreBootstrap(
    securityContext: TAnonSecurityContext
  ): Promise<TBootstrap | null> {
    try {
      const bootstrapResponse = await ProxyFetch.get(
        `${publicEnv.CS_PUBLIC_USER_MANAGEMENT_SERVICE_URL}/api/v1/anon/bootstrap`,
        securityContext,
        { origin: resolveCsrfOrigin() }
      );

      if (!bootstrapResponse.ok) {
        AnonLogger.logError("Bootstrap request failed", securityContext, {
          statusCode: bootstrapResponse.status,
        });
        return null;
      }

      const bootstrapData = await bootstrapResponse.json();
      const bootstrap = new TransformerBuilder(BootstrapModel)
        .format(bootstrapData)
        .toPlainCamelCase() as BootstrapModel;

      const bootstrapForCookie: TBootstrap = {
        csrfToken: bootstrap.csrfToken,
        nonce: bootstrap.nonce,
      };

      await AnonCookieManager.setBootstrapCookie(bootstrapForCookie);

      return bootstrapForCookie;
    } catch (error) {
      AnonLogger.logError("Bootstrap failed with exception", securityContext, {
        error,
      });
      return null;
    }
  },
};
