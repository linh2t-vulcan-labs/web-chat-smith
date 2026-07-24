"use client";

import type { PropsWithChildren } from "react";
import { createContext, useRef } from "react";

import type { TCreateSuiteConversationStore } from "./store";
import { createSuiteConversationStore } from "./store";

export const SuiteConversationContext =
  createContext<TCreateSuiteConversationStore | null>(null);

export function SuiteConversationProvider({
  children,
}: Readonly<PropsWithChildren>) {
  const storeRef = useRef<TCreateSuiteConversationStore | null>(null);

  // oxlint-disable-next-line react/react-compiler -- lazy-init-once-via-ref pattern for the zustand store singleton; guarded so it only mutates on the first render
  if (!storeRef.current) {
    storeRef.current = createSuiteConversationStore();
  }

  return (
    // oxlint-disable-next-line react/react-compiler -- reading the lazily-initialized store ref to provide it via context; store is created above before first paint and is stable thereafter
    <SuiteConversationContext value={storeRef.current}>
      {children}
    </SuiteConversationContext>
  );
}
