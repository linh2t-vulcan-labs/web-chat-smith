import type { NextRequest } from "next/server";

import {
  checkRateLimit,
  createSecurityMiddleware,
  extractBaseSecurityContext,
  validateContentType,
} from "../../_shared/security-middleware";
import type { TAnonSecurityContext } from "../types";

const ALLOWED_METHODS = new Set(["GET", "POST"]);

const { validateRequest } = createSecurityMiddleware({
  allowedMethods: ALLOWED_METHODS,
});

/**
 * Security middleware for anon API routes.
 * Ensures only client-side requests from the same origin are allowed.
 * Built from the shared security-middleware factory (GET + POST); anon adds a
 * `timezone` field to the extracted context.
 */
export const AnonSecurityMiddleware = {
  checkRateLimit,
  extractSecurityContext(request: NextRequest): TAnonSecurityContext {
    return {
      ...extractBaseSecurityContext(request),
      timezone: request.headers.get("cf-timezone"),
    };
  },
  validateContentType,
  validateRequest,
};
