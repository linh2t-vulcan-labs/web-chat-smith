"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";

import { useMentionInput } from "@/components/mention-input/use-mention-input";
import { moveCaretToEnd } from "@/utils/commons/caret";
import { compositeStyles } from "@/utils/commons/styles";

export interface TMentionInputProps {
  value?: string;
  isAllowToShowMention?: boolean;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  onInputChange?: (text: string) => void;
  onKeyDown?: (ev: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface TMentionInputHandler {
  focus?: () => void;
  getDOMNode?: () => HTMLDivElement | null;
}

const MentionInputGuest = forwardRef<TMentionInputHandler, TMentionInputProps>(
  (props, ref) => {
    const {
      inputClassName,
      value,
      placeholder = "",
      disabled,
      isAllowToShowMention = false,
      onInputChange,
      onKeyDown,
    } = props;

    const {
      inputRef,
      containerInputRef,
      handleInputChange,
      handlePasteContent,
    } = useMentionInput({
      isAllowToShowMention,
      mentionOptions: [],
      onInputChange,
      onPaste: (e) => {
        e.preventDefault();
      },
    });

    useEffect(() => {
      if (inputRef.current) {
        // Only update if the content is actually different to avoid cursor issues
        const currentText = inputRef.current.textContent || "";
        if (currentText !== value) {
          inputRef.current.textContent = value ?? "";
        }
      }
    }, [value, inputRef]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();

          moveCaretToEnd(inputRef.current);
        }
      },
      getDOMNode: () => inputRef.current,
    }));

    return (
      <div
        ref={containerInputRef}
        className="relative max-h-[144px] w-full overflow-y-auto outline-transparent focus-visible:outline-hidden"
      >
        <div
          ref={inputRef}
          className={compositeStyles(
            "relative min-h-[24px] w-full bg-transparent wrap-break-word whitespace-pre-wrap outline-hidden outline-transparent",
            disabled && "pointer-events-none opacity-50",
            inputClassName
          )}
          contentEditable={!disabled}
          data-placeholder={placeholder}
          onInput={disabled ? undefined : handleInputChange}
          onKeyDown={disabled ? undefined : onKeyDown}
          onPaste={handlePasteContent}
          suppressContentEditableWarning
        />
      </div>
    );
  }
);

MentionInputGuest.displayName = "MentionInputGuest";
export default MentionInputGuest;
