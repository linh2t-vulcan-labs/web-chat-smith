"use client";

import { getGuestTokenManager } from "@cs/api-client/core/token-manager";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const noSubscription = () => () => {
  // no-op
};
const getIsMounted = () => true;
const getServerIsMounted = () => false;

/**
 * `document` doesn't exist during SSR, and the client's first render must
 * match the server's to avoid a hydration mismatch — `useSyncExternalStore`
 * reports `false` for both the server snapshot and the initial client
 * render, then `true` right after, without the extra
 * `useEffect(() => setIsMounted(true), [])` render that flashes stale
 * content (https://react.dev/reference/react/useSyncExternalStore).
 */
const useIsMounted = () =>
  useSyncExternalStore(noSubscription, getIsMounted, getServerIsMounted);

/**
 * A failure here (network error, or a create-session rejection unrelated to
 * the captcha's own validity — e.g. a misconfigured backend dependency) is
 * otherwise indistinguishable from "the challenge needs solving again," and
 * `.reset()` on an invisible/managed widget re-executes near-instantly — a
 * persistent failure would retry in a tight loop with no backoff. Confirmed
 * live: a missing-nonce bug on the server side alone produced dozens of
 * retries within milliseconds before this cap was added.
 */
const MAX_CAPTCHA_ATTEMPTS = 3;

interface CreateGuestSessionResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
}

/**
 * The invisible Turnstile challenge that provisions a guest session (see
 * `GuestSessionProvider`'s doc comment): solves the challenge, exchanges the
 * resulting token for a session via `POST /api/anon/session`, and injects it
 * into `getGuestTokenManager()` via `setSession()` on success. Rendered via a
 * portal directly onto `document.body` regardless of where this component
 * sits in the tree.
 *
 * Fully self-contained on purpose — `GuestSessionProvider` only ever hears
 * about the outcome through its existing `getGuestTokenManager().addListener`
 * subscription (a session appearing) or `onGiveUp` (persistent failure), and
 * never touches the Turnstile instance or the attempt counter: both a failed
 * challenge (`onError`/`onExpire`) and a failed session-creation request need
 * to share the same retry budget, and keeping them in the same component is
 * what lets that budget live in a single `useRef` instead of being threaded
 * across a provider boundary. `attemptsRef` resets for free on every mount:
 * this component only exists in the tree while a fresh challenge is needed
 * (the caller unmounts it once a session appears or `onGiveUp` fires), so a
 * new mount is always a new challenge starting from zero.
 */
export const GuestCaptchaWidget = ({
  onGiveUp,
  siteKey,
}: {
  onGiveUp: () => void;
  siteKey: string;
}) => {
  const isMounted = useIsMounted();
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const attemptsRef = useRef(0);

  const retryOrGiveUp = () => {
    attemptsRef.current += 1;
    if (attemptsRef.current < MAX_CAPTCHA_ATTEMPTS) {
      turnstileRef.current?.reset();
      return;
    }
    onGiveUp();
  };

  const handleCaptchaSuccess = async (captchaToken: string) => {
    try {
      const response = await fetch("/api/anon/session", {
        body: JSON.stringify({ captchaToken }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        retryOrGiveUp();
        return;
      }

      const data = (await response.json()) as CreateGuestSessionResponse;
      // Triggers `GuestSessionProvider`'s `addListener` callback, which
      // flips `needsCaptcha` off and unmounts this widget — no separate
      // signal needed here.
      getGuestTokenManager().setSession(
        data.accessToken,
        data.accessTokenExpiresAt
      );
    } catch {
      retryOrGiveUp();
    }
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <Turnstile
      onError={retryOrGiveUp}
      onExpire={retryOrGiveUp}
      onSuccess={handleCaptchaSuccess}
      options={{ size: "invisible" }}
      ref={turnstileRef}
      siteKey={siteKey}
    />,
    document.body
  );
};
