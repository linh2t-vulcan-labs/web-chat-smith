import {
  checkRateLimit,
  createSecurityMiddleware,
  extractBaseSecurityContext,
  validateContentType,
} from "../../_shared/security-middleware";

const ALLOWED_METHODS = new Set(["POST"]);

const { validateRequest } = createSecurityMiddleware({
  allowedMethods: ALLOWED_METHODS,
});

/**
 * Security middleware for auth-v2 API routes.
 * Ensures only client-side requests from the same origin are allowed.
 * Built from the shared security-middleware factory (POST-only).
 */
export const SecurityMiddleware = {
  checkRateLimit,
  extractSecurityContext: extractBaseSecurityContext,
  validateContentType,
  validateRequest,
};
