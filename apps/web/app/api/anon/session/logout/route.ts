import { clearGuestSessionCookie } from "@cs/api-client/server/guest/cookies";
import { NextResponse } from "next/server";

/**
 * `getGuestTokenManager()`'s `logoutEndpoint`. There is no backend guest
 * "revoke" call (unlike the authenticated flow's `logoutSession()`) — a
 * guest session is just left to expire server-side — so this only ever
 * needs to clear the local cookie. Called both by an explicit
 * `getGuestTokenManager().logout()` and by the guest→authenticated handoff
 * (`AuthSyncProvider`) so a stale guest cookie never lingers once a real
 * sign-in succeeds.
 */
export const POST = async () => {
  await clearGuestSessionCookie();
  return NextResponse.json({ ok: true });
};
