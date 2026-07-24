import { DropdownMenu, Popover } from "radix-ui";
import { useState } from "react";

import { FeatureChip } from "@/components/feature-chip";
import { SVGIcon } from "@/components/svg-icon";
import type { AIModel, AIModelItem } from "@/core/models/model";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import useLocalStorage from "@/hooks/use-local-storage";
import { usePathname } from "@/i18n/navigation";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { HAS_SEEN_INFO_MODEL } from "@/utils/commons/keys";
import { CONVERSATION_URL } from "@/utils/constants/url";

import InfoModel from "./info-model";
import SelectionList from "./selection-list";

const DEFAULT_MODELS: AIModel[] = [];
const DEFAULT_SEEN_MODELS: AIModelItem[] = [];

export interface TSelectionModelProps {
  models: AIModel[];
  seenModels?: AIModelItem[];
  selectedModel: AIModelItem;
  isPremiumUser?: boolean;
  isGuestUser?: boolean;
  disabled?: boolean;
  onModelSelect: (model: AIModelItem) => void;
  onSignIn?: () => void;
}

function SelectionModelGuest({
  models = DEFAULT_MODELS,
  seenModels = DEFAULT_SEEN_MODELS,
  selectedModel,
  isPremiumUser = false,
  isGuestUser = false,
  disabled = false,
  onModelSelect,
  onSignIn,
}: TSelectionModelProps) {
  const pathname = usePathname();
  const [isOpenModelDropdown, setIsOpenModelDropdown] = useState(false);
  const [hasSeenInfoPopover, setHasSeenInfoPopover] = useLocalStorage(
    HAS_SEEN_INFO_MODEL,
    false
  );
  const isConversationPage = pathname === CONVERSATION_URL;
  const guestId = useGuestState((state) => state.anonId);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const handleInfoPopover = (open: boolean) => {
    setHasSeenInfoPopover(open);
  };

  const handleModelDropdown = (open: boolean) => {
    // Tracking GuestSwitchingGPTModelClicked
    if (guestId && open) {
      sendTrackingEvent({
        name: EventKeys.GuestSwitchingGPTModelClicked,
        payload: {
          guest_id: guestId,
        },
      });
    }
    setIsOpenModelDropdown(open);

    if (isConversationPage) {
      setHasSeenInfoPopover(true);
    }
  };

  return (
    <Popover.Root
      open={!hasSeenInfoPopover && isConversationPage}
      onOpenChange={handleInfoPopover}
    >
      <DropdownMenu.Root
        open={isOpenModelDropdown}
        onOpenChange={handleModelDropdown}
      >
        <DropdownMenu.Trigger asChild>
          <Popover.Trigger asChild>
            <FeatureChip
              className="group"
              color="transparent"
              endIconSpacing="ml-small-0.5"
              endIcon={
                <SVGIcon
                  src="/icons/triangle-up.svg"
                  className="text-icon-action-tertiary-default transition-transform duration-300 ease-out group-hover:text-icon-general-primary"
                  style={{
                    transform: isOpenModelDropdown
                      ? "rotate(0)"
                      : "rotate(180deg)",
                  }}
                  width={16}
                  height={16}
                />
              }
              disabled={disabled}
            >
              {selectedModel.title}
            </FeatureChip>
          </Popover.Trigger>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <SelectionList
            models={models}
            seenModels={seenModels}
            selectedModel={selectedModel}
            isPremiumUser={isPremiumUser}
            isGuestUser={isGuestUser}
            onModelSelect={onModelSelect}
            onSignIn={onSignIn}
          />
        </DropdownMenu.Portal>
        <Popover.Portal>
          <InfoModel setHasSeenInfoPopover={setHasSeenInfoPopover} />
        </Popover.Portal>
      </DropdownMenu.Root>
    </Popover.Root>
  );
}

export default SelectionModelGuest;
