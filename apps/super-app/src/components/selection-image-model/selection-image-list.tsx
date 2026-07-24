import { DropdownMenu } from "radix-ui";
import { forwardRef } from "react";

import { ModelCard } from "@/components/model-card";
import type { AIModelItem } from "@/core/models/model";

import type { TSelectionListProps } from "./types";

const SelectionImageList = forwardRef<HTMLDivElement, TSelectionListProps>(
  (
    { models, seenModels, selectedModel, onModelSelect, isPremiumUser },
    ref
  ) => {
    const handleModelSelect = (model: AIModelItem) => {
      onModelSelect(model);
    };

    return (
      <DropdownMenu.Content side="top" align="end" asChild>
        <div
          ref={ref}
          className="rounded-default border-border-input-default bg-surface-general-primary z-1199 w-[330px] overflow-hidden border"
        >
          <div className="gap-small-0.25 px-small-1 pt-small-1 flex flex-col">
            {models.map((model) => {
              const isPremium =
                !model.availableRoles.includes("free") && !isPremiumUser;
              const isSelected = model.value === selectedModel.value;
              const hasSeenModel = seenModels.some(
                (seenModel) =>
                  seenModel.value === model.value &&
                  seenModel.badge?.text === model.badge?.text
              );

              if (!model.isActive) {
                return null;
              }

              return (
                <DropdownMenu.Item
                  key={model.id}
                  onSelect={() => handleModelSelect(model)}
                  asChild
                >
                  <ModelCard
                    className="last:mb-small-1"
                    logo={model.logo}
                    title={model.title}
                    description={model.description}
                    isSelected={isSelected}
                    isPremium={isPremium}
                    {...(model.badge && {
                      badge: hasSeenModel ? "" : model.badge.text,
                    })}
                  />
                </DropdownMenu.Item>
              );
            })}
          </div>
        </div>
      </DropdownMenu.Content>
    );
  }
);

SelectionImageList.displayName = "SelectionImageList";

export default SelectionImageList;
