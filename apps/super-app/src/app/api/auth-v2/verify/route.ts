import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { userServerService } from "@/core/repositories";
import type { EAUTH_PROVIDER } from "@/utils/commons/enums";
import { HTTP_STATUS } from "@/utils/constants/http";

import { SecurityMiddleware } from "../middleware/security";
import type { TVerifyTokenResponse } from "../types";
import { CookieManager } from "../utils/cookie-manager";
import { ErrorHandler } from "../utils/error-handler";
import { AuthLogger } from "../utils/logger";
import { getProxyHeaders } from "../utils/proxy-headers";
import { RequestValidator } from "../utils/validation";

/**
 * POST /api/auth-v2/verify
 * Verifies OAuth token and sets authentication cookies
 *
 * Security Features:
 * - Origin validation (only allows requests from same domain)
 * - Request validation using Zod schemas
 * - Rate limiting protection
 * - Structured logging for security monitoring
 * - Secure cookie configuration
 */
export async function POST(request: NextRequest) {
  const securityContext = SecurityMiddleware.extractSecurityContext(request);

  try {
    // Security validation
    const securityValidation = SecurityMiddleware.validateRequest(request);
    if (!securityValidation.isValid) {
      if (!securityValidation.error) {
        throw new Error("Security validation failed without an error message");
      }
      return ErrorHandler.handleSecurityError(securityValidation.error);
    }

    // Content-Type validation
    const contentTypeValidation =
      SecurityMiddleware.validateContentType(request);
    if (!contentTypeValidation.isValid) {
      if (!contentTypeValidation.error) {
        throw new Error(
          "Content-Type validation failed without an error message"
        );
      }
      return ErrorHandler.createErrorResponse(
        contentTypeValidation.error,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Rate limiting check
    const rateLimitCheck = await SecurityMiddleware.checkRateLimit(
      request,
      securityContext.ip || "unknown"
    );
    if (!rateLimitCheck.isValid) {
      return ErrorHandler.handleRateLimitError(rateLimitCheck.retryAfter);
    }

    // Request validation
    const validation =
      await RequestValidator.validateVerifyTokenRequestComplete(request);
    if (!validation.success) {
      return validation.error;
    }

    const { token, provider, countryCode } = validation.data;

    // Verify OAuth token
    const [error, user] = await userServerService.verifyOAuthToken(
      token,
      provider as EAUTH_PROVIDER,
      countryCode || undefined,
      getProxyHeaders(request)
    );

    if (error) {
      AuthLogger.logError(
        error.message || "Authentication failed",
        securityContext,
        {
          countryCode,
          externalServiceError: error.error
            ? JSON.stringify(error.error)
            : undefined,
          provider,
          statusCode: error.status,
        }
      );
      return ErrorHandler.handleAuthError("Invalid token");
    }

    // Validate cookie security settings
    if (!CookieManager.validateCookieSecurity()) {
      AuthLogger.logError(
        "Invalid cookie security configuration",
        securityContext
      );
      return ErrorHandler.handleServerError(
        new Error("Cookie security configuration invalid")
      );
    }

    // Set authentication cookies (now async)
    await CookieManager.setAuthCookies(
      user.userId,
      user.accessToken,
      user.refreshToken
    );

    // Return success response
    const response: TVerifyTokenResponse = {
      data: {
        accessToken: user.accessToken,
        isNewUser: user.isNewUser,
        userId: user.userId,
      },
      message: "Authentication successful",
      success: true,
    };

    return NextResponse.json(response, { status: HTTP_STATUS.OK });
  } catch (error) {
    AuthLogger.logError(error as Error, securityContext);
    return ErrorHandler.handleServerError(error as Error);
  }
}
