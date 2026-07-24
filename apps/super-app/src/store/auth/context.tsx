"use client";

import { useToggle } from "@uidotdev/usehooks";
import type { FirebaseError } from "firebase/app";
import dynamic from "next/dynamic";
import type { PropsWithChildren } from "react";
import { createContext, useRef, useTransition } from "react";

import { LoadingProcessing } from "@/components/loading-icon";
import { broadcastLogin } from "@/hooks/auth/broadcast-auth-events";
import { useMutationSignIn } from "@/hooks/auth/use-mutation-sign-in";
import dayjs from "@/libs/dayjs";
// import type { FirebaseCustomData } from "@/libs/firebase/types";
import { getDurationTimeCompleteSignIn } from "@/utils/commons/date-time";
import type { EAUTH_PROVIDER } from "@/utils/commons/enums";
import { EAUTH_SOURCE } from "@/utils/commons/enums";
import {
  buildRedirectUrlWithQueryParams,
  clearAuthTime,
  localStorageImpl,
} from "@/utils/commons/helpers";
import { SIGNIN_TIME_KEY } from "@/utils/commons/keys";
import {
  CALLBACK_URL_QUERY_PARAM,
  SIGNIN_START_BUFFER_TIME,
} from "@/utils/constants/common";
import { GUEST_DESIGN_STUDIO_URL } from "@/utils/constants/url";

import type { TCreateAuthStore } from "./store";
import { createAuthStore } from "./store";

const NotMatchModal = dynamic(
  () => import("@/components/not-match-modal/not-match-modal")
);

export const AuthContext = createContext<TCreateAuthStore | null>(null);

const getCreativeStudioCallbackPath = (pathname: string) => {
  if (
    pathname !== GUEST_DESIGN_STUDIO_URL &&
    !pathname.startsWith(`${GUEST_DESIGN_STUDIO_URL}/`)
  ) {
    return;
  }

  return pathname.replace("/guest", "");
};

export function AuthProvider({ children }: Readonly<PropsWithChildren>) {
  const storeRef = useRef<TCreateAuthStore | null>(null);
  const [_isOpenLinkAccountModal, toggleIsOpenLinkAccountModal] =
    useToggle(false);
  const [isOpenMailNotMatchModal, toggleIsOpenMailNotMatchModal] =
    useToggle(false);
  // const [error, setError] = useState<FirebaseError>();

  const mutationSignIn = useMutationSignIn();
  const [isPendingSignIn, startTransitionSignIn] = useTransition();
  const isSpinning = mutationSignIn.isPending || isPendingSignIn;

  const handleTransitionSignInWithProvider = (
    provider: EAUTH_PROVIDER,
    firebaseCredentials?: string,
    signInSource?: EAUTH_SOURCE
  ): Promise<void> => {
    storeRef.current?.getState().setAuthProvider(provider);
    if (signInSource) {
      storeRef.current?.getState().setAuthSource(signInSource);
    }

    const startTime = dayjs().unix() - SIGNIN_START_BUFFER_TIME; // seconds format

    // Capture callbackUrl early, before any async operations
    // const urlParams = new URLSearchParams(globalThis.window?.location.search || "");
    // const callbackUrl = urlParams.get(CALLBACK_URL_QUERY_PARAM) || undefined;
    const currentPathname = globalThis.window?.location.pathname || "";
    const urlParams = new URLSearchParams(
      globalThis.window?.location.search || ""
    );

    const callbackUrl =
      urlParams.get(CALLBACK_URL_QUERY_PARAM) ||
      getCreativeStudioCallbackPath(currentPathname) ||
      undefined;

    startTransitionSignIn(async () => {
      await mutationSignIn
        .mutateAsync({
          callbackUrl,
          provider,
          source: signInSource || EAUTH_SOURCE.DEFAULT,
          tokenCredential: firebaseCredentials,
        })
        .then((response) => {
          const endTime = dayjs().unix(); // seconds format
          const time = getDurationTimeCompleteSignIn(endTime - startTime);
          localStorageImpl.save(SIGNIN_TIME_KEY, time);
          const store = storeRef.current;
          if (store) {
            store.setState({
              accessToken: response.accessToken,
              isAuthenticated: true,
              isNewUser: response.isNewUser,
              justSignedIn: true,
              provider,
              source: signInSource,
            });
            broadcastLogin();
          }

          // Build redirect URL with preserved query parameters (except callbackUrl)
          const redirectUrl = buildRedirectUrlWithQueryParams(response.url);
          setTimeout(() => {
            globalThis.window.location.href = redirectUrl;
          }, 200);
        })
        .catch((error: FirebaseError) => {
          if (error.code === "auth/account-exists-with-different-credential") {
            // setError(error);
            toggleIsOpenLinkAccountModal(true);
          }
          clearAuthTime();
        });
    });

    return Promise.resolve();
  };

  // Reserved for a future link-accounts feature
  // const _handleLinkWithGoogle = () => {
  //   const customData = error?.customData as unknown as
  //     | FirebaseCustomData
  //     | undefined;
  //   const tokenResponse = customData?._tokenResponse;

  //   const _input = {
  //     oauthAccessToken: tokenResponse?.oauthAccessToken,
  //     verifiedProvider: tokenResponse?.verifiedProvider,
  //     providerId: tokenResponse?.providerId,
  //   };

  //   toggleIsOpenLinkAccountModal(false);
  // };

  // oxlint-disable-next-line react/react-compiler -- lazy-init-once-via-ref pattern for the zustand auth store singleton; guarded so it only mutates on the first render
  if (!storeRef.current) {
    // oxlint-disable-next-line react/react-compiler -- part of the same one-time lazy-init as the guard above
    storeRef.current = createAuthStore({
      handleTransitionSignInWithProvider,
    });
  }

  return (
    // oxlint-disable-next-line react/react-compiler -- reading the lazily-initialized store ref to provide it via context; store is created above before first paint and is stable thereafter
    <AuthContext value={storeRef.current}>
      {isSpinning && <LoadingProcessing isSpinning={isSpinning} />}
      {children}

      {isOpenMailNotMatchModal && (
        <NotMatchModal
          isOpen={isOpenMailNotMatchModal}
          onClick={() => toggleIsOpenMailNotMatchModal(false)}
          onClose={() => toggleIsOpenMailNotMatchModal(false)}
        />
      )}
    </AuthContext>
  );
}
