import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  APPLE_SMITHCHAT_APP_URL,
  GOOGLE_PLAY_SMITHCHAT_APP_URL,
} from "@/utils/constants/url";

const ANDROID_USER_AGENT_PATTERN = /android/iu;

export function GET(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || "";
  let redirectUrl = APPLE_SMITHCHAT_APP_URL;

  if (ANDROID_USER_AGENT_PATTERN.test(userAgent)) {
    redirectUrl = GOOGLE_PLAY_SMITHCHAT_APP_URL;
  }

  return NextResponse.redirect(redirectUrl);
}
