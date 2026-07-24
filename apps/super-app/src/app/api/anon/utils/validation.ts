import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { HTTP_STATUS } from "@/utils/constants/http";

import { createRequestValidator } from "../../_shared/request-validation";
import {
  CreateGuestSessionRequestSchema,
  RefreshGuestSessionRequestSchema,
} from "../types";
import { AnonErrorHandler } from "./error-handler";

const base = createRequestValidator({ errorHandler: AnonErrorHandler });

/**
 * Request validation utility for anon API routes.
 * Shared primitives (validateJsonRequest / validateHeaders / validateCountryCode)
 * come from the request-validation factory; the methods below are anon specific.
 */
export const AnonRequestValidator = {
  ...base,
  /**
   * Validates captcha token format
   */
  validateCaptchaToken(captchaToken: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!captchaToken || typeof captchaToken !== "string") {
      return {
        error: "Captcha token must be a non-empty string",
        isValid: false,
      };
    }

    if (captchaToken.length < 10) {
      return {
        error: "Invalid captcha token format",
        isValid: false,
      };
    }

    return { isValid: true };
  },

  /**
   * Validates create guest session request
   */
  validateCreateGuestSessionRequest(
    request: NextRequest
  ): Promise<
    | { success: true; data: z.infer<typeof CreateGuestSessionRequestSchema> }
    | { success: false; error: NextResponse }
  > {
    return AnonRequestValidator.validateJsonRequest(
      request,
      CreateGuestSessionRequestSchema
    );
  },

  /**
   * Comprehensive request validation for create guest session
   */
  async validateCreateGuestSessionRequestComplete(
    request: NextRequest
  ): Promise<
    | {
        success: true;
        data: {
          captchaToken: string;
          csrfToken: string;
          nonce: string;
          countryCode: string | null;
        };
      }
    | { success: false; error: NextResponse }
  > {
    // Validate headers
    const headerValidation = AnonRequestValidator.validateHeaders(request);
    if (!headerValidation.isValid) {
      return {
        error: AnonErrorHandler.createErrorResponse(
          headerValidation.error ?? "Content-Type must be application/json",
          HTTP_STATUS.BAD_REQUEST
        ),
        success: false,
      };
    }

    // Validate JSON body
    const bodyValidation =
      await AnonRequestValidator.validateCreateGuestSessionRequest(request);
    if (!bodyValidation.success) {
      return bodyValidation;
    }

    const { captchaToken, csrfToken, nonce } = bodyValidation.data;

    // Validate captcha token format
    const captchaValidation =
      AnonRequestValidator.validateCaptchaToken(captchaToken);
    if (!captchaValidation.isValid) {
      return {
        error: AnonErrorHandler.createErrorResponse(
          captchaValidation.error ?? "Invalid captcha token format",
          HTTP_STATUS.BAD_REQUEST
        ),
        success: false,
      };
    }

    // Validate CSRF token format
    const csrfValidation = AnonRequestValidator.validateCsrfToken(csrfToken);
    if (!csrfValidation.isValid) {
      return {
        error: AnonErrorHandler.createErrorResponse(
          csrfValidation.error ?? "Invalid CSRF token format",
          HTTP_STATUS.BAD_REQUEST
        ),
        success: false,
      };
    }

    // Validate nonce format
    const nonceValidation = AnonRequestValidator.validateNonce(nonce);
    if (!nonceValidation.isValid) {
      return {
        error: AnonErrorHandler.createErrorResponse(
          nonceValidation.error ?? "Invalid nonce format",
          HTTP_STATUS.BAD_REQUEST
        ),
        success: false,
      };
    }

    // Get and validate country code
    const countryCode = request.headers.get("cf-ipcountry");
    const countryValidation =
      AnonRequestValidator.validateCountryCode(countryCode);
    if (!countryValidation.isValid) {
      return {
        error: AnonErrorHandler.createErrorResponse(
          countryValidation.error ?? "Country code must be a 2-letter ISO code",
          HTTP_STATUS.BAD_REQUEST
        ),
        success: false,
      };
    }

    return {
      data: {
        captchaToken,
        countryCode,
        csrfToken,
        nonce,
      },
      success: true,
    };
  },

  /**
   * Validates CSRF token format
   */
  validateCsrfToken(csrfToken: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!csrfToken || typeof csrfToken !== "string") {
      return {
        error: "CSRF token must be a non-empty string",
        isValid: false,
      };
    }

    if (csrfToken.length < 10) {
      return {
        error: "Invalid CSRF token format",
        isValid: false,
      };
    }

    return { isValid: true };
  },

  /**
   * Validates nonce format
   */
  validateNonce(nonce: string): { isValid: boolean; error?: string } {
    if (!nonce || typeof nonce !== "string") {
      return {
        error: "Nonce must be a non-empty string",
        isValid: false,
      };
    }

    if (nonce.length < 10) {
      return {
        error: "Invalid nonce format",
        isValid: false,
      };
    }

    return { isValid: true };
  },

  /**
   * Validates refresh guest session request (can be empty body)
   */
  async validateRefreshGuestSessionRequest(
    request: NextRequest
  ): Promise<
    | { success: true; data: z.infer<typeof RefreshGuestSessionRequestSchema> }
    | { success: false; error: NextResponse }
  > {
    try {
      const body = await request.json().catch(() => ({}));

      // Refresh token request can have empty body or optional refreshToken
      const validatedData = RefreshGuestSessionRequestSchema.parse(body || {});

      return {
        data: validatedData,
        success: true,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: AnonErrorHandler.handleValidationError(error),
          success: false,
        };
      }

      return {
        error: AnonErrorHandler.createErrorResponse(
          "Invalid JSON request body",
          400
        ),
        success: false,
      };
    }
  },

  /**
   * Validates token format (basic validation)
   */
  validateTokenFormat(token: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!token || typeof token !== "string") {
      return {
        error: "Token must be a non-empty string",
        isValid: false,
      };
    }

    // Check minimum length
    if (token.length < 10) {
      return {
        error: "Invalid token format",
        isValid: false,
      };
    }

    return { isValid: true };
  },
};
