"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { AssistantSettings } from "@/components/assistant-settings";
import Spinner from "@/components/spinner/spinner";
import type { TAssistantSettingKeys } from "@/core/models/assistant-writing";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import useAssistantWriting from "@/hooks/assistant-writing/use-assistant-writing";
import useGetAssistantWriting from "@/hooks/assistant-writing/use-get-assistant-writing";
import { useDeleteConversation } from "@/hooks/conversations/use-delete-conversation";
import { useRouter } from "@/i18n/navigation";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { defaultAssistantSetting } from "@/utils/constants/assistant";
import { ASSISTANT_WRITING_URL } from "@/utils/constants/url";

import { ContentLayout } from "../content-layout";
import AssistantWritingContainer from "./assistant-writing-container";

interface TAssistantWritingProps {
  id?: string;
}

export default function AssistantWriting({ id }: TAssistantWritingProps) {
  // Chat sync
  const { isBeta: enabledChatSync } = useChatSyncFlag();
  // Others
  const router = useRouter();
  const {
    data: initialAssistantWriting,
    isLoading,
    isError,
  } = useGetAssistantWriting({ id });
  const { sendTrackingEvent } = useSendTrackingEvent();
  const userId = useGlobalState((state) => state.user.id);

  const handleSuccess = () => {
    router.push(ASSISTANT_WRITING_URL);
  };
  const deleteConversationMutation = useDeleteConversation({
    onSuccess: handleSuccess,
  });

  useEffect(() => {
    // Just mutate delete if chat sync not enable
    if (enabledChatSync) {
      return;
    }

    if (
      !isLoading &&
      initialAssistantWriting &&
      !initialAssistantWriting?.answer.content &&
      id
    ) {
      deleteConversationMutation.mutate({ id });
    }
  }, [
    isLoading,
    enabledChatSync,
    id,
    initialAssistantWriting,
    deleteConversationMutation,
  ]);

  const {
    selectedId,
    assistantWritingSettings,
    suggestions,
    selectedAssistantWriting,
    status,
    setSuggestions,
    setAssistantWritingSettings,
    handleStopGenerating,
    handleCreate,
    handleUpdate,
  } = useAssistantWriting({
    id,
    initialAssistantWriting,
  });

  const handleChangeSettings = (type: TAssistantSettingKeys, value: string) => {
    setAssistantWritingSettings({ ...assistantWritingSettings, [type]: value });
  };

  const handleResetSettings = () => {
    setAssistantWritingSettings({
      ...defaultAssistantSetting,
      prompt: assistantWritingSettings.prompt,
    });
  };

  const handleClickSuggestion = async (prompt: string) => {
    setSuggestions([]);
    const promptTrimmed = prompt.trim();
    if (!promptTrimmed) {
      return;
    }

    await handleUpdate(promptTrimmed);
  };

  const handleSubmit = async (prompt: string) => {
    const hasAssistantAnswer = selectedAssistantWriting.answer.content;
    if (hasAssistantAnswer) {
      sendTrackingEvent({
        name: EventKeys.AssistantwrittingRegenerate,
        payload: {
          vulcan_user_id: userId,
        },
      });
    } else {
      sendTrackingEvent({
        name: EventKeys.AssistantwrittingSend,
        payload: {
          length: assistantWritingSettings.length,
          tone: assistantWritingSettings.tone,
          using_technique: assistantWritingSettings.technique,
          vulcan_user_id: userId,
        },
      });
    }

    setSuggestions([]);
    const promptTrimmed = prompt.trim();

    if (!promptTrimmed) {
      return;
    }

    if (!selectedId) {
      await handleCreate(promptTrimmed);
      return;
    }

    await handleUpdate(promptTrimmed);
  };

  const isShowFeedBack = !!selectedAssistantWriting.answer.content;

  if (isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner size={30} />
      </div>
    );
  }

  if (isError) {
    toast.error(null, {
      description: "Unable to find conversation",
    });
    router.push(ASSISTANT_WRITING_URL);
  }

  return (
    <ContentLayout
      rightFeature={
        <AssistantSettings
          isShowFeedBack={isShowFeedBack}
          settingData={assistantWritingSettings}
          onChange={handleChangeSettings}
          onReset={handleResetSettings}
        />
      }
    >
      <div className="mx-auto h-full max-w-[calc(580px+160px)] px-medium-1.5 sm:px-large-10">
        <AssistantWritingContainer
          status={status}
          prompt={assistantWritingSettings.prompt}
          selectedWriting={selectedAssistantWriting}
          suggestions={suggestions}
          onStopGenerating={handleStopGenerating}
          onChangePrompt={handleChangeSettings}
          onClickSuggestion={handleClickSuggestion}
          onSubmit={handleSubmit}
        />
      </div>
    </ContentLayout>
  );
}
