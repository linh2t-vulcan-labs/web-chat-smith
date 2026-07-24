import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useGlobalState } from "@/store/global/hooks";

import { SyncStatusTooltipV2 } from "../conversation-widgets-v2/sync-status-tooltip-v2";

const ConversationHeader = () => {
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);
  const { isBeta: enabledChatSync } = useChatSyncFlag();

  const commonT = useTranslations("common");
  const conversationT = useTranslations("conversationPage");
  const sideBarT = useTranslations("mainLayout");
  return (
    <div className="gap-v1-structural-component-micro flex w-full flex-col">
      <div className="py-v1-optical-normal px-v1-structural-content-tight flex items-center justify-between">
        <h4 className="typo-v1-title-md-light md:typo-v1-heading-h4 text-v1-text-hierarchy-primary">
          {sideBarT("sidebar.chatHistory")}
        </h4>
        <Button
          variant="ghost"
          size="l"
          iconOnly
          className="-m-2 hidden md:block"
          suffixIcon={<SvgIcon name="x" size={24} />}
          onClick={() => toggleSidebar()}
        />
      </div>

      {/* Note: Release 8.260511.1: Temporary hide this block */}
      {enabledChatSync && (
        <div className="md:mx-v1-structural-content-micro py-v1-structural-content-normal px-v1-structural-content-relaxed rounded-v1-large border-v1-border-structural-subtle bg-v1-surface-hierarchy-raised relative hidden border-4">
          <div className="gap-v1-structural-content-micro flex flex-col">
            <div className="gap-v1-structural-content-micro flex items-center">
              <h4 className="typo-v1-support-secondary-strong text-v1-text-hierarchy-primary">
                {conversationT("chatSync.title")}
              </h4>
              <span className="rounded-half bg-v1-badge-beta-background typo-v1-label-nano px-v1-structural-content-micro py-v1-optical-hairline inline-block uppercase">
                {commonT("cta.beta")}
              </span>
            </div>
            <p className="typo-v1-caption-smsecondary-helper text-v1-text-hierarchy-secondary">
              {conversationT("chatSync.descV2")}
            </p>
            <div className="top-v1-optical-2 end-v1-1 absolute">
              <SyncStatusTooltipV2 />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHeader;
