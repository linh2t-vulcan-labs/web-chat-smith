import { publicEnv } from "@cs/env/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { GuestSessionModel } from "@/features/guest-mode/models";
import type { TCreateGuestSessionResponse } from "@/features/guest-mode/types";
import { TransformerBuilder } from "@/libs/class-transformer";
import { omit } from "@/libs/lodash-es";
import { safeResponseJsonFormat } from "@/utils/commons/request";
import { HTTP_STATUS } from "@/utils/constants/http";

import { AnonSecurityMiddleware } from "../middleware/security";
import type {
  TErrorExternalService,
  TGuestSession,
  TCreateGuestSessionResponse as TResponse,
} from "../types";
import { AnonBootstrapHelper } from "../utils/bootstrap-helper";
import { AnonCookieManager } from "../utils/cookie-manager";
import { resolveCsrfOrigin } from "../utils/csrf-origin";
import { AnonErrorHandler } from "../utils/error-handler";
import { AnonLogger } from "../utils/logger";
import { ProxyFetch } from "../utils/proxy-fetch";
import { AnonRequestValidator } from "../utils/validation";

/**
 * POST /api/anon/session
 * Creates or returns existing guest session
 *
 * Flow:
 * - If guest session (vgt cookie) already exists, returns existing session immediately
 * - If no session exists, creates a new one with captcha validation
 * - Called from client only when vgt cookie doesn't exist
 *
 * Security Features:
 * - Origin validation (only allows requests from same domain)
 * - Request validation using Zod schemas
 * - Rate limiting protection
 * - Structured logging for security monitoring
 * - Secure cookie configuration
 * - CSRF token validation
 * - Captcha validation
 * - Automatic retry with new CSRF token on expiration
 */
export function POST(request: NextRequest) {
  return handleCreateSession(request, 0);
}

/**
 * Internal session creation handler with retry logic
 */
async function handleCreateSession(
  request: NextRequest,
  retryAttempt: number
): Promise<NextResponse> {
  const securityContext =
    AnonSecurityMiddleware.extractSecurityContext(request);

  try {
    // Check for existing guest session
    const existingSession = await AnonCookieManager.getGuestSessionCookie();
    if (existingSession) {
      return NextResponse.json(
        {
          data: existingSession,
          message: "Existing guest session returned",
          success: true,
        },
        { status: HTTP_STATUS.OK }
      );
    }

    // Security validation
    const securityValidation = AnonSecurityMiddleware.validateRequest(request);
    if (!securityValidation.isValid) {
      return AnonErrorHandler.handleSecurityError(
        securityValidation.error ?? "Request origin not allowed"
      );
    }

    // Content-Type validation
    const contentTypeValidation =
      AnonSecurityMiddleware.validateContentType(request);
    if (!contentTypeValidation.isValid) {
      return AnonErrorHandler.createErrorResponse(
        contentTypeValidation.error ?? "Invalid Content-Type",
        HTTP_STATUS.BAD_REQUEST
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

    // Request validation
    const validation =
      await AnonRequestValidator.validateCreateGuestSessionRequestComplete(
        request
      );
    if (!validation.success) {
      return validation.error;
    }

    const { captchaToken, nonce } = validation.data;

    // Prepare payload for external service
    const payload = {
      captcha_token: captchaToken,
    };

    // Ensure CSRF token exists, fetch new one if missing
    const latestCsrfToken =
      await AnonBootstrapHelper.ensureCsrfToken(securityContext);
    if (!latestCsrfToken) {
      AnonLogger.logError("Failed to obtain CSRF token", securityContext);
      await AnonCookieManager.clearGuestSessionCookie();
      return AnonErrorHandler.handleCsrfError("Unable to obtain CSRF token");
    }

    // Call external service to create guest session
    const response = await ProxyFetch.post(
      `${publicEnv.CS_PUBLIC_USER_MANAGEMENT_SERVICE_URL}/api/v1/anon/sessions`,
      securityContext,
      payload,
      {
        Cookie: `csrf_token=${latestCsrfToken}`,
        "X-CSRF-Token": latestCsrfToken,
        "X-Nonce": nonce,
        origin: resolveCsrfOrigin(),
      }
    );

    if (!response.ok) {
      const error = (await safeResponseJsonFormat(
        response
      )) as TErrorExternalService;
      AnonLogger.logError("Create guest session failed", securityContext, {
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
          // Retry the session creation with new CSRF token
          return await handleCreateSession(request, 1);
        }

        AnonLogger.logError(
          "Bootstrap failed during session creation retry",
          securityContext
        );
      }

      // Clear session on any error
      await AnonCookieManager.clearGuestSessionCookie();
      return AnonErrorHandler.handleExternalServiceError(
        "User Management",
        error?.message || "Session creation failed"
      );
    }

    const sessionData =
      await safeResponseJsonFormat<TCreateGuestSessionResponse>(response);

    if (!sessionData) {
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
    const guestSession = new TransformerBuilder(GuestSessionModel)
      .format(sessionData)
      .toPlainCamelCase() as GuestSessionModel;

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

    // Set guest session cookie
    const sessionForCookie: TGuestSession = {
      accessToken: guestSession.accessToken,
      anonId: guestSession.anonId,
      deviceId: guestSession.deviceId,
      refreshToken: guestSession.refreshToken,
      sessionId: guestSession.sessionId,
    };

    await AnonCookieManager.setGuestSessionCookie(sessionForCookie);

    // Store captcha token for 10 days (this serves as verification)
    await AnonCookieManager.setCaptchaTokenCookie(captchaToken);

    // Return success response
    const responseData: TResponse = {
      data: omit(sessionForCookie, "refreshToken"),
    };

    return NextResponse.json(responseData, { status: HTTP_STATUS.OK });
  } catch (error) {
    AnonLogger.logError(error as Error, securityContext, {
      location: "POST /api/anon/session",
      retryAttempt,
    });
    // Clear session on any unexpected error
    await AnonCookieManager.clearGuestSessionCookie();
    return AnonErrorHandler.handleServerError(error as Error);
  }
}
