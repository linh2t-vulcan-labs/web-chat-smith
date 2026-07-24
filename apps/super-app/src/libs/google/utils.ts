import { getPublicEnv } from "@cs/env/client";

import { getMobileDetect } from "@/hooks/use-mobile-detect";

import {
  GOOGLE_CLIENT_SRC,
  GOOGLE_IDENTITY_READY_EVENT,
  GOOGLE_SCRIPT_ID,
} from "./constants";

function ensureGoogleIdentityScript() {
  if (typeof document === "undefined") {
    return;
  }

  let script = document.querySelector(
    `#${GOOGLE_SCRIPT_ID}`
  ) as HTMLScriptElement | null;

  if (!script) {
    script = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_CLIENT_SRC}"]`
    );

    if (script) {
      script.id = GOOGLE_SCRIPT_ID;
    }
  }

  if (!script) {
    script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_CLIENT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.oneTapManaged = "true";

    script.addEventListener(
      "load",
      () => {
        if (script) {
          script.dataset.loaded = "true";
        }
        document.dispatchEvent(new Event(GOOGLE_IDENTITY_READY_EVENT));
      },
      { once: true }
    );

    script.addEventListener(
      "error",
      () => {
        console.error(
          "[Google One Tap] Failed to load Google Identity Services script."
        );
      },
      { once: true }
    );

    document.head.append(script);
    return;
  }

  if (!script.dataset.oneTapManaged) {
    script.dataset.oneTapManaged = "true";

    script.addEventListener(
      "load",
      () => {
        if (script) {
          script.dataset.loaded = "true";
        }
        document.dispatchEvent(new Event(GOOGLE_IDENTITY_READY_EVENT));
      },
      { once: true }
    );

    script.addEventListener(
      "error",
      () => {
        console.error(
          "[Google One Tap] Failed to load Google Identity Services script."
        );
      },
      { once: true }
    );

    if (script.dataset.loaded === "true") {
      document.dispatchEvent(new Event(GOOGLE_IDENTITY_READY_EVENT));
    }
  }
}

export interface TGoogleCredentialResponse {
  clientId: string;
  client_id: string;
  credential: string;
  select_by: string;
}

export interface TPromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () =>
    | "browser_not_supported"
    | "invalid_client"
    | "missing_client_id"
    | "opt_out_or_no_session"
    | "secure_http_required"
    | "suppressed_by_user"
    | "unregistered_origin"
    | "unknown_reason";
  isSkippedMoment: () => boolean;
  getSkippedReason: () =>
    | "auto_cancel"
    | "user_cancel"
    | "tap_outside"
    | "issuing_failed";
  isDismissedMoment: () => boolean;
  getDismissedReason: () =>
    | "credential_returned"
    | "cancel_called"
    | "flow_restarted";
  getMomentType: () => "display" | "skipped" | "dismissed";
}

interface TGoogleSignInOneTapOptions {
  handleCredentialResponse: (response: TGoogleCredentialResponse) => void;
  onPromptMoment?: (notification: TPromptMomentNotification) => void;
  autoSelect?: boolean;
  cancelOnTapOutside?: boolean;
  context?: "signin" | "signup" | "use";
  /**
   * Use FedCM for the prompt.
   * Set to false for localhost development to avoid CORS issues.
   * @default true for production domains, false for localhost
   */
  useFedCM?: boolean;
}

/**
 * Detects if the current environment is localhost
 */
function isLocalhost(): boolean {
  if (globalThis.window === undefined) {
    return false;
  }
  const { hostname } = globalThis.window.location;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.startsWith("local.")
  );
}

export function googleSignInOneTap(options: TGoogleSignInOneTapOptions) {
  const {
    handleCredentialResponse,
    onPromptMoment,
    autoSelect = false,
    cancelOnTapOutside = false,
    context = "signin",
    useFedCM,
  } = options;

  // Early return for server-side rendering
  if (globalThis.window === undefined || !globalThis.window) {
    return;
  }

  // Skip Google One Tap on mobile devices for better UX
  const userAgent = navigator.userAgent || "";
  const { isMobile, isTablet } = getMobileDetect(userAgent);

  if (isMobile || isTablet) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[Google One Tap] Skipped on mobile device. One Tap is optimized for desktop browsers."
      );
    }
    return;
  }

  const attemptInitialize = () => {
    const { google } = globalThis.window;

    if (!google?.accounts?.id) {
      return false;
    }

    // Auto-detect: Disable FedCM on localhost by default to avoid CORS issues
    // You can explicitly set useFedCM to override this behavior
    const shouldUseFedCM = useFedCM ?? !isLocalhost();

    if (!shouldUseFedCM && process.env.NODE_ENV === "development") {
      console.info(
        "[Google One Tap] FedCM disabled for localhost. Set useFedCM: true to enable."
      );
    }

    google.accounts.id.initialize({
      auto_select: autoSelect,
      callback: handleCredentialResponse,
      cancel_on_tap_outside: cancelOnTapOutside,
      client_id: getPublicEnv().CS_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
      context,
      itp_support: true, // Safari ITP support
      use_fedcm_for_prompt: shouldUseFedCM,
    });

    google.accounts.id.prompt((notification: TPromptMomentNotification) => {
      if (onPromptMoment) {
        onPromptMoment(notification);
      }

      if (process.env.NODE_ENV === "development") {
        if (notification.isNotDisplayed()) {
          console.warn(
            "[Google One Tap] Not displayed. Reason:",
            notification.getNotDisplayedReason()
          );
        } else if (notification.isSkippedMoment()) {
          console.warn(
            "[Google One Tap] Skipped. Reason:",
            notification.getSkippedReason()
          );
        } else if (notification.isDismissedMoment()) {
          console.info(
            "[Google One Tap] Dismissed. Reason:",
            notification.getDismissedReason()
          );
        }
      }
    });

    return true;
  };

  ensureGoogleIdentityScript();

  if (attemptInitialize()) {
    return;
  }

  const handleReady = () => {
    if (!attemptInitialize()) {
      globalThis.window?.setTimeout(() => {
        attemptInitialize();
      }, 50);
    }
  };

  document.addEventListener(GOOGLE_IDENTITY_READY_EVENT, handleReady, {
    once: true,
  });
}

// /**
//  * Cancel the One Tap flow
//  */
// function cancelGoogleOneTap() {
//   globalThis.window?.google?.accounts.id.cancel();
// }

// /**
//  * Disable auto-select for One Tap
//  */
// function disableAutoSelect() {
//   globalThis.window?.google?.accounts.id.disableAutoSelect();
// }
