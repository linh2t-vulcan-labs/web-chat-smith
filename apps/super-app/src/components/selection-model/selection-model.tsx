import { DropdownMenu, Popover } from "radix-ui";
import { useEffect, useState } from "react";

import { FeatureChip } from "@/components/feature-chip";
import { SVGIcon } from "@/components/svg-icon";
import { useOnboardingPopupGuide } from "@/features/onboarding-popup-queue-manager/hooks";
import { markPopupAsShown } from "@/features/onboarding-popup-queue-manager/utils";
import { usePathname } from "@/i18n/navigation";
import { useGlobalState } from "@/store/global/hooks";
import {
  CURRENT_INFO_MODEL_VERSION,
  HAS_SEEN_INFO_MODEL,
} from "@/utils/commons/keys";
import { CONVERSATION_URL } from "@/utils/constants/url";

import InfoModel from "./info-model";
import SelectionList from "./selection-list";
import type { TSelectionModelProps } from "./types";

const DEFAULT_MODELS: TSelectionModelProps["models"] = [];
const DEFAULT_SEEN_MODELS: TSelectionModelProps["seenModels"] = [];

function SelectionModel({
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
  const userId = useGlobalState((state) => state.user.id);
  const [isOpenModelDropdown, setIsOpenModelDropdown] = useState(false);
  const isConversationPage = pathname === CONVERSATION_URL;

  const {
    isOpen: isOpenOnboardingPopupGuide,
    handleClose: handleCloseOnboardingPopupGuide,
  } = useOnboardingPopupGuide({
    popupId: HAS_SEEN_INFO_MODEL,
  });

  useEffect(() => {
    if (isOpenOnboardingPopupGuide && isConversationPage) {
      // Wait for render to complete before marking popup as shown
      setTimeout(() => {
        markPopupAsShown(HAS_SEEN_INFO_MODEL, {
          includePrefix: false,
          userId,
          version: CURRENT_INFO_MODEL_VERSION,
        });
      }, 200);
    }
  }, [isOpenOnboardingPopupGuide, isConversationPage, userId]);

  const handleInfoPopover = () => {
    handleCloseOnboardingPopupGuide();
  };

  const handleModelDropdown = (open: boolean) => {
    setIsOpenModelDropdown(open);

    if (isConversationPage) {
      handleCloseOnboardingPopupGuide();
    }
  };

  return (
    <Popover.Root
      open={isOpenOnboardingPopupGuide && isConversationPage}
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
          <InfoModel setHasSeenInfoPopover={handleInfoPopover} />
        </Popover.Portal>
      </DropdownMenu.Root>
    </Popover.Root>
  );
}

export default SelectionModel;
