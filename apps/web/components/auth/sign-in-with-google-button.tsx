"use client";

import { getTokenManager } from "@cs/api-client/core/token-manager";
import { useApiAuth } from "@cs/api-client/providers/auth-provider";
import { FirebaseError } from "firebase/app";
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";

import { firebaseApp, firebaseAuth, googleAuthProvider } from "@/lib/firebase";

interface SessionExchangeResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
}

/** Exchanges a Firebase ID token for a Vulcan session via `/api/auth/session` — see that route's doc comment for the request contract. */
const exchangeFirebaseSessionForVulcan = async (
  idToken: string,
  projectId?: string
): Promise<SessionExchangeResponse> => {
  const response = await fetch("/api/auth/session", {
    body: JSON.stringify({ idToken, projectId, provider: "google" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Session exchange failed (${response.status})`);
  }
  return (await response.json()) as SessionExchangeResponse;
};

/** The user closing/blocking the popup is an expected outcome, not an error. */
const isExpectedSignInCancellation = (error: unknown): boolean =>
  error instanceof FirebaseError &&
  (error.code === "auth/popup-closed-by-user" ||
    error.code === "auth/cancelled-popup-request");

/**
 * Exchanges a Firebase Google sign-in for a Vulcan session via the existing
 * `/api/auth/session` route (already implemented server-side — see
 * app/api/auth/session/route.ts). `provider` is the bare provider key the
 * Vulcan backend expects as the `/oauth/{provider}/token` path segment
 * ("google", not Firebase's dotted `sign_in_provider` format "google.com") —
 * confirmed against `apps/super-app/src/core/repositories/user-service.ts`
 * (`verifyOAuthToken`), which calls that same backend route with
 * `EAUTH_PROVIDER.GOOGLE = "google"`. Sending "google.com" gets rejected by
 * the backend with a "requested feature is not supported by the provider"
 * error.
 *
 * `isPending` is cross-tab (see `TokenManager.setPending()`): while a
 * *different* tab has its own Google popup open, this button disables too,
 * instead of letting two concurrent sign-in attempts race the same session.
 */
export const SignInWithGoogleButton = () => {
  const { isPending, setPending } = useApiAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setPending(true);
    setError(null);
    try {
      const { user } = await signInWithPopup(
        firebaseAuth(),
        googleAuthProvider()
      );
      const idToken = await user.getIdToken();
      const { accessToken, accessTokenExpiresAt } =
        await exchangeFirebaseSessionForVulcan(
          idToken,
          firebaseApp().options.projectId
        );
      // AuthSyncProvider's onAccessTokenChange listener (wired at the app
      // root) reacts to this and calls router.refresh() so server-rendered
      // auth state picks up the new session cookie.
      getTokenManager().setSession(accessToken, accessTokenExpiresAt);
    } catch (signInError) {
      if (isExpectedSignInCancellation(signInError)) {
        return;
      }
      setError(
        signInError instanceof Error ? signInError.message : "Sign-in failed."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <button disabled={isPending} onClick={handleSignIn} type="button">
        {isPending ? "Signing in…" : "Sign in with Google"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
};
