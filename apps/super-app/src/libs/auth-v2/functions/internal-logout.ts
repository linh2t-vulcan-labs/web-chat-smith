import { publicEnv } from "@cs/env/server";

import type { TResponse } from "@/core/models/http";
import { THttpError } from "@/utils/commons/error";
import { isServer } from "@/utils/commons/helpers";
import { HTTP_STATUS } from "@/utils/constants/http";

export async function internalLogout(): Promise<
  TResponse<{ message: string }>
> {
  const pathname = isServer
    ? `${publicEnv.CS_PUBLIC_WEB_URL}/api/auth-v2/logout`
    : `/api/auth-v2/logout`;

  let response: Response;
  try {
    response = await fetch(pathname, {
      credentials: "include", // Include cookies for authentication
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch (error) {
    return [
      new THttpError({
        message: (error as Error)?.message ?? "Failed to logout",
        status: HTTP_STATUS.NETWORK_ERROR,
      }),
      null,
    ];
  }

  if (!response.ok) {
    return [
      new THttpError({
        message: "Failed to logout",
        status: response.status,
      }),
      null,
    ];
  }

  // The logout endpoint returns a redirect response, so we handle it accordingly
  if (response.redirected) {
    return [null, { message: "Logged out successfully" }];
  }

  return [null, { message: "Logged out successfully" }];
}
