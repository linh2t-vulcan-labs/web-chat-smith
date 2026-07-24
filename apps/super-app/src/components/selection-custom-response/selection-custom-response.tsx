import { DropdownMenu } from "radix-ui";
import { useState } from "react";

import { FeatureChip } from "@/components/feature-chip";
import { SVGIcon } from "@/components/svg-icon";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

import SelectionCustomResponseList from "./selection-custom-response-list";
import type { TSelectionModelProps } from "./types";

const DEFAULT_MODELS: TSelectionModelProps["models"] = [];

function SelectionCustomResponse({
  models = DEFAULT_MODELS,
  seenModels,
  selectedModel,
  isPremiumUser = false,
  onModelSelect,
  onSetSeenCustomResponse,
  disabled = false,
}: TSelectionModelProps) {
  const [isOpenCustomResponseDropdown, setIsOpenCustomResponseDropdown] =
    useState(false);

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();

  const handleCustomResponseDropdown = (open: boolean) => {
    setIsOpenCustomResponseDropdown(open);
    if (open) {
      // Tracking ChatResponseCustomTap
      sendTrackingEvent({
        name: EventKeys.ChatResponseCustomTap,
        payload: {
          vulcan_user_id: user.id,
        },
      });
    } else {
      onSetSeenCustomResponse?.();
    }
  };

  return (
    <DropdownMenu.Root
      open={isOpenCustomResponseDropdown}
      onOpenChange={handleCustomResponseDropdown}
    >
      <DropdownMenu.Trigger asChild>
        <FeatureChip
          className="group"
          color="transparent"
          endIconSpacing="ml-small-0.5"
          disabled={disabled}
        >
          <SVGIcon
            src="/icons/custom-response-ico-2.svg"
            className="text-icon-action-tertiary-default transition-transform duration-300 ease-out group-hover:text-icon-general-primary"
            width={16}
            height={16}
          />
        </FeatureChip>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <SelectionCustomResponseList
          models={models}
          seenModels={seenModels}
          selectedModel={selectedModel}
          isPremiumUser={isPremiumUser}
          onModelSelect={onModelSelect}
        />
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default SelectionCustomResponse;
