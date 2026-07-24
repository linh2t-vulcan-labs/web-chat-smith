import { publicEnv } from "@cs/env/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { GuestRefreshTokenModel } from "@/features/guest-mode/models";
import type { TRefreshTokenResponse } from "@/features/guest-mode/types";
import { TransformerBuilder } from "@/libs/class-transformer";
import { safeResponseJsonFormat } from "@/utils/commons/request";
import { HTTP_STATUS } from "@/utils/constants/http";

import { AnonSecurityMiddleware } from "../../middleware/security";
import type {
  TErrorExternalService,
  TGuestSession,
  TRefreshGuestSessionResponse,
} from "../../types";
import { AnonBootstrapHelper } from "../../utils/bootstrap-helper";
import { AnonCookieManager } from "../../utils/cookie-manager";
import { resolveCsrfOrigin } from "../../utils/csrf-origin";
import { AnonErrorHandler } from "../../utils/error-handler";
import { AnonLogger } from "../../utils/logger";
import { ProxyFetch } from "../../utils/proxy-fetch";
import { AnonRequestValidator } from "../../utils/validation";

/**
 * POST /api/anon/session/refresh
 * Refreshes guest session tokens
 *
 * Security Features:
 * - Origin validation (only allows requests from same domain)
 * - Request validation using Zod schemas
 * - Rate limiting protection
 * - Structured logging for security monitoring
 * - Secure cookie configuration
 * - CSRF token validation
 * - Automatic retry with new CSRF token on expiration
 */
export function POST(request: NextRequest) {
  return handleRefresh(request, 0);
}

/**
 * Internal refresh handler with retry logic
 */
async function handleRefresh(
  request: NextRequest,
  retryAttempt: number
): Promise<NextResponse> {
  const securityContext =
    AnonSecurityMiddleware.extractSecurityContext(request);

  try {
    // Security validation
    const securityValidation = AnonSecurityMiddleware.validateRequest(request);
    if (!securityValidation.isValid) {
      return AnonErrorHandler.handleSecurityError(
        securityValidation.error ?? "Request origin not allowed"
      );
    }

    // Rate limiting check
    const rateLimitCheck = await AnonSecurityMiddleware.checkRateLimit(
      request,
      securityContext.ip || "unknown"
    );
    if (!rateLimitCheck.isValid) {
      return AnonErrorHandler.handleRateLimitError(rateLimitCheck.retryAfter);
    }

    // Get refresh token from cookie
    const currentSession = await AnonCookieManager.getGuestSessionCookie();
    if (!currentSession?.refreshToken) {
      await AnonCookieManager.clearGuestSessionCookie();
      return AnonErrorHandler.handleGuestSessionError(
        "No guest session to refresh"
      );
    }

    // Validate refresh token format
    const tokenValidation = AnonRequestValidator.validateTokenFormat(
      currentSession.refreshToken
    );
    if (!tokenValidation.isValid) {
      await AnonCookieManager.clearGuestSessionCookie();
      return AnonErrorHandler.handleRefreshError(
        tokenValidation.error ?? "Invalid token format"
      );
    }

    // Ensure CSRF token exists, fetch new one if missing
    const csrfToken =
      await AnonBootstrapHelper.ensureCsrfToken(securityContext);
    if (!csrfToken) {
      AnonLogger.logError("Failed to obtain CSRF token", securityContext);
      await AnonCookieManager.clearGuestSessionCookie();
      return AnonErrorHandler.handleCsrfError("Unable to obtain CSRF token");
    }

    // Call external service to refresh token
    const response = await ProxyFetch.post(
      `${publicEnv.CS_PUBLIC_USER_MANAGEMENT_SERVICE_URL}/api/v1/anon/tokens:refresh`,
      securityContext,
      {
        refresh_token: currentSession.refreshToken,
      },
      {
        Cookie: `csrf_token=${csrfToken}`,
        "X-CSRF-Token": csrfToken,
        origin: resolveCsrfOrigin(),
      }
    );

    // Handle failed refresh attempt
    if (!response.ok) {
      const error = (await safeResponseJsonFormat(
        response
      )) as TErrorExternalService;
      AnonLogger.logError("Refresh token failed", securityContext, {
        error: JSON.stringify(error),
        retryAttempt,
        statusCode: response.status,
      });

      // Check if this is a CSRF token error and we haven't retried yet
      const isCsrfTokenExpired = AnonErrorHandler.isCsrfTokenError(error);

      if (isCsrfTokenExpired && retryAttempt === 0) {
        // Get new CSRF token via bootstrap and retry
        const bootstrap =
          await AnonBootstrapHelper.fetchAndStoreBootstrap(securityContext);

        if (bootstrap) {
          // Retry the refresh with new CSRF token
          return await handleRefresh(request, 1);
        }

        AnonLogger.logError(
          "Bootstrap failed during refresh retry",
          securityContext
        );
      }

      // If retry failed or not a CSRF issue, clear session
      await AnonCookieManager.clearGuestSessionCookie();
      return AnonErrorHandler.handleRefreshError("Failed to refresh session");
    }

    const refreshData =
      await safeResponseJsonFormat<TRefreshTokenResponse>(response);

    if (!refreshData) {
      AnonLogger.logError(
        "Invalid response format from service",
        securityContext
      );
      await AnonCookieManager.clearGuestSessionCookie();
      return AnonErrorHandler.handleExternalServiceError(
        "User Management",
        "Invalid response format"
      );
    }

    // Transform response to internal model
    const guestRefreshToken = new TransformerBuilder(GuestRefreshTokenModel)
      .format(refreshData)
      .toPlainCamelCase() as GuestRefreshTokenModel;

    // Update session with new tokens
    const updatedSession: TGuestSession = {
      ...currentSession,
      accessToken: guestRefreshToken.accessToken,
      ...(guestRefreshToken.refreshToken && {
        refreshToken: guestRefreshToken.refreshToken,
      }),
    };

    // Validate cookie security settings
    if (!AnonCookieManager.validateCookieSecurity()) {
      AnonLogger.logError(
        "Invalid cookie security configuration",
        securityContext
      );
      await AnonCookieManager.clearGuestSessionCookie();
      return AnonErrorHandler.handleServerError(
        new Error("Cookie security configuration invalid")
      );
    }

    // Update guest session cookie
    await AnonCookieManager.setGuestSessionCookie(updatedSession);

    // Return success response
    const responseData: TRefreshGuestSessionResponse = {
      data: {
        accessToken: updatedSession.accessToken,
      },
    };

    return NextResponse.json(responseData, { status: HTTP_STATUS.OK });
  } catch (error) {
    AnonLogger.logError(error as Error, securityContext, {
      location: "POST /api/anon/session/refresh",
      retryAttempt,
    });

    // Clear cookies on any unexpected error
    await AnonCookieManager.clearGuestSessionCookie();
    return AnonErrorHandler.handleServerError(error as Error);
  }
}
