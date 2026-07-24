"use client";

import { useTranslations } from "next-intl";

import { ChoiceButton } from "@/components/choice-button";
import { SuggestionBtnV2 } from "@/components/suggestion-btn-v2";
import useLocalStorage from "@/hooks/use-local-storage";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import {
  OPEN_CONFIRM_SUGGESTION_KEY,
  OPEN_SUGGESTIONS_KEY,
} from "@/utils/commons/keys";
import { compositeStyles } from "@/utils/commons/styles";

import type { TChatSuggestionV2Props } from "./types";

export default function ChatSuggestionV2({
  className = "",
  data,
  onClickSuggestion,
}: TChatSuggestionV2Props) {
  const [isShowSuggestions, setIsShowSuggestion] = useLocalStorage(
    OPEN_SUGGESTIONS_KEY,
    true
  );
  const [isShowConfirm, setIsShowConfirm] = useLocalStorage(
    OPEN_CONFIRM_SUGGESTION_KEY,
    true
  );

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();

  const conversationT = useTranslations("conversationPage");
  const ctaT = useTranslations("common.cta");

  const handleOnClickSuggestion = (msg: string) => {
    // Tracking ChatWithSuggestion
    sendTrackingEvent({
      name: EventKeys.ChatWithSuggestion,
      payload: {
        vulcan_user_id: user.id,
      },
    });
    onClickSuggestion(msg);
  };

  const handleSetIsShowSuggestion = (val: boolean) => {
    // Tracking ChatSuggestion
    sendTrackingEvent({
      name: EventKeys.ChatSuggestion,
      payload: {
        vulcan_status: "off",
        vulcan_user_id: user.id,
      },
    });
    setIsShowSuggestion(val);
  };

  const handleSetIsShowConfirm = (val: boolean) => {
    // Tracking ChatSuggestion
    sendTrackingEvent({
      name: EventKeys.ChatSuggestion,
      payload: {
        vulcan_status: "on",
        vulcan_user_id: user.id,
      },
    });
    setIsShowConfirm(val);
  };

  if (!isShowSuggestions || !data.length) {
    return (
      <p className="px-large-4 text-footnoteM-neutral text-text-general-quaternary">
        {conversationT("suggestion.enableChatSuggestion")}
      </p>
    );
  }

  return (
    <div
      className={compositeStyles(
        "gap-small-0.5 flex w-full flex-col",
        className
      )}
    >
      <div className="gap-small-0.25 flex flex-col items-start">
        {data.map((msg) => (
          <SuggestionBtnV2
            key={msg}
            className="text-start"
            onClick={() => handleOnClickSuggestion(msg)}
          >
            {msg}
          </SuggestionBtnV2>
        ))}
      </div>
      {isShowConfirm && (
        <div className="gap-medium-1.5 ps-medium-2 md:px-large-4 flex items-center">
          <p className="text-footnoteM-neutral text-text-general-tertiary">
            {conversationT("suggestion.keepSuggestion")}
          </p>
          <div className="gap-small-0.75 flex">
            <ChoiceButton onClick={() => handleSetIsShowConfirm(false)}>
              {ctaT("yes")}
            </ChoiceButton>
            <ChoiceButton onClick={() => handleSetIsShowSuggestion(false)}>
              {ctaT("no")}
            </ChoiceButton>
          </div>
        </div>
      )}
    </div>
  );
}
