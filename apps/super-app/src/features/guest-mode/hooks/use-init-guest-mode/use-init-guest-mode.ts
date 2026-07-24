import { safeResponseJsonFormat } from "@/utils/commons/request";

import type { BootstrapModel, GuestSessionModel } from "../../models";
import type { TCreateGuestSessionPayload } from "../../types";

const checkCaptchaVerification = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/anon/session/verify", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    if (!response.ok) {
      return false;
    }

    const result = await safeResponseJsonFormat<{
      data: { isVerified: boolean };
    }>(response);

    return result?.data?.isVerified || false;
  } catch {
    // console.error("[useInitGuestMode] Failed to check captcha verification:", error);
    return false;
  }
};

const bootstrapSession = async (): Promise<BootstrapModel | undefined> => {
  const response = await fetch("/api/anon/session/bootstrap", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  });

  if (!response.ok) {
    return undefined;
  }

  const bootstrap = await safeResponseJsonFormat<{ data: BootstrapModel }>(
    response
  );

  return bootstrap?.data;
};

const createGuestSession = async (
  payload: TCreateGuestSessionPayload,
  retryCount = 1
): Promise<GuestSessionModel | undefined> => {
  const response = await fetch("/api/anon/session", {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorDetail = await safeResponseJsonFormat<{
      error: string;
      message: string;
    }>(response);

    if (!errorDetail) {
      return undefined;
    }

    const isCsrfError = errorDetail.error.toLocaleLowerCase().includes("csrf");

    // Retry if it's a CSRF error and we still have retries left
    if (isCsrfError && retryCount > 0) {
      // Add a small delay before retrying to ensure cookie is set
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      return createGuestSession(payload, retryCount - 1);
    }

    return undefined;
  }

  const guestResponse = await safeResponseJsonFormat<{
    data: GuestSessionModel;
  }>(response);

  return guestResponse?.data;
};

export const useInitGuestMode = () => ({
  bootstrapSession,
  checkCaptchaVerification,
  createGuestSession,
});
