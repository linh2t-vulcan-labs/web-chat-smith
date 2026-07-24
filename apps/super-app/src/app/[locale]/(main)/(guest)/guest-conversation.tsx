"use client";

import { useEffect, useRef, useState } from "react";

import { ContentLayout } from "@/components/content-layout";
import InterestButtonGroup from "@/components/interest-button-group/interest-button-group";
import { ConversationGuest } from "@/features/guest-mode/components/conversation-guest";
import { ConversationInputGuest } from "@/features/guest-mode/components/conversation-input-guest";
import { FloatingLogin } from "@/features/guest-mode/components/floating-login";
import {
  GuestConversationUrlParamsProvider,
  useGuestConversationUrlParams,
} from "@/features/guest-mode/hooks/query-params";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import useGuestConversation from "@/features/guest-mode/hooks/use-guest-conversation";
import { defaultGuestStoreState } from "@/features/guest-mode/stores/guest-mode/constants";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";
import { DEFAULT_USECASE_TAB } from "@/utils/constants/conversation";

function GuestConversationPage() {
  const {
    metadata: { interest: interestValues },
  } = useGlobalState((state) => state.onboarding);
  // Guest Conversation state
  const guestId = useGuestState((state) => state.anonId);
  const guestUserInput = useGuestState((state) => state.guestUserInput);
  const conversationState = useGuestState((state) => state.conversationState);
  const setGuestUserInput = useGuestState((state) => state.setGuestUserInput);
  const setConversationState = useGuestState(
    (state) => state.setConversationState
  );
  //Others
  const [isOpenUseCaseListModal, setIsOpenUseCaseListModal] = useState(false);
  const [defaultTab, setDefaultTab] = useState(DEFAULT_USECASE_TAB);
  const sentEventRef = useRef<string | null>(null);
  const { showLoginModal } = useFeatureGating();
  const { handleCreateConversation, messages, status } = useGuestConversation({
    initialMessages: conversationState.messages,
  });
  const { sendTrackingEvent } = useSendTrackingEvent();

  const { handleSelectUseCaseList } = useGuestConversationUrlParams();
  const hasConversation = messages.length > 0;
  const isError = status === "error";

  const handleToggleUseCaseModal = () => {
    setIsOpenUseCaseListModal(!isOpenUseCaseListModal);
  };

  const handleSelectTaskUseCaseList = (task: string) => {
    handleSelectUseCaseList({
      callback: () => handleToggleUseCaseModal(),
      task,
    });
  };

  const handleClickCategory = (category: string) => {
    setDefaultTab(category);
    handleToggleUseCaseModal();
    // Tracking GuestUseCaseView
    if (guestId) {
      sendTrackingEvent({
        name: EventKeys.GuestUseCaseView,
        payload: {
          guest_id: guestId,
          task: category,
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (!guestUserInput) {
      return;
    }

    setGuestUserInput("");
    // Tracking GuestChatSend
    if (guestId) {
      sendTrackingEvent({
        name: EventKeys.GuestChatSend,
        payload: {
          guest_id: guestId,
        },
      });
    }
    await handleCreateConversation(guestUserInput);
  };

  useEffect(
    () =>
      // Reset conversation state when unmount
      () => {
        setConversationState(defaultGuestStoreState.conversationState);
      },
    [setConversationState]
  );

  // Tracking GuestHomeChatView

  useEffect(() => {
    if (guestId && sentEventRef.current !== guestId) {
      sendTrackingEvent({
        name: EventKeys.GuestHomeChatView,
        payload: {
          guest_id: guestId,
        },
      });
      sentEventRef.current = guestId;
    }
  }, [guestId, sendTrackingEvent]);

  return (
    <ContentLayout>
      <div className="flex size-full flex-col">
        <div
          className={compositeStyles("flex size-full flex-col", {
            "pt-[23dvh]": !hasConversation,
          })}
        >
          <div
            className={compositeStyles("", {
              "flex-1 overflow-hidden": hasConversation,
            })}
          >
            <ConversationGuest />
          </div>

          {!isError && (
            <>
              <div className="pb-medium-2.5 flex w-full flex-col justify-end px-4">
                <div className="space-y-medium-1.5 mx-auto w-full max-w-(--breakpoint-md)">
                  {status === "reachedLimit" && (
                    <FloatingLogin
                      onLogin={() => showLoginModal("chat_quota")}
                    />
                  )}
                  <ConversationInputGuest
                    guestUserInput={guestUserInput}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>
              {!hasConversation && (
                <InterestButtonGroup
                  isOpenUseCaseListModal={isOpenUseCaseListModal}
                  defaultTab={defaultTab}
                  interestValues={interestValues}
                  onSelect={handleSelectTaskUseCaseList}
                  onClickCategory={handleClickCategory}
                  onClose={handleToggleUseCaseModal}
                />
              )}
            </>
          )}
        </div>
      </div>
    </ContentLayout>
  );
}

export default function GuestConversation() {
  return (
    <GuestConversationUrlParamsProvider>
      <GuestConversationPage />
    </GuestConversationUrlParamsProvider>
  );
}
