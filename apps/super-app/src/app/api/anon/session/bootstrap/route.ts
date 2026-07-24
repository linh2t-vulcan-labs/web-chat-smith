import { publicEnv } from "@cs/env/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { BootstrapModel } from "@/features/guest-mode/models";
import type { TBootstrapGuestModeResponse } from "@/features/guest-mode/types";
import { TransformerBuilder } from "@/libs/class-transformer";
import { safeResponseJsonFormat } from "@/utils/commons/request";
import { HTTP_STATUS } from "@/utils/constants/http";

import { AnonSecurityMiddleware } from "../../middleware/security";
import type {
  TBootstrap,
  TBootstrapResponse,
  TErrorExternalService,
} from "../../types";
import { AnonCookieManager } from "../../utils/cookie-manager";
import { resolveCsrfOrigin } from "../../utils/csrf-origin";
import { AnonErrorHandler } from "../../utils/error-handler";
import { AnonLogger } from "../../utils/logger";
import { ProxyFetch } from "../../utils/proxy-fetch";

/**
 * GET /api/anon/session/bootstrap
 * Bootstraps guest session by obtaining CSRF token and nonce
 * This endpoint is ALWAYS called on page load, regardless of session state
 *
 * Flow:
 * - Called first when user lands on guest mode page
 * - Provides CSRF token and nonce required for subsequent API calls
 * - Always enabled for bot protection
 * - Session creation happens separately after captcha verification
 *
 * Security Features:
 * - Origin validation (only allows requests from same domain)
 * - Rate limiting protection
 * - Structured logging for security monitoring
 * - Secure cookie configuration
 */
export async function GET(request: NextRequest) {
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

    // Call external service to bootstrap guest session.
    // Send the trusted origin so the issued CSRF token is bound to the same
    // origin that session creation will present.
    const response = await ProxyFetch.get(
      `${publicEnv.CS_PUBLIC_USER_MANAGEMENT_SERVICE_URL}/api/v1/anon/bootstrap`,
      securityContext,
      { origin: resolveCsrfOrigin() }
    );

    if (!response.ok) {
      const error = (await response.json()) as TErrorExternalService;
      AnonLogger.logError("Bootstrap guest session failed", securityContext, {
        error: JSON.stringify(error),
        statusCode: response.status,
      });
      return AnonErrorHandler.handleExternalServiceError(
        "User Management",
        error.message || "Bootstrap failed"
      );
    }

    const bootstrapData =
      await safeResponseJsonFormat<TBootstrapGuestModeResponse>(response);

    if (!bootstrapData) {
      AnonLogger.logError(
        "Invalid response format from service",
        securityContext
      );
      return AnonErrorHandler.handleExternalServiceError(
        "User Management",
        "Invalid response format"
      );
    }

    // Transform response to internal model
    const bootstrap = new TransformerBuilder(BootstrapModel)
      .format(bootstrapData)
      .toPlainCamelCase() as BootstrapModel;

    // Validate cookie security settings
    if (!AnonCookieManager.validateCookieSecurity()) {
      AnonLogger.logError(
        "Invalid cookie security configuration",
        securityContext
      );
      return AnonErrorHandler.handleServerError(
        new Error("Cookie security configuration invalid")
      );
    }

    // Set bootstrap cookie (CSRF token)
    const bootstrapForCookie: TBootstrap = {
      csrfToken: bootstrap.csrfToken,
      nonce: bootstrap.nonce,
    };

    await AnonCookieManager.setBootstrapCookie(bootstrapForCookie);

    // Return success response
    const responseData: TBootstrapResponse = {
      data: bootstrapForCookie,
    };

    return NextResponse.json(responseData, { status: HTTP_STATUS.OK });
  } catch (error) {
    AnonLogger.logError(error as Error, securityContext, {
      location: "GET /api/anon/session/bootstrap",
    });
    return AnonErrorHandler.handleServerError(error as Error);
  }
}
