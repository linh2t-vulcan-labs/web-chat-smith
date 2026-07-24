"use client";

import type { PropsWithChildren } from "react";
import { createContext, useRef } from "react";

import type { TCreateConversationStore } from "./store";
import { createConversationStore } from "./store";

export const ConversationContext =
  createContext<TCreateConversationStore | null>(null);

export function ConversationStateProvider({
  children,
}: Readonly<PropsWithChildren>) {
  const storeRef = useRef<TCreateConversationStore | null>(null);

  // oxlint-disable-next-line react/react-compiler -- lazy-init-once-via-ref pattern for the zustand store singleton; guarded so it only mutates on the first render
  if (!storeRef.current) {
    storeRef.current = createConversationStore();
  }

  return (
    // oxlint-disable-next-line react/react-compiler -- reading the lazily-initialized store ref to provide it via context; store is created above before first paint and is stable thereafter
    <ConversationContext value={storeRef.current}>
      {children}
    </ConversationContext>
  );
}
