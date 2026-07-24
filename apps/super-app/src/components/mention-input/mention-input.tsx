"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";

import { ContextMenu } from "@/components/context-menu";
import { useMentionInput } from "@/components/mention-input/use-mention-input";
import { moveCaretToEnd } from "@/utils/commons/caret";
import { compositeStyles } from "@/utils/commons/styles";

import type { TMentionInputHandler, TMentionInputProps } from "./types";

const MentionInput = forwardRef<TMentionInputHandler, TMentionInputProps>(
  (props, ref) => {
    const {
      mentionOptions,
      inputClassName,
      isAllowToShowMention = true,
      value,
      placeholder = "Input",
      disabled,
      onSelectMention,
      onInputChange,
      onKeyDown,
      onPaste,
    } = props;

    const {
      inputRef,
      containerInputRef,
      selectedOption,
      popupPosition,
      isOpenContextMenu,
      handleCloseContextmenu,
      handleInputChange,
      handleKeydown,
      handleSelectMention,
      handlePasteContent,
    } = useMentionInput({
      isAllowToShowMention,
      mentionOptions,
      onInputChange,
      onKeyDown,
      onMentionSelect: onSelectMention,
      onPaste,
    });

    useEffect(() => {
      if (inputRef.current) {
        // Only update if the content is actually different to avoid cursor issues
        const currentText = inputRef.current.textContent || "";

        if (currentText !== value) {
          inputRef.current.textContent = value;
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
      <ContextMenu
        open={isOpenContextMenu}
        items={mentionOptions}
        position={popupPosition}
        selectedOption={selectedOption}
        onSelect={handleSelectMention}
        onClose={handleCloseContextmenu}
      >
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
            onPaste={disabled ? undefined : handlePasteContent}
            onKeyDown={disabled ? undefined : handleKeydown}
            suppressContentEditableWarning={true}
          />
        </div>
      </ContextMenu>
    );
  }
);

MentionInput.displayName = "MentionInput";
export default MentionInput;
