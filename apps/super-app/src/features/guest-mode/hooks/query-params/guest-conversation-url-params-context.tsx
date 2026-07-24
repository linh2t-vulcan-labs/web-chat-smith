"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { EConversationMode } from "@/core/models/conversation";
import type { AIModelItem } from "@/core/models/model";

import { useGuestConversationHandlerUrlParams } from "./use-guest-conversation-url-params";

interface TGuestConversationUrlParamsContextType {
  modelParams: string | null;
  modeParams: string | null;
  taskParams: string | null;

  handleSelectChatModel: (model: AIModelItem) => void;
  handleSignInAdvanceFeature: (mode?: string) => void;
  handleSelectUseCaseList: (options?: {
    task: string;
    callback?: () => void;
  }) => void;
  handleSelectConversationMode: (mode: EConversationMode) => void;
}

const GuestConversationUrlParamsContext = createContext<
  TGuestConversationUrlParamsContextType | undefined
>(undefined);

export function GuestConversationUrlParamsProvider({
  children,
}: Readonly<PropsWithChildren>) {
  const value = useGuestConversationHandlerUrlParams();

  return (
    <GuestConversationUrlParamsContext value={value}>
      {children}
    </GuestConversationUrlParamsContext>
  );
}

/**
 * Consumer hook to access conversation URL params.
 * Must be used within ConversationUrlParamsProvider.
 *
 * This hook replaces direct usage of useAuthConversationUrlParams to prevent
 * multiple instances and duplicate state updates.
 */
export function useGuestConversationUrlParams() {
  const context = useContext(GuestConversationUrlParamsContext);

  if (!context) {
    throw new Error(
      "useGuestConversationUrlParams must be used within ConversationUrlParamsProvider"
    );
  }

  return context;
}
