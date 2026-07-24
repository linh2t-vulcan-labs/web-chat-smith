import { logoutSession } from "@cs/api-client/server/server-fetch";
import { NextResponse } from "next/server";

/** Called by TokenManager.logout() (core/token-manager.ts) — best-effort backend revoke + always clears cookies. */
export const POST = async () => {
  await logoutSession();
  return NextResponse.json({ ok: true });
};
