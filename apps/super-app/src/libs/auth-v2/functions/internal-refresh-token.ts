import type { TResponse } from "@/core/models/http";
import { THttpError } from "@/utils/commons/error";
import { safeResponseJsonFormat } from "@/utils/commons/request";

interface TRefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
  };
  error?: string;
  message?: string;
}

export async function internalRefreshToken(): Promise<
  TResponse<{ accessToken: string }>
> {
  const response = await fetch("/api/auth-v2/refresh", {
    credentials: "include", // Include cookies for authentication
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return [
      new THttpError({
        message: "Failed to refresh token",
        status: response.status,
      }),
      null,
    ];
  }

  const result = await safeResponseJsonFormat<TRefreshTokenResponse>(response);

  if (!result) {
    return [
      new THttpError({
        message: "Failed to refresh token",
        status: response.status,
      }),
      null,
    ];
  }

  if (!result.success || !result.data?.accessToken) {
    return [
      new THttpError({
        message: result.error || "Failed to refresh token",
        status: response.status,
      }),
      null,
    ];
  }

  return [null, { accessToken: result.data.accessToken }];
}
