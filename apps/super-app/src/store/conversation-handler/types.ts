import type { PropsWithChildren } from "react";

export interface TConversationHandlerContext {
  handleRegenerate: () => Promise<void>;
  handleRetrySend: () => Promise<void>;
}

export type TConversationHandlerProviderProps = PropsWithChildren<{
  value: TConversationHandlerContext;
}>;
