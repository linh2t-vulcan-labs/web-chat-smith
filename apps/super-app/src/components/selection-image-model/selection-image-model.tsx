import { useTranslations } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { useCallback, useMemo } from "react";

import { Badge } from "@/components/badge";
import { FeatureChip } from "@/components/feature-chip";
import { SVGIcon } from "@/components/svg-icon";
import { GUIDE_TOUR_IDS } from "@/config/guide-tour";
import { useConversationState } from "@/store/conversation/hooks";

import SelectionImageList from "./selection-image-list";
import type { TSelectionModelProps } from "./types";

const DEFAULT_MODELS: TSelectionModelProps["models"] = [];

function SelectionImageModel({
  models = DEFAULT_MODELS,
  seenModels,
  selectedModel,
  isPremiumUser = false,
  onModelSelect,
  disabled = false,
}: TSelectionModelProps) {
  const setIsOpenImageModelDropdown = useConversationState(
    (state) => state.setIsOpenImageModelDropdown
  );
  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");

  const isOpenImageModelDropdown = useConversationState(
    (state) => state.isOpenImageModelDropdown
  );

  const translateImageModel = useMemo(
    () =>
      models.map((model) => ({
        ...model,
        badge: model.badge
          ? { ...model.badge, text: commonT(model.badge.text) }
          : null,
        description: conversationT(model.description),
        title: conversationT(model.title),
      })),
    [models, conversationT, commonT]
  );

  const translatedSelectedModel = useMemo(
    () => ({
      ...selectedModel,
      badge: selectedModel.badge
        ? { ...selectedModel.badge, text: commonT(selectedModel.badge.text) }
        : null,
      title: conversationT(selectedModel.title),
    }),
    [selectedModel, conversationT, commonT]
  );

  const handleModelDropdown = (open: boolean) => {
    setIsOpenImageModelDropdown(open);
  };

  const handleModelSelect = useCallback(
    (translatedModel: (typeof translateImageModel)[number]) => {
      // Find original model with translation keys to save in store
      const originalModel = models.find(
        (m) => m.value === translatedModel.value
      );
      if (originalModel) {
        onModelSelect(originalModel);
      }
    },
    [models, onModelSelect]
  );

  const handleRenderNewLabel = useCallback(() => {
    const isShowBadge =
      selectedModel?.badge?.text &&
      !seenModels.some((model) => model.value === selectedModel.value);
    return isShowBadge ? (
      <Badge
        className="px-0! text-[8px]! leading-3 font-semibold uppercase"
        type="default"
        containerClassName="py-0! pulse-glow ml-2"
        rounded="half"
        color="green"
      >
        {translatedSelectedModel.badge?.text}
      </Badge>
    ) : (
      ""
    );
  }, [seenModels, selectedModel, translatedSelectedModel]);

  return (
    <DropdownMenu.Root
      open={isOpenImageModelDropdown}
      onOpenChange={handleModelDropdown}
    >
      <DropdownMenu.Trigger asChild>
        <FeatureChip
          id={GUIDE_TOUR_IDS.SELECT_MODEL}
          className="group"
          color="transparent"
          endIconSpacing="ml-small-0.5"
          endIcon={
            <SVGIcon
              src="/icons/triangle-up.svg"
              className="text-icon-action-tertiary-default group-hover:text-icon-general-primary transition-transform duration-300 ease-out"
              style={{
                transform: isOpenImageModelDropdown
                  ? "rotate(0)"
                  : "rotate(180deg)",
              }}
              width={16}
              height={16}
            />
          }
          disabled={disabled}
        >
          {translatedSelectedModel.title}
          {selectedModel.badge?.text && handleRenderNewLabel()}
        </FeatureChip>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <SelectionImageList
          models={translateImageModel}
          seenModels={seenModels}
          selectedModel={selectedModel}
          isPremiumUser={isPremiumUser}
          onModelSelect={handleModelSelect}
        />
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default SelectionImageModel;
