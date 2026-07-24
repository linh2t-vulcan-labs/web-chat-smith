import { NextResponse } from "next/server";
import type { z } from "zod";

import { HTTP_STATUS } from "@/utils/constants/http";

import type {
  TAnonApiError,
  TAnonResponse,
  TErrorExternalService,
} from "../types";

/**
 * Returns user-friendly error messages
 */
function getUserFriendlyMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    CAPTCHA_ERROR: "Captcha verification failed. Please try again",
    CSRF_ERROR: "CSRF token invalid or expired. Please try again",
    EXTERNAL_SERVICE_ERROR:
      "Service temporarily unavailable. Please try again later",
    GUEST_SESSION_ERROR: "Guest session error. Please try again",
    RATE_LIMIT_ERROR: "Too many requests. Please try again later",
    REFRESH_ERROR:
      "Unable to refresh your session. Please create a new session",
    SECURITY_ERROR: "Request not allowed",
    SERVER_ERROR: "Something went wrong. Please try again later",
    VALIDATION_ERROR: "Please check your request and try again",
  };

  return messages[errorCode] || "An error occurred. Please try again";
}

/**
 * Centralized error handling utility for anon API routes
 * Follows SOLID principles and provides consistent error responses
 */
export const AnonErrorHandler = {
  /**
   * Creates a standardized error response
   */
  createErrorResponse(
    error: TAnonApiError | Error | string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ): NextResponse<TAnonResponse> {
    let errorMessage: string;
    let errorCode: string;

    if (typeof error === "string") {
      errorMessage = error;
      errorCode = "UNKNOWN_ERROR";
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorCode = error.name || "ERROR";
    } else {
      errorMessage = error.message;
      errorCode = error.code;
    }

    // Log error for debugging (in production, use proper logging service)
    console.error(`[Anon API Error] ${errorCode}: ${errorMessage}`, {
      statusCode,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: errorMessage,
        message: getUserFriendlyMessage(errorCode),
      },
      { status: statusCode }
    );
  },
  /**
   * Handles captcha errors
   */
  handleCaptchaError(error: string): NextResponse<TAnonResponse> {
    return AnonErrorHandler.createErrorResponse(
      {
        code: "CAPTCHA_ERROR",
        message: error,
        statusCode: HTTP_STATUS.BAD_REQUEST,
      },
      HTTP_STATUS.BAD_REQUEST
    );
  },
  /**
   * Handles CSRF token errors
   */
  handleCsrfError(error: string): NextResponse<TAnonResponse> {
    return AnonErrorHandler.createErrorResponse(
      {
        code: "CSRF_ERROR",
        message: error,
        statusCode: HTTP_STATUS.FORBIDDEN,
      },
      HTTP_STATUS.FORBIDDEN
    );
  },
  /**
   * Handles external service errors
   */
  handleExternalServiceError(
    service: string,
    error: Error | string
  ): NextResponse<TAnonResponse> {
    const message = typeof error === "string" ? error : error.message;
    return AnonErrorHandler.createErrorResponse(
      {
        code: "EXTERNAL_SERVICE_ERROR",
        message: `${service} service error: ${message}`,
        statusCode: HTTP_STATUS.BAD_REQUEST, // BAD_GATEWAY
      },
      HTTP_STATUS.BAD_REQUEST // BAD_GATEWAY
    );
  },
  /**
   * Handles guest session errors
   */
  handleGuestSessionError(error: string | Error): NextResponse<TAnonResponse> {
    return AnonErrorHandler.createErrorResponse(
      {
        code: "GUEST_SESSION_ERROR",
        message: typeof error === "string" ? error : error.message,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      },
      HTTP_STATUS.UNAUTHORIZED
    );
  },
  /**
   * Handles rate limiting errors
   */
  handleRateLimitError(retryAfter?: number): NextResponse<TAnonResponse> {
    const headers: Record<string, string> = {};
    if (retryAfter) {
      headers["Retry-After"] = retryAfter.toString();
    }

    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Please try again later",
        success: false,
      },
      {
        headers,
        status: 429, // TOO_MANY_REQUESTS,
      }
    );
  },
  /**
   * Handles token refresh errors
   */
  handleRefreshError(error: string | Error): NextResponse<TAnonResponse> {
    return AnonErrorHandler.createErrorResponse(
      {
        code: "REFRESH_ERROR",
        message: typeof error === "string" ? error : error.message,
        statusCode: HTTP_STATUS.BAD_REQUEST,
      },
      HTTP_STATUS.BAD_REQUEST
    );
  },
  /**
   * Handles security violations
   */
  handleSecurityError(error: string): NextResponse<TAnonResponse> {
    return AnonErrorHandler.createErrorResponse(
      {
        code: "SECURITY_ERROR",
        message: error,
        statusCode: HTTP_STATUS.FORBIDDEN,
      },
      HTTP_STATUS.FORBIDDEN
    );
  },
  /**
   * Handles server errors
   */
  handleServerError(_error: Error): NextResponse<TAnonResponse> {
    return AnonErrorHandler.createErrorResponse(
      {
        code: "SERVER_ERROR",
        message: "Internal server error",
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      },
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  },
  /**
   * Handles validation errors
   */
  handleValidationError(error: z.ZodError): NextResponse<TAnonResponse> {
    const message = error?.issues?.[0]?.message || "Invalid request data";
    return AnonErrorHandler.createErrorResponse(
      {
        code: "VALIDATION_ERROR",
        message,
        statusCode: HTTP_STATUS.BAD_REQUEST,
      },
      HTTP_STATUS.BAD_REQUEST
    );
  },
  /**
   * Checks if an external service error is related to CSRF token
   * Only checks error.message and error.details[0].error fields
   */
  isCsrfTokenError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    const errorObj = error as TErrorExternalService;
    const csrfKeywords = ["csrf", "CSRF"];

    // Check message field
    if (errorObj.message) {
      const hasCSRF = csrfKeywords.some((keyword) =>
        errorObj.message.toLocaleLowerCase().includes(keyword)
      );
      if (hasCSRF) {
        return true;
      }
    }

    // Check details[0].error field
    if (errorObj.details && errorObj.details.length > 0) {
      const firstDetailError = errorObj.details[0]?.error;
      if (firstDetailError) {
        const hasCSRF = csrfKeywords.some((keyword) =>
          firstDetailError.toLocaleLowerCase().includes(keyword)
        );
        if (hasCSRF) {
          return true;
        }
      }
    }

    return false;
  },
  /**
   * Wraps async functions with error handling
   */
  async withErrorHandling<T>(
    handler: () => Promise<T>
  ): Promise<NextResponse<TAnonResponse> | T> {
    try {
      return await handler();
    } catch (error) {
      if (error instanceof Error) {
        return AnonErrorHandler.handleServerError(error);
      }
      return AnonErrorHandler.createErrorResponse("Unknown error occurred");
    }
  },
};
