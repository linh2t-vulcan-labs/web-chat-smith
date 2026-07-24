"use client";

import { useEffect, useRef } from "react";

import { EmptyConversation } from "@/features/guest-mode/components/empty-conversation";
import MessageItem from "@/features/guest-mode/components/message-item/message-item";

import { useGuestState } from "../../stores/guest-mode/hooks";

export default function Conversation() {
  // Loading State when waiting for assistant message
  const lastItemRef = useRef<HTMLDivElement>(null);
  const { messages, status } = useGuestState(
    (state) => state.conversationState
  );
  const isConversationGenerating = status === "generating";
  const hasMessage = messages.length;

  // Auto-scroll when messages change
  useEffect(() => {
    lastItemRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!hasMessage) {
    return <EmptyConversation />;
  }

  return (
    <div className="flex size-full flex-col justify-start">
      <div className="max-h-full w-full overflow-y-auto px-4 [scrollbar-gutter:stable]">
        <div className="gap-medium-3 mx-auto flex w-full max-w-(--breakpoint-md) flex-col">
          {messages.map((message, index) => {
            const isLastMessage = messages.length - 1 === index;

            return (
              <MessageItem
                isConversationGenerating={isConversationGenerating}
                key={message.id}
                message={message}
                isLastMessage={isLastMessage}
              />
            );
          })}
          <div
            ref={lastItemRef}
            className="pointer-events-none h-1 w-full"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
