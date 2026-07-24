import { useTranslations } from "next-intl";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { FeatureChip } from "@/components/feature-chip";
import { Icon } from "@/components/icon";
import type { TIconProps } from "@/components/icon/types";
import {
  SignInRequire,
  SigninRequirePopup,
} from "@/components/signin-require-popup";
import { EConversationMode } from "@/core/models/conversation";
import { AIToolsGuestButton } from "@/features/guest-mode/components/ai-tools-guest-button";
import type { TChatGuestFeature } from "@/features/guest-mode/components/ai-tools-guest-button/types";
import { useGuestConversationUrlParams } from "@/features/guest-mode/hooks/query-params";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";

import type { TAIToolsGuest } from "./types";

function FeatureToolsGuest({
  isDisabledAIArt = false,
  isDisabledDeepSearch = false,
  isDisabledWebSearch = false,
}: TAIToolsGuest) {
  const t = useTranslations("common");
  const isDesktop = useMediaQuery("md");
  const { showLoginModal } = useFeatureGating();
  const { sendTrackingEvent } = useSendTrackingEvent();
  const guestId = useGuestState((state) => state.anonId);

  const { handleSelectConversationMode, handleSignInAdvanceFeature } =
    useGuestConversationUrlParams();

  const chatFeatures: TChatGuestFeature[] = [
    {
      icon: "aiArt",
      id: EConversationMode.AI_ART,
      isActive: false,
      isDisabled: isDisabledAIArt,
      isEnabled: true,
      label: t("imageCreation"),
      onClick: () => {
        // Tracking GuestChatArtUsage
        handleSelectConversationMode(EConversationMode.AI_ART);
      },
      tooltip: t("imageCreationDescription"),
    },
    {
      icon: "deepResearch",
      id: EConversationMode.DEEP_RESEARCH,
      isActive: false,
      isDisabled: isDisabledDeepSearch,
      isEnabled: true,
      label: t("deepResearch"),
      onClick: () => {
        handleSelectConversationMode(EConversationMode.DEEP_RESEARCH);
      },
      tooltip: t("deepResearchDescription"),
    },
    {
      icon: "webSearch",
      id: EConversationMode.WEB_SEARCH,
      isActive: false,
      isDisabled: isDisabledWebSearch,
      isEnabled: true,
      label: t("webSearch"),
      onClick: () => {
        handleSelectConversationMode(EConversationMode.WEB_SEARCH);
      },
      tooltip: t("webSearchDescription"),
    },
  ];

  const handleUploadFile = () => {
    // Tracking GuestChatAttachFile
    if (guestId) {
      sendTrackingEvent({
        name: EventKeys.GuestChatAttachFile,
        payload: {
          guest_id: guestId,
        },
      });
    }

    showLoginModal("attach_file");
  };

  const handleOnClickUploadFile = () => {
    // Tracking GuestChatAttachFile
    if (guestId) {
      sendTrackingEvent({
        name: EventKeys.GuestChatAttachFile,
        payload: {
          guest_id: guestId,
        },
      });
    }

    if (isDesktop) {
      showLoginModal("attach_file");
    }
  };

  return (
    <div className="gap-small-0.5 md:gap-small-0.75 flex items-center">
      <SigninRequirePopup
        mode={isDesktop ? "tooltip" : "popover"}
        content={
          <SignInRequire
            title={t("uploadNeedSignIn")}
            onSignIn={handleUploadFile}
          />
        }
      >
        <Button
          type="button"
          className="p-small-0.5 text-icon-general-tertiary hover:rounded-half hover:bg-surface-general-bright-overlay! hover:text-icon-general-primary max-h-[32px] max-w-[32px] disabled:brightness-50 md:inline-flex"
          color="none"
          size="none"
          endIcon={<Icon name="attachFile" size={24} />}
          onClick={handleOnClickUploadFile}
        />
      </SigninRequirePopup>

      {/* Mobile */}
      <AIToolsGuestButton
        features={chatFeatures}
        onSignIn={handleSignInAdvanceFeature}
      />

      {/* Desktop */}
      {chatFeatures.map((feature) => {
        if (!feature.isEnabled) {
          return null;
        }

        return (
          <SigninRequirePopup
            key={feature.id}
            mode="tooltip"
            content={
              <SignInRequire
                title={feature.tooltip || ""}
                onSignIn={() => handleSignInAdvanceFeature(feature.id)}
              />
            }
          >
            <FeatureChip
              data-state={feature.isActive}
              className="group hidden lg:inline-flex"
              // oxlint-disable-next-line react/jsx-handler-names -- forwarded from the feature config object, not a local handler
              onClick={feature.onClick}
              isActive={feature.isActive}
              disabled={feature.isDisabled}
              startIcon={
                <Icon
                  name={feature.icon as TIconProps["name"]}
                  size={16}
                  className="group-hover:text-icon-general-primary data-[state=false]:text-icon-general-tertiary data-[state=true]:text-icon-general-primary"
                />
              }
              endIconSpacing="ml-small-0.75 flex"
              {...(feature.badge && {
                endIcon: (
                  <Badge
                    className="px-0! text-[8px]! leading-3 font-semibold uppercase"
                    type="default"
                    containerClassName="py-0!"
                    rounded="half"
                    color={feature.badge.color}
                  >
                    {feature.badge.text}
                  </Badge>
                ),
              })}
            >
              {feature.label}
            </FeatureChip>
          </SigninRequirePopup>
        );
      })}
    </div>
  );
}

export default FeatureToolsGuest;
