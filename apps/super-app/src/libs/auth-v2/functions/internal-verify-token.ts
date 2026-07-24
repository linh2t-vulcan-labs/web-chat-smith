import type { TResponse } from "@/core/models/http";
import type { EAUTH_PROVIDER } from "@/utils/commons/enums";
import { THttpError } from "@/utils/commons/error";
import { safeResponseJsonFormat } from "@/utils/commons/request";

interface TVerifyTokenResponse {
  success: boolean;
  data?: {
    userId: string;
    accessToken: string;
    isNewUser: boolean;
  };
  error?: string;
  message?: string;
}

export async function internalVerifyToken(
  token: string,
  provider: EAUTH_PROVIDER,
  countryCode?: string
): Promise<
  TResponse<{ userId: string; accessToken: string; isNewUser: boolean }>
> {
  const requestBody: {
    token: string;
    provider: EAUTH_PROVIDER;
    countryCode?: string;
  } = { provider, token };
  if (countryCode) {
    requestBody.countryCode = countryCode;
  }

  const response = await fetch("/api/auth-v2/verify", {
    body: JSON.stringify(requestBody),
    credentials: "include", // Include cookies for authentication
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return [
      new THttpError({
        message: "Failed to verify token",
        status: response.status,
      }),
      null,
    ];
  }

  const result = await safeResponseJsonFormat<TVerifyTokenResponse>(response);

  if (!result) {
    return [
      new THttpError({
        message: "Failed to verify token",
        status: response.status,
      }),
      null,
    ];
  }

  if (!result.success || !result.data?.userId || !result.data?.accessToken) {
    return [
      new THttpError({
        message: result.error || "Failed to verify token",
        status: response.status,
      }),
      null,
    ];
  }

  return [
    null,
    {
      accessToken: result.data.accessToken,
      isNewUser: result.data.isNewUser,
      userId: result.data.userId,
    },
  ];
}
