import { FeatureChip } from "@/components/feature-chip";
import { compositeStyles } from "@/utils/commons/styles";

import type { TFeedbackChipListProps } from "./types";

export function FeedbackChipList(props: TFeedbackChipListProps) {
  const { options, activeOptions, onClick } = props;

  return (
    <div className="gap-small-1 flex flex-wrap">
      {options.map((item) => {
        const isActive = activeOptions.find(
          (activeOption) => activeOption.id === item.id
        );

        return (
          <FeatureChip
            className={compositeStyles("text-bodyS-neutral", {
              "text-text-inputControl-neutral-default": !isActive,
            })}
            key={item.id}
            isActive={!!isActive}
            onClick={() => onClick(item)}
          >
            {item.content}
          </FeatureChip>
        );
      })}
    </div>
  );
}
