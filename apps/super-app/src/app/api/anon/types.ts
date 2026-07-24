import { z } from "zod";

import type { TSecurityContext } from "../_shared/security-context";

// Request validation schemas
export const CreateGuestSessionRequestSchema = z.object({
  captchaToken: z.string().min(1, "Captcha token is required"),
  csrfToken: z.string().min(1, "CSRF token is required"),
  nonce: z.string().min(1, "Nonce is required"),
});

export const RefreshGuestSessionRequestSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required").optional(),
});

export interface TErrorExternalService {
  code: string;
  message: string;
  reason?: string;
  details?: { error: string }[];
}

// Response types
export interface TAnonResponse {
  data?: unknown;
  error?: string;
}

export interface TBootstrapResponse extends TAnonResponse {
  data?: {
    csrfToken: string;
    nonce: string;
  };
}

export interface TCreateGuestSessionResponse extends TAnonResponse {
  data?: {
    accessToken: string;
    anonId: string;
    deviceId: string;
    sessionId: string;
  };
}

export interface TRefreshGuestSessionResponse extends TAnonResponse {
  data?: {
    accessToken: string;
  };
}

// Error types
export interface TAnonApiError {
  code: string;
  message: string;
  statusCode: number;
}

// Security types
export interface TAnonSecurityContext extends TSecurityContext {
  timezone: string | null;
}

// Cookie configuration
export interface TAnonCookieConfig {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    maxAge?: number;
    path: string;
    sameSite: "strict" | "lax" | "none";
  };
}

// Guest session models
export interface TGuestSession {
  anonId: string;
  deviceId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
}

export interface TBootstrap {
  csrfToken: string;
  nonce: string;
}

// Type exports
export type CreateGuestSessionRequest = z.infer<
  typeof CreateGuestSessionRequestSchema
>;
export type RefreshGuestSessionRequest = z.infer<
  typeof RefreshGuestSessionRequestSchema
>;
