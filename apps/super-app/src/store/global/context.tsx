"use client";

import type { PropsWithChildren } from "react";
import { createContext, useEffect, useRef } from "react";

import { useCopySanitizedHtml } from "@/hooks/use-copy-plaint-text";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";

import { useAuthState } from "../auth";
import {
  useFinishInitialized,
  useInitCustomResponse,
  useInitFreeUsage,
  useInitModels,
  useInitProducts,
  useInitSession,
  useInitUserProfile,
  useInitUserSubscriptions,
} from "./initialization-hooks";
import { useInitFreeUsageReset } from "./initialization-hooks/use-init-free-usage-reset";
import { useInitUserTrialUsages } from "./initialization-hooks/use-init-user-trial-usages";
import type { TCreateGlobalStore } from "./store";
import { createGlobalStore } from "./store";

export const GlobalContext = createContext<TCreateGlobalStore | null>(null);

export function GlobalStateProvider({ children }: Readonly<PropsWithChildren>) {
  const updateUserInfo = useAuthState((state) => state.updateUserInfo);
  const storeRef = useRef<TCreateGlobalStore | null>(null);
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();

  const dsVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_UI_VERSION
  );

  const isAuthenticated = useAuthState((state) => state.isAuthenticated);

  // Initialize store
  // oxlint-disable-next-line react/react-compiler -- lazy-init-once-via-ref pattern for the zustand store singleton; guarded so it only mutates on the first render
  if (!storeRef.current) {
    storeRef.current = createGlobalStore({
      updateUserInfo,
    });
  }

  // Initialize session
  useInitSession();

  // Initialize products and models
  useInitProducts(storeRef);
  useInitModels(storeRef);

  // Initialize custom responses
  useInitCustomResponse(storeRef, isAuthenticated);

  // Initialize user profile and subscriptions
  const userProfileResponse = useInitUserProfile(storeRef, isAuthenticated);
  const subscriptionResponse = useInitUserSubscriptions(
    storeRef,
    isAuthenticated
  );
  const hasSubscription = Boolean(
    subscriptionResponse?.[1] && subscriptionResponse?.[1]?.items?.length > 0
  );
  const trialUsagesResponse = useInitUserTrialUsages(
    storeRef,
    isAuthenticated && hasSubscription
  );

  // Initialize free usage tracking
  const freeUsageResponse = useInitFreeUsage(
    storeRef,
    isAuthenticated,
    subscriptionResponse?.[1]
  );
  // Initialize free usage reset if it is a new user and free user usage is enabled
  const freeUsageResetResponse = useInitFreeUsageReset(
    storeRef,
    isAuthenticated,
    userProfileResponse?.[1],
    subscriptionResponse?.[1],
    freeUsageResponse?.[1]
  );

  useEffect(() => {
    if (!storeRef.current || !isReady) {
      return;
    }
    storeRef.current.getState().setDsVersion(dsVersion);
  }, [dsVersion, isReady]);

  // Initialize global store with all data - only finishes when ALL data is loaded
  useFinishInitialized(
    storeRef,
    isAuthenticated,
    subscriptionResponse?.[1],
    userProfileResponse?.[1],
    freeUsageResponse?.[1],
    freeUsageResetResponse,
    trialUsagesResponse?.[1]
  );
  // Activate global copy sanitization on every page
  useCopySanitizedHtml();

  // oxlint-disable-next-line react/react-compiler -- reading the lazily-initialized store ref to provide it via context; store is created above before first paint and is stable thereafter
  return <GlobalContext value={storeRef.current}>{children}</GlobalContext>;
}
