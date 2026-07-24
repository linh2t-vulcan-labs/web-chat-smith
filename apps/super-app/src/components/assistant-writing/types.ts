import type { RefObject } from "react";

import type {
  TAssistantSettingKeys,
  TAssistantWriting,
} from "@/core/models/assistant-writing";
import type { TMessageTemp } from "@/core/models/conversation";

export interface TAssistantWritingContainerProps {
  isGuestMode?: boolean;
  status: TAssistantWriting["status"];
  prompt: string;
  selectedWriting: TAssistantWriting;
  suggestions: string[];
  onStopGenerating: () => void;
  onChangePrompt: (type: TAssistantSettingKeys, value: string) => void;
  onClickSuggestion: (prompt: string) => void;
  onSubmit: (prompt: string) => void;
}

export interface TAssistantWritingPromptProps {
  submitRef: RefObject<HTMLButtonElement | null>;
  prompt: string;
  onChangePrompt: (type: TAssistantSettingKeys, value: string) => void;
}

export interface TAssistantWritingResultProps {
  status: TAssistantWriting["status"];
  prompt: string;
  answer: TMessageTemp;
  suggestions: string[];
  onStopGenerating: () => void;
  onChangePrompt: (type: TAssistantSettingKeys, value: string) => void;
  onClickSuggestion: (prompt: string) => void;
  onSubmit: (prompt: string) => void;
}
