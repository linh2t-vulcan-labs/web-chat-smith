import { useTranslations } from "next-intl";
import React from "react";

import { SVGIcon as OldSVGIcon } from "@/components/svg-icon";
import { SvgIcon } from "@/components/svg-icon-ds";
import { ToolTip } from "@/components/tooltip";
import { ESyncStatus } from "@/config/chat-sync";
import { compositeStyles } from "@/utils/commons/styles";

import { SYNC_STATUS } from "./consts";

const renderHighlightSpan = (status: ESyncStatus) => {
  const HighlightSpan = (chunks: React.ReactNode) => (
    <span
      className={compositeStyles(
        "text-footnoteS-highlight",
        status === ESyncStatus.SYNCED
          ? "text-text-action-primary-default"
          : "text-text-general-inverse"
      )}
    >
      {chunks}
    </span>
  );
  HighlightSpan.displayName = "HighlightSpan";
  return HighlightSpan;
};

const SyncStatusTooltipV2 = () => {
  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");
  return (
    <ToolTip
      triggerMode="auto"
      content={
        <div className="gap-small-0.5 px-small-0.5 py-small-0.25 flex flex-col">
          <div className="gap-small-0.5 flex items-center">
            <span className="text-footnoteM-bold text-text-general-inverse">
              {conversationT("chatSync.title")}
            </span>
            <span className="rounded-half bg-text-light-lavender px-small-0.5 py-small-0.25 text-text-general-inverse inline-block text-[8px] leading-none font-medium uppercase">
              {commonT("cta.beta")}
            </span>
          </div>
          <div className="gap-small-0.25 flex flex-col">
            {SYNC_STATUS.map((item) => (
              <div
                className="text-footnoteS-neutral flex items-center"
                key={item.status}
              >
                <OldSVGIcon
                  className="me-small-0.75"
                  src={item.icon}
                  width={12}
                  height={12}
                />
                {conversationT.rich(`chatSync.${item.status}`, {
                  span: renderHighlightSpan(item.status),
                })}
              </div>
            ))}
          </div>
        </div>
      }
      side="right"
    >
      <button type="button" className="inline-flex leading-3">
        <SvgIcon
          name="circle-alert"
          className="text-v1-icons-hierarchy-tertiary"
          size={16}
        />
      </button>
    </ToolTip>
  );
};

export default SyncStatusTooltipV2;
