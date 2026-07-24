import { refreshServerSession } from "@cs/api-client/server/server-fetch";
import { NextResponse } from "next/server";

/**
 * Called by the browser TokenManager (core/token-manager.ts) — reads the
 * httpOnly refresh_token cookie server-side and mirrors the new access
 * token into its own cookie for Server Components/Actions to reuse
 * (see docs/runbook/api-client.md §4.1/§4.3).
 */
export const POST = async () => {
  const [error, accessToken] = await refreshServerSession();

  if (error) {
    return NextResponse.json(
      {
        code: error.code,
        details: error.details,
        message: error.message,
        reason: error.reason,
        status: error.status,
      },
      { status: error.httpStatus || 401 }
    );
  }

  return NextResponse.json({ accessToken });
};
