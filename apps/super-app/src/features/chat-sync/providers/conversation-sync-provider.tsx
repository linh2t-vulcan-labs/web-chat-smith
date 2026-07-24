"use client";

import { useTranslations } from "next-intl";
import { Toast } from "radix-ui";
import type { PropsWithChildren } from "react";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { cn } from "@/components/utils/cn";
import { useConversationState } from "@/store/conversation/hooks";

import { useChatSyncFlag } from "../hooks/use-chat-sync-flag";

export const ConversationSyncProvider = ({ children }: PropsWithChildren) => {
  const conversationT = useTranslations("conversationPage");
  const isOpenConversationSync = useConversationState(
    (state) => state.isOpenConversationSync
  );
  const setIsOpenConversationSync = useConversationState(
    (state) => state.setIsOpenConversationSync
  );
  const { isBeta: enabledChatSync } = useChatSyncFlag();

  return (
    <>
      {children}
      <Toast.Provider swipeDirection="right">
        {isOpenConversationSync && enabledChatSync && (
          <Toast.Root
            className={cn(
              "rounded-rounded thickness-thin bg-surface-general-primary top-1",
              "fixed right-4 w-[calc(100%-2rem)] max-w-104.75 md:w-104.75",
              "px-medium-2 py-medium-1.5 border-white/10"
            )}
            open={isOpenConversationSync}
            onOpenChange={setIsOpenConversationSync}
            duration={5000}
          >
            <Toast.Description asChild>
              <div className="gap-medium-2 flex items-start">
                <div className="mt-small-0.5 size-large-4 min-w-large-4 rounded-circle bg-surface-general-bright-overlay px-small-0.5 inline-flex items-center justify-center">
                  <SVGIcon
                    src="/icons/outlined/cloud.svg"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="text-bodyM-medium text-text-general-secondary">
                    {conversationT("toast.sync.title")}
                  </div>
                  <div className="text-footnoteM-neutral text-text-general-tertiary">
                    {conversationT("toast.sync.desc")}
                  </div>
                </div>
              </div>
            </Toast.Description>
          </Toast.Root>
        )}

        <Toast.Viewport className="fixed end-0 bottom-0 z-2147483647 m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-(--viewport-padding) outline-hidden [--viewport-padding:25px]" />
      </Toast.Provider>
    </>
  );
};
