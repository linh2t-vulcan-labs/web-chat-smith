import type { MutableRefObject } from "react";

import type {
  EConversationMode,
  TMessageTemp,
  TRole,
  TStatusConversation,
} from "@/core/models/conversation";

export type TMessageMap = Record<
  TRole,
  {
    content: string;
    position: "left" | "right";
  }
>;

interface TConversationState {
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  isFetchMessageError: boolean;
  isFetchedMessages: boolean;
  conversationMode: EConversationMode;
  status: TStatusConversation;
  hasNextPage: boolean;
}

interface TConversationRefs {
  lastItemRef: MutableRefObject<HTMLDivElement | null>;
  lastMessageRef: MutableRefObject<HTMLDivElement | null>;
}
interface TConversationData {
  messages?: TMessageTemp[];
  suggestions?: string[];
}

interface TConversationHandler {
  onFetchNextPage?: () => void;
  onRefetchMessages?: () => void;
  onClickSuggestion: (message: string) => void;
  onRegenerateMessage: () => Promise<void>;
  setScrollContainerZone: React.Dispatch<HTMLDivElement | null>;
}

export interface TConversationProps {
  states: TConversationState;
  data: TConversationData;
  refs: TConversationRefs;
  handlers: TConversationHandler;
}

export interface TMessageItemProps {
  className?: string;
  status: TStatusConversation;
  isLastMessage?: boolean;
  data: TMessageTemp;
  onRegenerateMessage?: () => Promise<void>;
}
