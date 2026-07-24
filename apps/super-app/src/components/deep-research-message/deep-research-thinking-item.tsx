import { compositeStyles } from "@/utils/commons/styles";

import type { TDeepResearchThinkingItemProps } from "./types";
import { parseContentWithBadges } from "./utils";

export default function DeepResearchThinkingItem(
  props: TDeepResearchThinkingItemProps
) {
  const { title, content, onClickBadgeReference, className } = props;

  return (
    <div
      className={compositeStyles(
        "pt-small-0.5 pb-medium-1.5 gap-small-0.5 flex flex-col",
        className
      )}
    >
      <div className="px-small-1 py-small-0.5">
        <h1 className="text-footnoteM-highlight text-text-conversation-bot-default capitalize">
          {title}
        </h1>
      </div>
      <ul className="px-medium-2 text-text-conversation-bot-default ms-5 list-disc">
        <li className="text-footnoteM-neutral marker:ml-5">
          {parseContentWithBadges(content, onClickBadgeReference)}
        </li>
      </ul>
    </div>
  );
}
