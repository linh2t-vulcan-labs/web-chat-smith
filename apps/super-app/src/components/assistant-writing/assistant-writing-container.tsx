import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Button } from "@/components/button";
import { compositeStyles } from "@/utils/commons/styles";

import AssistantPromoteSignin from "./assistant-promote-signin";
import AssistantWritingPrompt from "./assistant-writing-prompt";
import AssistantWritingResult from "./assistant-writing-result";
import type { TAssistantWritingContainerProps } from "./types";

export default function AssistantWritingContainer({
  isGuestMode,
  status,
  prompt,
  selectedWriting,
  suggestions,
  onStopGenerating,
  onChangePrompt,
  onClickSuggestion,
  onSubmit,
}: TAssistantWritingContainerProps) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const { answer } = selectedWriting;
  const hasAssistantAnswer = answer.content;

  const commonT = useTranslations("common.cta");
  const assistantWritingT = useTranslations("assistantWriting.cta");
  const renderAssistantSteps = () => {
    if (status === "loading" || hasAssistantAnswer) {
      return (
        <AssistantWritingResult
          status={status}
          prompt={prompt}
          answer={answer}
          suggestions={suggestions}
          onStopGenerating={onStopGenerating}
          onChangePrompt={onChangePrompt}
          onClickSuggestion={onClickSuggestion}
          onSubmit={onSubmit}
        />
      );
    }

    return (
      <AssistantWritingPrompt
        submitRef={submitRef}
        prompt={prompt}
        onChangePrompt={onChangePrompt}
      />
    );
  };

  const renderActions = () => {
    if (status === "generating") {
      return (
        <Button onClick={onStopGenerating} className="disabled:brightness-75">
          {assistantWritingT("stop")}
        </Button>
      );
    }

    return (
      <Button
        ref={submitRef}
        className="text-text-general-inverse dark:text-text-general-primary font-semibold disabled:brightness-75"
        onClick={() => onSubmit(prompt)}
        disabled={!prompt || status === "loading"}
      >
        {hasAssistantAnswer
          ? assistantWritingT("regenerate")
          : commonT("submit")}
      </Button>
    );
  };

  return (
    <div className="gap-medium-1.5 flex h-full flex-col">
      <div
        className={compositeStyles("flex flex-1 flex-col", {
          "overflow-y-auto": hasAssistantAnswer,
        })}
      >
        {isGuestMode && <AssistantPromoteSignin />}
        {renderAssistantSteps()}
      </div>
      <div className="border-border-general-primary py-medium-3 border-t">
        {renderActions()}
      </div>
    </div>
  );
}
