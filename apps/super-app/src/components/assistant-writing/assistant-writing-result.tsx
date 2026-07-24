"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";

import { AssistantSuggestion } from "@/components/assistant-suggestion";
import { AssistantSummaryPrompt } from "@/components/assistant-summary-prompt";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

import type { TAssistantWritingResultProps } from "./types";

const EditPromptModal = dynamic(
  () => import("@/components/modal/edit-prompt-modal")
);

const AssistantLoading = dynamic(
  () => import("@/components/assistant-loading/assistant-loading")
);
const TextTyping = dynamic(
  () => import("@/components/text-typing/text-typing")
);
const MessageMarkdown = dynamic(
  () => import("@/components/message-markdown/message-markdown"),
  { ssr: false }
);
const CopyButton = dynamic(
  () => import("@/components/copy-button/copy-button")
);

export default function AssistantWritingResult({
  status,
  prompt,
  answer,
  suggestions,
  onStopGenerating,
  onChangePrompt,
  onClickSuggestion,
  onSubmit,
}: TAssistantWritingResultProps) {
  const [openEditModal, toggleEditModal] = useToggle(false);
  const userId = useGlobalState((state) => state.user.id);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const [editPrompt, setEditPrompt] = useState(prompt);
  const PROMPT_DELAY_MS = 1;

  const t = useTranslations("assistantWriting.result");
  const placeholder = t("placeholder");
  const suggestionTitle = t("suggestion.title");

  const handleCloseEditPromptModal = () => {
    setEditPrompt(prompt);
    toggleEditModal();
  };

  const handleSubmitPromptModal = () => {
    sendTrackingEvent({
      name: EventKeys.AssistantwrittingApply,
      payload: {
        vulcan_user_id: userId,
      },
    });
    onChangePrompt("prompt", editPrompt);
    onSubmit(editPrompt);
    toggleEditModal();
  };

  const handleChangeEditPrompt = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditPrompt(e.target.value);
  };

  const handleClickSuggestion = (value: string) => {
    // Create New Assistant Writing
    onChangePrompt("prompt", value);
    onClickSuggestion(value);
  };

  const renderAssistantAnswer = () => {
    if (status === "loading") {
      return <AssistantLoading />;
    }
    if (status === "generating") {
      return (
        <TextTyping
          text={answer.content}
          delay={PROMPT_DELAY_MS}
          onDone={onStopGenerating}
        />
      );
    }
    return (
      <div className="gap-medium-1.5 flex flex-col">
        <span className="flex-1">
          <MessageMarkdown content={answer.content} />
        </span>
        <div className="flex justify-end">
          <CopyButton content={answer.content} />
        </div>
      </div>
    );
  };

  return (
    <div className="gap-medium-2 flex h-full flex-col">
      {/* User Prompt */}
      <div className="shrink-0">
        <AssistantSummaryPrompt
          isShowEditBtn={status === "submitted" || status === "idle"}
          prompt={prompt}
          onClick={() => {
            sendTrackingEvent({
              name: EventKeys.AssistantwrittingEdit,
              payload: {
                vulcan_user_id: userId,
              },
            });
            toggleEditModal();
          }}
        />
      </div>

      {/* Assistant Answer */}
      <div className="flex-1">
        <article className="rounded-rounded bg-surface-conversation-bot-default p-medium-2 relative h-full">
          {renderAssistantAnswer()}
        </article>
      </div>

      {/* Suggestion */}
      {suggestions.length > 0 && status === "submitted" && (
        <div className="gap-small-1 flex flex-col">
          <p className="text-bodyS-highlight text-text-general-tertiary">
            {suggestionTitle}
          </p>
          {suggestions.map((suggestion, index) => (
            <AssistantSuggestion
              key={`${index}-${suggestion}`}
              suggestion={suggestion}
              onClick={handleClickSuggestion}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {openEditModal && (
        <EditPromptModal
          open={openEditModal}
          isDisabledSubmit={!editPrompt}
          onClose={handleCloseEditPromptModal}
          onSubmit={handleSubmitPromptModal}
        >
          <div className="flex h-full min-h-[510px] flex-col">
            <textarea
              className="text-bodyM-neutral text-text-general-secondary placeholder:text-bodyM-neutral placeholder:text-text-input-placeholder size-full flex-1 resize-none bg-transparent outline-hidden"
              placeholder={placeholder}
              value={editPrompt}
              onChange={handleChangeEditPrompt}
            />
          </div>
        </EditPromptModal>
      )}
    </div>
  );
}
