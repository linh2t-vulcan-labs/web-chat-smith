import { z } from "zod";

// Request validation schemas
export const VerifyTokenRequestSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  token: z.string().min(1, "Token is required"),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required").optional(),
});

// Response types
export interface TAuthResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export interface TVerifyTokenResponse extends TAuthResponse {
  data?: {
    userId: string;
    accessToken: string;
    isNewUser: boolean;
  };
}

export interface TRefreshTokenResponse extends TAuthResponse {
  data?: {
    accessToken: string;
  };
}

// Error types
export interface TApiError {
  code: string;
  message: string;
  statusCode: number;
}

// Security types
export type { TSecurityContext } from "../_shared/security-context";

// Cookie configuration
export interface TCookieConfig {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    maxAge: number;
    path: string;
    sameSite: "strict" | "lax" | "none";
  };
}

// Type exports
export type VerifyTokenRequest = z.infer<typeof VerifyTokenRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
