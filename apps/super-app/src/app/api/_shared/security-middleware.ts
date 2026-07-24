import { publicEnv } from "@cs/env/server";
import type { NextRequest } from "next/server";

import type { TSecurityContext } from "./security-context";

/**
 * Shared origin/method/rate-limit security primitives for the anon + auth-v2 API
 * route groups. The two groups previously shipped byte-identical middleware that
 * differed only by the allowed HTTP methods and (anon-only) a `timezone` field in
 * the extracted context. This is the single source; each group builds its own
 * middleware from it and keeps its original public method names, so no call-site
 * changes. Origin logic, content-type + rate-limit checks are unchanged.
 */

const ALLOWED_ORIGINS = [publicEnv.CS_PUBLIC_WEB_URL].filter(Boolean);

/**
 * Checks if the given URL is from an allowed origin
 */
function isAllowedOrigin(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const origin = `${urlObj.protocol}//${urlObj.host}`;

    // Local dev: any app may run on its own localhost port (super-app :3000,
    // web :3003, …) while sharing one env file. Accept localhost outside prod
    // so the app's own browser origin passes regardless of WEB_URL's value.
    if (
      publicEnv.CS_PUBLIC_ENV_NAME !== "production" &&
      (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1")
    ) {
      return true;
    }

    return ALLOWED_ORIGINS.some((allowedOrigin) => {
      if (allowedOrigin === origin) {
        return true;
      }

      // Allow subdomains of the main domain in production
      if (
        publicEnv.CS_PUBLIC_ENV_NAME === "production" &&
        allowedOrigin?.includes("://")
      ) {
        const allowedHost = new URL(allowedOrigin).host;
        return (
          urlObj.host === allowedHost || urlObj.host.endsWith(`.${allowedHost}`)
        );
      }

      return false;
    });
  } catch {
    return false;
  }
}

/**
 * Validates Content-Type header for JSON requests
 */
export const validateContentType = (
  request: NextRequest
): {
  isValid: boolean;
  error?: string;
} => {
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {
      error: "Invalid Content-Type",
      isValid: false,
    };
  }

  return { isValid: true };
};

/**
 * Rate limiting check (basic implementation)
 * In production, consider using Redis or a dedicated rate limiting service
 */
export const checkRateLimit = (
  request: NextRequest,
  _identifier: string
): Promise<{ isValid: boolean; error?: string; retryAfter?: number }> => {
  // Basic rate limiting implementation
  // In production, implement proper rate limiting with Redis
  const userAgent = request.headers.get("user-agent");

  // Simple check: prevent obvious abuse patterns
  if (userAgent?.includes("bot") || userAgent?.includes("crawler")) {
    return Promise.resolve({
      error: "Automated requests not allowed",
      isValid: false,
    });
  }

  // Additional checks can be added here
  return Promise.resolve({ isValid: true });
};

/**
 * Extracts the base security context (origin/userAgent/ip/countryCode) from the
 * request. Groups that need extra fields (anon adds `timezone`) wrap this.
 */
export const extractBaseSecurityContext = (
  request: NextRequest
): TSecurityContext => ({
  countryCode: request.headers.get("cf-ipcountry"),
  ip:
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown",
  origin: request.headers.get("origin"),
  userAgent: request.headers.get("user-agent"),
});

export interface CreateSecurityMiddlewareOptions {
  allowedMethods: Set<string>;
}

export function createSecurityMiddleware({
  allowedMethods,
}: CreateSecurityMiddlewareOptions) {
  const validateRequest = (
    request: NextRequest
  ): {
    isValid: boolean;
    error?: string;
  } => {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const { method } = request;

    // Check HTTP method
    if (!allowedMethods.has(method)) {
      return {
        error: `Method ${method} not allowed`,
        isValid: false,
      };
    }

    // Check origin (primary security check)
    if (origin && !isAllowedOrigin(origin)) {
      return {
        error: "Request origin not allowed",
        isValid: false,
      };
    }

    // Fallback to referer check if origin is not available
    if (!origin && referer && !isAllowedOrigin(referer)) {
      return {
        error: "Request referer not allowed",
        isValid: false,
      };
    }

    // Block requests without proper origin/referer headers
    if (!origin && !referer) {
      return {
        error: "Missing origin or referer header",
        isValid: false,
      };
    }

    return { isValid: true };
  };

  return { validateRequest };
}
