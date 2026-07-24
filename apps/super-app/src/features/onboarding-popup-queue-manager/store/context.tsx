"use client";

import type { PropsWithChildren } from "react";
import { createContext, useRef } from "react";

import type { TCreateOnboardingPopupQueueStore } from "./store";
import { createOnboardingPopupQueueStore } from "./store";

export const OnboardingPopupQueueManagerContext =
  createContext<TCreateOnboardingPopupQueueStore | null>(null);

export function OnboardingPopupQueueManagerProvider({
  children,
}: Readonly<PropsWithChildren>) {
  const storeRef = useRef<TCreateOnboardingPopupQueueStore | null>(null);

  // oxlint-disable-next-line react/react-compiler -- lazy-init-once-via-ref pattern for the zustand store singleton; guarded so it only mutates on the first render
  if (!storeRef.current) {
    storeRef.current = createOnboardingPopupQueueStore();
  }

  return (
    // oxlint-disable-next-line react/react-compiler -- reading the lazily-initialized store ref to provide it via context; store is created above before first paint and is stable thereafter
    <OnboardingPopupQueueManagerContext value={storeRef.current}>
      {children}
    </OnboardingPopupQueueManagerContext>
  );
}
