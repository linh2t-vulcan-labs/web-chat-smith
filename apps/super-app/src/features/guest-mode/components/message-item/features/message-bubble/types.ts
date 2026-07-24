import type { ReactNode } from "react";

import type { TMessageTemp, TSelectedFile } from "@/core/models/conversation";

export type TPositionMessage = "left" | "right";

export interface TBlockBubble {
  children: ReactNode;
}

export interface TMessageBubble {
  isShowRegenerateBtn: boolean;
  conversationId?: string;
  position: TPositionMessage;
  files?: TSelectedFile[];
  loading?: boolean;
  message: TMessageTemp;
  isGenerating?: boolean;
  isNewMessage?: boolean;
}

export interface TPropertiesSupported {
  radius: string;
  background: string;
  padding: string;
}

export interface TMessageBubbleStyles {
  left: TPropertiesSupported;
  right: TPropertiesSupported;
}

export interface TMessageActionsProps {
  conversationId: string;
  message: TMessageTemp;
}
