import type { TContextMenuItem } from "@/components/context-menu/types";

export interface TMentionInputProps {
  mentionOptions: TContextMenuItem[];
  value: string;
  isAllowToShowMention?: boolean;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  onSelectMention: (item: TContextMenuItem) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  onInputChange?: (text: string) => void;
  onKeyDown?: (ev: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface TMentionInputHandler {
  focus?: () => void;
  getDOMNode?: () => HTMLDivElement | null;
}
