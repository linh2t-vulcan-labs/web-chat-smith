import { publicEnv } from "@cs/env/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { userServerService } from "@/core/repositories";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

import { CookieManager } from "../utils/cookie-manager";
import { getProxyHeaders } from "../utils/proxy-headers";

export async function POST(request: NextRequest) {
  const authTokenSession = await CookieManager.getAccessTokenFromEncrypted();

  if (!authTokenSession) {
    return NextResponse.redirect(
      `${publicEnv.CS_PUBLIC_WEB_URL}${LOGIN_PAGE_URL}`,
      {
        status: 303,
      }
    );
  }

  try {
    await userServerService.logout(authTokenSession, getProxyHeaders(request));
  } catch (error) {
    console.error("[logout] Failed to invalidate session server-side:", error);
  }

  await CookieManager.clearAuthCookies();

  return NextResponse.redirect(
    `${publicEnv.CS_PUBLIC_WEB_URL}${LOGIN_PAGE_URL}`,
    {
      status: 303,
    }
  );
}
