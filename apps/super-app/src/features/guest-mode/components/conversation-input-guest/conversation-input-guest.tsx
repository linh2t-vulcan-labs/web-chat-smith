"use client";

import { useTranslations } from "next-intl";
import React, { memo, useMemo, useRef, useState } from "react";

import ButtonSubmit from "@/components/conversation-input/button-submit";
import CharacterCount from "@/components/conversation-input/character-count";
import WrapperInputForm from "@/components/input-v2/wrapper-input";
import { DEFAULT_AI_MODEL } from "@/config/default-model";
import { ModelCharacterCountCfg } from "@/config/sending-form";
import { isNotEmptyInput } from "@/utils/commons/string";
import { compositeStyles } from "@/utils/commons/styles";
import { KEY_CODES, KEYBOARD_KEYS } from "@/utils/constants/common";
import { MESSAGE_THRESHOLD } from "@/utils/constants/conversation";

import { useGuestState } from "../../stores/guest-mode/hooks";
import { MentionInputGuest } from "../mention-input-guest";
import type { TMentionInputHandler } from "../mention-input-guest/types";
import FeatureToolsGuest from "./features/feature-tools-guest";
import { SelectionModelAIChip } from "./selection-model-ai-chip";
import type {
  TCharacterCountStatus,
  TConversationInputGuestProps,
} from "./types";

const ConversationInputGuest = memo((props: TConversationInputGuestProps) => {
  const { onSubmit } = props;
  const [countStatus, setCountStatus] =
    useState<TCharacterCountStatus>("success");
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const setGuestUserInput = useGuestState((state) => state.setGuestUserInput);
  const isFetching = useGuestState((state) => state.isFetching);
  const userInput = useGuestState((state) => state.guestUserInput);
  const conversationState = useGuestState((state) => state.conversationState);

  const conversationT = useTranslations("conversationPage");

  const isDisabledInputBasedOnMessageStatus = false;

  const handleChangeInput = (text: string) => {
    setGuestUserInput(text);
  };
  const mentionInputRef = useRef<TMentionInputHandler>(null);

  const { isShowCharacterCount, totalCharacter } = useMemo(() => {
    const totalCharacter = ModelCharacterCountCfg[DEFAULT_AI_MODEL];
    const MESSAGE_CHARACTER_LIMIT = totalCharacter * MESSAGE_THRESHOLD;
    const isShowCharacterCount = userInput.length > MESSAGE_CHARACTER_LIMIT;
    return { isShowCharacterCount, totalCharacter };
  }, [userInput]);

  const isSubmitted = useMemo(() => {
    if (!isNotEmptyInput(userInput)) {
      return false;
    }

    if (!countStatus || countStatus === "error") {
      return false;
    }

    return true;
  }, [userInput, countStatus]);

  const isDisabledSubmitButton =
    !isSubmitted ||
    conversationState.status === "reachedLimit" ||
    conversationState.status === "error";

  const handleChangeStatus = (status: TCharacterCountStatus) => {
    setCountStatus(status);
  };

  const handleEnterPress = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.keyCode === KEY_CODES.IME_PROCESSING) {
      return;
    }

    if (ev.key === KEYBOARD_KEYS.Enter && !ev.shiftKey) {
      ev.preventDefault();
      submitButtonRef.current?.click();
    }
  };

  return (
    <WrapperInputForm
      className={compositeStyles(
        "thickness-medium border-v1-neutral-dark-100 dark:bg-surface-general-soft dark:hover:bg-surface-general-soft! focus:bg-surface-general-soft! flex flex-col overflow-hidden bg-white/70 p-0! backdrop-blur-[80px] dark:border-transparent",
        {
          "opacity-80": isDisabledInputBasedOnMessageStatus,
        }
      )}
    >
      <div
        className={compositeStyles(
          "gap-small-1 p-medium-2 flex",
          isDisabledInputBasedOnMessageStatus ? "" : "hover:cursor-text"
        )}
      >
        <MentionInputGuest
          ref={mentionInputRef}
          value={userInput}
          disabled={isDisabledInputBasedOnMessageStatus}
          onInputChange={handleChangeInput}
          onKeyDown={handleEnterPress}
          placeholder={conversationT("input.placeholder.normalChat")}
        />
      </div>

      <div className="px-small-1 pb-small-0.75 pt-small-1 flex items-center justify-between bg-transparent">
        <FeatureToolsGuest />
        <div className="gap-small-0.75 flex items-center">
          <SelectionModelAIChip />
          {isShowCharacterCount && (
            <CharacterCount
              total={totalCharacter}
              current={userInput.length}
              onStatus={handleChangeStatus}
            />
          )}
          <ButtonSubmit
            ref={submitButtonRef}
            disabled={isDisabledSubmitButton || isFetching}
            onClick={onSubmit}
          />
        </div>
      </div>
    </WrapperInputForm>
  );
});

ConversationInputGuest.displayName = "ConversationInputGuest";

export default ConversationInputGuest;
