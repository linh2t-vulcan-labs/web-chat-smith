"use client";

import { DropdownMenu } from "radix-ui";
import { useState } from "react";

import { FeatureChip } from "@/components/feature-chip";
import SelectionList from "@/components/selection-model/selection-list";
import { SVGIcon } from "@/components/svg-icon";
import type { AIModel, AIModelItem } from "@/core/models/model";

import styles from "./styles.module.css";

export interface AIToolBannerModelSelectorProps {
  models: AIModel[];
  seenModels: AIModelItem[];
  selectedModel: AIModelItem;
  onModelSelect: (model: AIModelItem) => void;
}

/**
 * Model dropdown for AI tool banner — uses `SelectionList` without `SelectionModel`
 * (which requires `GlobalStateProvider`, absent on landing pages).
 */
export function AIToolBannerModelSelector({
  models,
  seenModels,
  selectedModel,
  onModelSelect,
}: AIToolBannerModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.bannerModelSelectorWrap}>
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <FeatureChip
            color="transparent"
            endIconSpacing="ml-small-0.5"
            endIcon={
              <SVGIcon
                className="text-icon-action-tertiary-default transition-transform duration-300 ease-out"
                style={{ transform: isOpen ? "rotate(0)" : "rotate(180deg)" }}
                src="/icons/triangle-up.svg"
                width={16}
                height={16}
              />
            }
          >
            {selectedModel.title}
          </FeatureChip>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <SelectionList
            models={models}
            seenModels={seenModels}
            selectedModel={selectedModel}
            isPremiumUser
            isGuestUser={false}
            onModelSelect={onModelSelect}
          />
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
