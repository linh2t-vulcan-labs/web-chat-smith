"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { FeedbackChipList } from "@/components/message-feedback-modal/feedback-chip-list";
import { FeedbackInput } from "@/components/message-feedback-modal/feedback-input";
import type {
  TFeedbackChipListProps,
  TMessageFeedbackChipOption,
  TMessageFeedbackModalProps,
} from "@/components/message-feedback-modal/types";
import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import type { TMessageFeedbackOption } from "@/core/models/message-feedback";
import { messageFeedbackUC } from "@/core/usecases";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { safeJsonParse } from "@/utils/commons/helpers";

const renderFeedbackDescSpan = (chunks: React.ReactNode) => (
  <span className="text-bodyS-neutral text-text-general-tertiary">
    {chunks}
  </span>
);

function MessageFeedbackModal(props: TMessageFeedbackModalProps) {
  const { open, onClose, onSubmit, messageType } = props;
  const [feedback, setFeedback] = useState("");
  const [activeOptions, setActiveOptions] = useState<
    TMessageFeedbackChipOption[]
  >([]);
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();

  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");

  const isDisabledSubmitButton = activeOptions.length === 0 && !feedback;

  const handleChangeFeedbackInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setFeedback(value);
  };

  const feedbackOptions: TFeedbackChipListProps["options"] = useMemo(() => {
    const raw = getValueSyncRemoteConfig(
      REMOTE_CONFIG_KEY.MESSAGE_FEEDBACK_OPTIONS
    );
    const parsedOptions = safeJsonParse<TMessageFeedbackOption[]>(raw) || [];

    const validTypes =
      messageFeedbackUC.getMessageFeedbackTypeFromMessageType(messageType);
    const filtered = parsedOptions.filter((opt) =>
      validTypes.includes(opt.type)
    );

    return messageFeedbackUC.extractFeedbackOptionsToChipOptions(filtered);
  }, [messageType, getValueSyncRemoteConfig]);

  const FEEDBACK_OPTION_KEY_PREFIX = "modal.feedback.options.";

  const translatedOptions: TFeedbackChipListProps["options"] = useMemo(
    () =>
      feedbackOptions.map((opt) => ({
        ...opt,
        content: opt.content.startsWith(FEEDBACK_OPTION_KEY_PREFIX)
          ? conversationT(opt.content)
          : opt.content,
      })),
    [feedbackOptions, conversationT]
  );

  const handleSelectChipContent = (option: TMessageFeedbackChipOption) => {
    setActiveOptions((prev) => {
      const exists = prev.some((item) => item.id === option.id);

      if (exists) {
        return prev.filter((item) => item.id !== option.id);
      }

      return [...prev, option];
    });
  };

  const handleClickSubmitButton = () => {
    const reason = activeOptions.map((item) => {
      const key =
        feedbackOptions.find((opt) => opt.id === item.id)?.content ??
        item.content;
      return key.startsWith(FEEDBACK_OPTION_KEY_PREFIX)
        ? key.slice(FEEDBACK_OPTION_KEY_PREFIX.length)
        : key;
    });
    const reasonDetail = feedback;

    onSubmit?.({ reason, reasonDetail });
  };

  return (
    <ModalV2
      open={open}
      onClose={onClose}
      className="w-[343px] p-0! md:w-[488px]"
    >
      <div className="py-medium-2 ps-medium-3 pe-medium-2 text-text-general-secondary md:py-medium-3 inline-flex w-full items-center justify-between">
        <h2 className="text-bodyL-highlight md:text-app-Title1">
          {conversationT("modal.feedback.title")}
        </h2>
        <SVGIcon
          src="/icons/outlined/closed.svg"
          width={16}
          height={16}
          className="text-icon-general-tertiary cursor-pointer"
          onClick={onClose}
        />
      </div>
      <div className="gap-medium-2 px-medium-2 py-small-1 md:gap-medium-3 md:px-medium-3 md:py-medium-1.5 flex flex-col">
        <FeedbackChipList
          options={translatedOptions}
          activeOptions={activeOptions}
          onClick={handleSelectChipContent}
        />
        <div className="gap gap-medium-1.5 inline-flex flex-col">
          <p className="text-bodyM-medium text-text-general-secondary">
            {conversationT.rich("modal.feedback.desc", {
              span: renderFeedbackDescSpan,
            })}
          </p>
          <FeedbackInput
            value={feedback}
            onChange={handleChangeFeedbackInput}
            placeholder={conversationT("input.placeholder.feedback")}
          />
        </div>
        <div className="gap-small-1 inline-flex w-full items-center justify-end">
          <ButtonV2 color="outline" onClick={onClose}>
            {commonT("cta.cancel")}
          </ButtonV2>
          <ButtonV2
            color="primary"
            disabled={isDisabledSubmitButton}
            onClick={handleClickSubmitButton}
          >
            {commonT("cta.submit")}
          </ButtonV2>
        </div>
      </div>
    </ModalV2>
  );
}

export default MessageFeedbackModal;
