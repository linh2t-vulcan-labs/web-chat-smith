"use client";

import { getTokenManager } from "@cs/api-client/core/token-manager";
import { FirebaseError } from "firebase/app";
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";

import { firebaseApp, firebaseAuth, googleAuthProvider } from "@/lib/firebase";

interface SessionExchangeResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
}

/**
 * Exchanges a Firebase Google sign-in for a Vulcan session via the existing
 * `/api/auth/session` route (already implemented server-side — see
 * app/api/auth/session/route.ts). `provider` must be Firebase's dotted
 * `sign_in_provider` format ("google.com"), not `@cs/firebase/auth`'s bare
 * `AuthProviderKind` ("google") — the route decodes the token expecting the
 * former.
 */
export const SignInWithGoogleButton = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const { user } = await signInWithPopup(
        firebaseAuth(),
        googleAuthProvider()
      );
      const idToken = await user.getIdToken();
      const response = await fetch("/api/auth/session", {
        body: JSON.stringify({
          idToken,
          projectId: firebaseApp().options.projectId,
          provider: "google.com",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Session exchange failed (${response.status})`);
      }
      const { accessToken, accessTokenExpiresAt } =
        (await response.json()) as SessionExchangeResponse;
      getTokenManager().setSession(accessToken, accessTokenExpiresAt);
    } catch (signInError) {
      // Popup closed/blocked by the user is an expected outcome, not an error.
      if (
        signInError instanceof FirebaseError &&
        (signInError.code === "auth/popup-closed-by-user" ||
          signInError.code === "auth/cancelled-popup-request")
      ) {
        return;
      }
      setError(
        signInError instanceof Error ? signInError.message : "Sign-in failed."
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div>
      <button disabled={isSigningIn} onClick={handleSignIn} type="button">
        {isSigningIn ? "Signing in…" : "Sign in with Google"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
};
