import type { ReactNode } from "react";

export type TPositionMessage = "left" | "right";

export interface TBlockBubble {
  children: ReactNode;
}

export interface TMessageError {
  onRetry: () => void;
}

export interface TPropertiesSupported {
  radius: string;
  background: string;
}

export interface TMessageBubbleStyles {
  left: TPropertiesSupported;
  right: TPropertiesSupported;
}
