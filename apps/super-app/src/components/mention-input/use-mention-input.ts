import { useCallback, useRef, useState } from "react";

import type { TContextMenuItem } from "@/components/context-menu/types";
import { useHandleClickOutside } from "@/hooks/ui/use-handle-click-outside";
import { getCaretCoordinates, getTextBeforeCaret } from "@/utils/commons/caret";

interface TUseMentionInputProps {
  mentionOptions: TContextMenuItem[];
  isAllowToShowMention: boolean;
  onMentionSelect?: (item: TContextMenuItem) => void;
  onKeyDown?: (ev: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste?: (ev: React.ClipboardEvent<HTMLDivElement>) => void;
  onInputChange?: (text: string) => void;
}

const MENTION_TRIGGER_REGEX = /(?:^|\s)(?<trigger>@)$/u;

const shouldShowMentionInput = (text: string) =>
  MENTION_TRIGGER_REGEX.exec(text);

export const useMentionInput = (options: TUseMentionInputProps) => {
  const {
    isAllowToShowMention,
    mentionOptions,
    onMentionSelect,
    onKeyDown,
    onPaste,
    onInputChange,
  } = options;
  const [isOpenContextMenu, setIsOpenContextMenu] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ bottom: 0, left: 0 });
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);
  const containerInputRef = useRef<HTMLDivElement | null>(null);

  const savedRangeRef = useRef<Range | null>(null);

  // Call this in onKeyDown / onKeyUp / onInput when mention menu is active
  const saveCaretPosition = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  const handleCloseContextmenu = () => {
    setSelectedOptionIndex(-1);
    setIsOpenContextMenu(false);
  };

  const { wrapperRef: inputRef } = useHandleClickOutside<HTMLDivElement>(
    handleCloseContextmenu
  );

  const handleInputChange = () => {
    if (!inputRef.current) {
      return;
    }
    const element = inputRef.current;

    // DOM mutation happens here (e.g., input sanitization, formatting, etc.)
    const isVisuallyEmpty = element.innerHTML === "<br>";
    if (isVisuallyEmpty) {
      element.textContent = "";
    }

    const value = element.textContent;
    onInputChange?.(value);

    const textBeforeCaret = getTextBeforeCaret(element);

    if (!shouldShowMentionInput(textBeforeCaret)) {
      setIsOpenContextMenu(false);
      return;
    }

    const caretRect = getCaretCoordinates();
    const containerInputRect =
      containerInputRef.current?.getBoundingClientRect();

    if (!caretRect || !containerInputRect) {
      return;
    }

    const leftPosition = caretRect.left - containerInputRect.left;
    const bottomPosition = -(containerInputRect.height - caretRect.height);
    setPopupPosition({ bottom: bottomPosition, left: leftPosition });
    if (isAllowToShowMention) {
      saveCaretPosition();
      setIsOpenContextMenu(true);
    }
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (containerInputRef.current) {
        containerInputRef.current.scrollTop =
          containerInputRef.current.scrollHeight;
      }
    });
  };

  const handlePasteContent = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const { clipboardData } = e;
    if (!clipboardData) {
      return;
    }

    const { items } = clipboardData;
    let handled = false;

    onPaste?.(e);
    for (const item of items) {
      if (item.kind === "string" && item.type === "text/plain") {
        handled = true;
        e.preventDefault();

        // Read plain text
        item.getAsString((text) => {
          const target = e.target as HTMLElement;

          if (
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLInputElement
          ) {
            const start = target.selectionStart || 0;
            const end = target.selectionEnd || 0;
            const { value } = target;

            // Insert plain text
            target.value = value.slice(0, start) + text + value.slice(end);
            target.selectionEnd = start + text.length;
            target.selectionStart = target.selectionEnd;
          } else if (target.isContentEditable) {
            // Insert plain text in contenteditable
            document.execCommand("insertText", false, text);
          } else {
            console.warn("Unhandled paste target:", target);
          }
          scrollToBottom();
        });
      }
    }

    // Prevent default paste behavior if we handled text or file
    if (handled) {
      e.preventDefault();
    }
  };

  const handleKeydown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    const { key } = ev;
    if (!isOpenContextMenu) {
      onKeyDown?.(ev);
      return;
    }

    switch (key) {
      case "ArrowUp": {
        ev.preventDefault();
        setSelectedOptionIndex((prev) =>
          prev === -1
            ? mentionOptions.length - 1
            : (prev - 1 + mentionOptions.length) % mentionOptions.length
        );
        return;
      }
      case "ArrowDown": {
        ev.preventDefault();
        setSelectedOptionIndex((prev) =>
          prev === -1 ? 0 : (prev + 1) % mentionOptions.length
        );
        return;
      }
      case "Tab":
      case "Enter": {
        ev.preventDefault();
        const selected = mentionOptions[selectedOptionIndex];
        if (!selected) {
          return;
        }
        handleSelectMention?.(selected);
        handleCloseContextmenu();
        return;
      }
      case "Escape": {
        ev.preventDefault();
        handleCloseContextmenu();
        break;
      }
      default: {
        break;
      }
    }
  };

  const handleSelectMention = (item: TContextMenuItem) => {
    onMentionSelect?.(item);

    const savedRange = savedRangeRef.current;

    if (!savedRange) {
      return;
    }

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedRange);

    const container = savedRange.startContainer;
    const cursorPos = savedRange.startOffset;

    if (container.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const textNode = container as Text;
    const text = textNode.textContent || "";

    const mentionStart = text.lastIndexOf("@", cursorPos - 1);
    if (mentionStart === -1) {
      return;
    }

    const newText = text.slice(0, mentionStart) + text.slice(cursorPos);
    textNode.textContent = newText;

    // Move caret after inserted mention
    const newRange = document.createRange();
    newRange.setStart(textNode, mentionStart);
    newRange.collapse(true);

    selection?.removeAllRanges();
    selection?.addRange(newRange);
    handleInputChange();
  };

  return {
    containerInputRef,
    handleCloseContextmenu,
    handleInputChange,
    handleKeydown,
    handlePasteContent,
    handleSelectMention,
    inputRef,
    isOpenContextMenu,
    popupPosition,
    selectedOption: mentionOptions[selectedOptionIndex],
  };
};
