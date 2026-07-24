import { useTranslations } from "next-intl";

import { Divider } from "@/components/divider";
import { SVGIcon } from "@/components/svg-icon";
import { formatSecondsToReadableTime } from "@/utils/commons/date-time";

import type { TDeepResearchThinkingHeaderProps } from "./types";

export default function DeepResearchThinkingHeader(
  props: TDeepResearchThinkingHeaderProps
) {
  const { timing, amountOfSource } = props;
  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");
  const title = commonT("deepResearch");
  const source = conversationT("deepResearch.source", {
    count: amountOfSource || 0,
  });

  const isHasRightContent = !!timing && !!amountOfSource;
  return (
    <div className="rounded-rounded px-medium-1.5 py-small-1 flex items-center justify-between">
      <div className="gap-x-small-1 inline-flex items-center">
        <SVGIcon
          src="/icons/outlined/search-status.svg"
          className="text-text-general-secondary"
          width={24}
          height={24}
        />
        <p className="text-bodyS-highlight text-text-conversation-bot-default capitalize">
          {title}
        </p>
      </div>
      <div className="space-x-small-0.75 text-footnoteS-neutral inline-flex items-center">
        {isHasRightContent && (
          <>
            <span>{formatSecondsToReadableTime(Number(timing))}</span>
            <Divider
              direction="vertical"
              className="bg-border-general-primary! h-[12px]! w-px"
            />
            {amountOfSource > 0 && <span>{source}</span>}
          </>
        )}
      </div>
    </div>
  );
}
