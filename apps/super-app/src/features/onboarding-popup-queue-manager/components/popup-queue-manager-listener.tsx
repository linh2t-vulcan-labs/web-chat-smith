"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuthState } from "@/store/auth";
import { useGlobalState } from "@/store/global/hooks";
import { localStorageImpl } from "@/utils/commons/helpers";
import { MANAGE_ACCOUNT_URL } from "@/utils/constants/url";

import { POPUP_QUEUE_KEY } from "../constants";
import { usePopupQueueManager } from "../hooks/use-popup-queue-manager";
import { useOnboardingPopupQueueManagerStoreState } from "../store";

interface TPopupQueueManagerListenerProps {
  enabled?: boolean;
}

export default function PopupQueueManagerListener(
  props: TPopupQueueManagerListenerProps
) {
  const { enabled = true } = props;

  const isInitializedRef = useRef(false);
  const previousPathnameRef = useRef<string | null>(null);

  const pathname = usePathname();
  const justSignedIn = useAuthState((state) => state.justSignedIn);
  const isFinishFetchProfile = useGlobalState(
    (state) => state.isFinishFetchProfile
  );
  const isAnyBlockingOverlayOpen = useGlobalState(
    (state) => state.isAnyBlockingOverlayOpen
  );

  const { initializeQueue, showNextPopup, resetStore, isReadyRemoteConfig } =
    usePopupQueueManager({
      enabled,
    });
  const setOverlayBlockingState = useOnboardingPopupQueueManagerStoreState(
    (state) => state.setOverlayBlockingState
  );

  useEffect(() => {
    setOverlayBlockingState(isAnyBlockingOverlayOpen);
  }, [isAnyBlockingOverlayOpen, setOverlayBlockingState]);

  useEffect(() => {
    // Wait for user profile to be fetched before initializing queue
    // Only initialize once using ref to prevent infinite loops
    if (
      !enabled ||
      isInitializedRef.current ||
      !isFinishFetchProfile ||
      !isReadyRemoteConfig
    ) {
      return;
    }

    isInitializedRef.current = true;
    initializeQueue();
    showNextPopup();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isReadyRemoteConfig, isFinishFetchProfile]);

  useEffect(
    () => () => {
      if (isInitializedRef.current) {
        resetStore();
        localStorageImpl.remove(POPUP_QUEUE_KEY.HOME_CHAT_ANIMATION);
        isInitializedRef.current = false;
      }
    },
    [resetStore]
  );

  // Detect route changes from manage-account to trigger onboarding
  useEffect(() => {
    // Skip if not initialized or not ready
    if (
      !isInitializedRef.current ||
      !isFinishFetchProfile ||
      !isReadyRemoteConfig
    ) {
      previousPathnameRef.current = pathname;
      return;
    }

    const previousPathname = previousPathnameRef.current;
    const currentPathname = pathname;

    // Check if we navigated away from manage-account route
    const wasOnManageAccount =
      previousPathname?.startsWith(MANAGE_ACCOUNT_URL) ?? false;
    const isNotOnManageAccount =
      !currentPathname.startsWith(MANAGE_ACCOUNT_URL);

    // If user just signed in and navigated away from manage-account, trigger onboarding
    if (wasOnManageAccount && isNotOnManageAccount && justSignedIn) {
      showNextPopup();
    }

    // Update previous pathname for next comparison
    previousPathnameRef.current = currentPathname;
  }, [
    pathname,
    justSignedIn,
    isFinishFetchProfile,
    isReadyRemoteConfig,
    showNextPopup,
  ]);

  // Resume queue once blocking overlays are fully closed
  useEffect(() => {
    if (
      !isInitializedRef.current ||
      !isReadyRemoteConfig ||
      !isFinishFetchProfile
    ) {
      return;
    }

    if (isAnyBlockingOverlayOpen) {
      return;
    }

    showNextPopup();
  }, [
    isAnyBlockingOverlayOpen,
    isReadyRemoteConfig,
    isFinishFetchProfile,
    showNextPopup,
  ]);

  return null;
}
