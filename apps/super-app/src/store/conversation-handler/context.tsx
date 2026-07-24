"use client";

import { createContext } from "react";

import type {
  TConversationHandlerContext,
  TConversationHandlerProviderProps,
} from "@/store/conversation-handler/types";

export const ConversationHandlerContext = createContext<
  TConversationHandlerContext | undefined
>(undefined);

export function ConversationHandlerProvider({
  children,
  value,
}: Readonly<TConversationHandlerProviderProps>) {
  return (
    <ConversationHandlerContext value={value}>
      {children}
    </ConversationHandlerContext>
  );
}
