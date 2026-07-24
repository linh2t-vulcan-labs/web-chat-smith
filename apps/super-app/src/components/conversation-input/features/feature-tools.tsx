import { useTranslations } from "next-intl";

import { Badge } from "@/components/badge";
import type { TBadgeVariant } from "@/components/badge/types";
import { FeatureChip } from "@/components/feature-chip";
import { Icon } from "@/components/icon";
import type { TIconProps } from "@/components/icon/types";
import { ToolTip } from "@/components/tooltip";
import { EConversationMode } from "@/core/models/conversation";
import { useHasClickedCreateImage } from "@/hooks/image-creation/use-has-clicked-create-image";
import { useIsDisabledInputBasedOnMessageStatus } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";

import { AIToolsButton } from "../../ai-tools-button";
import type { TChatFeature } from "../../ai-tools-button/types";
import FileUpload from "./file-upload";
import type { TAITools } from "./types";

function FeatureTools({
  mode,
  isDisabledFileUpload = false,
  isDisabledAIArt = false,
  isDisabledDeepSearch = false,
  isDisabledWebSearch = false,
  onSelectFeature,
  onOpenConfirmModel,
}: TAITools) {
  const t = useTranslations("common");
  const conversationT = useTranslations("conversationPage");
  const { hasClickedCreateImage } = useHasClickedCreateImage();

  // Conversation state
  const user = useGlobalState((state) => state.user);
  const isDisabledInputBasedOnMessageStatus =
    useIsDisabledInputBasedOnMessageStatus();

  // Variables
  const isDeepResearch = mode === EConversationMode.DEEP_RESEARCH;
  const isAIArt = mode === EConversationMode.AI_ART;
  const isWebSearch = mode === EConversationMode.WEB_SEARCH;

  const chatFeatures: TChatFeature[] = [
    {
      badge: hasClickedCreateImage
        ? undefined
        : { color: "green", text: t("cta.new") },
      icon: "aiArt",
      id: "1",
      isActive: isAIArt && !isDisabledInputBasedOnMessageStatus,
      isDisabled: isDisabledAIArt || isDisabledInputBasedOnMessageStatus,
      isEnabled: true,
      label: `${t("createImage")} 🍌`,
      onClick: () => onSelectFeature(EConversationMode.AI_ART),
      tooltip: conversationT("tooltip.createImage"),
    },
    {
      icon: "deepResearch",
      id: "2",
      isActive: isDeepResearch && !isDisabledInputBasedOnMessageStatus,
      isDisabled: isDisabledDeepSearch || isDisabledInputBasedOnMessageStatus,
      isEnabled: true,
      label: t("deepResearch"),
      onClick: () => onSelectFeature(EConversationMode.DEEP_RESEARCH),
      tooltip: conversationT("tooltip.deepResearch"),
    },
    {
      icon: "webSearch",
      id: "3",
      isActive: isWebSearch && !isDisabledInputBasedOnMessageStatus,
      isDisabled: isDisabledWebSearch || isDisabledInputBasedOnMessageStatus,
      isEnabled: true,
      label: t("webSearch"),
      onClick: () => onSelectFeature(EConversationMode.WEB_SEARCH),
      tooltip: conversationT("tooltip.webSearch"),
    },
  ];

  const renderBadgeNew = (
    id: string,
    badge: { text: string; color: TBadgeVariant["color"] }
  ) => {
    switch (id) {
      case "1": {
        if (!hasClickedCreateImage) {
          return (
            <Badge
              className="px-0! text-[8px]! leading-3 font-semibold uppercase"
              type="default"
              containerClassName="py-0! pulse-glow"
              rounded="half"
              color={badge.color}
            >
              {badge.text}
            </Badge>
          );
        }
        return "";
      }
      default: {
        return (
          <Badge
            className="px-0! text-[8px]! leading-3 font-semibold uppercase"
            type="default"
            containerClassName="py-0! pulse"
            rounded="half"
            color={badge.color}
          >
            {badge.text}
          </Badge>
        );
      }
    }
  };

  return (
    <div className="gap-small-0.5 md:gap-small-0.75 flex items-center">
      {/* Attach File */}
      <FileUpload
        disabled={isDisabledFileUpload}
        onOpenConfirmModel={onOpenConfirmModel}
      />

      {/* Advance Features Mobile */}
      <AIToolsButton
        features={chatFeatures}
        onRenderBadgeNew={renderBadgeNew}
      />

      {/* Advance Features Desktop */}
      {chatFeatures.map((feature) => {
        if (!feature.isEnabled) {
          return null;
        }

        return (
          <ToolTip key={feature.id} content={feature.tooltip} side="bottom">
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
              {...(user.id &&
                feature.badge && {
                  endIcon: renderBadgeNew(feature.id, feature.badge),
                })}
            >
              {feature.label}
            </FeatureChip>
          </ToolTip>
        );
      })}
    </div>
  );
}

export default FeatureTools;
