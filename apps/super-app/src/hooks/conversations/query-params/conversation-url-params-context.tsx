"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { EConversationMode } from "@/core/models/conversation";
import type { AIModelItem } from "@/core/models/model";

import type { TaskParamHandler } from "./use-auth-conversation-url-params";
import { useAuthConversationUrlParams } from "./use-auth-conversation-url-params";

interface ConversationUrlParamsContextType {
  modelParams: string | null;
  modeParams: string | null;
  taskParams: string | null;
  seenChatModels: AIModelItem[];
  seenImageModels: AIModelItem[];
  setTaskParams: (value: string | null) => void;
  registerTaskParamHandler: (handler: TaskParamHandler) => void;

  handleSelectChatModel: (model: AIModelItem) => void;
  handleSelectConversationMode: (mode: EConversationMode) => void;
  handleSelectImageModel: (model: AIModelItem) => void;
  handleSetSeenImageModels: (model: AIModelItem) => void;
}

const ConversationUrlParamsContext = createContext<
  ConversationUrlParamsContextType | undefined
>(undefined);

/**
 * Provider component that ensures useAuthConversationUrlParams hook runs only once.
 * This prevents multiple state updates when the same hook is used in multiple child components.
 *
 * Usage:
 * 1. Wrap this provider at the conversation root level
 * 2. Use the useConversationUrlParams hook in child components to access URL params
 * 3. Call registerTaskParamHandler to register a callback for task param changes from URL
 *
 * Example:
 * ```tsx
 * function MyComponent() {
 *   const { registerTaskParamHandler } = useConversationUrlParams();
 *
 *   useEffect(() => {
 *     registerTaskParamHandler((taskKey) => {
 *       // Handle task param change
 *     });
 *   }, []);
 * }
 * ```
 */
export function ConversationUrlParamsProvider({
  children,
}: Readonly<PropsWithChildren>) {
  const value = useAuthConversationUrlParams();

  return (
    <ConversationUrlParamsContext value={value}>
      {children}
    </ConversationUrlParamsContext>
  );
}

/**
 * Consumer hook to access conversation URL params.
 * Must be used within ConversationUrlParamsProvider.
 *
 * This hook replaces direct usage of useAuthConversationUrlParams to prevent
 * multiple instances and duplicate state updates.
 */
export function useConversationUrlParams() {
  const context = useContext(ConversationUrlParamsContext);

  if (context === undefined) {
    throw new Error(
      "useConversationUrlParams must be used within ConversationUrlParamsProvider"
    );
  }

  return context;
}
