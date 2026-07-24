import { DropdownMenu } from "radix-ui";
import { useState } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { FeatureChip } from "@/components/feature-chip";
import { Icon } from "@/components/icon";
import type { TIconProps } from "@/components/icon/types";
import { compositeStyles } from "@/utils/commons/styles";

import type { TAIToolsButtonProps } from "./types";

function AIToolsButton({ features, onRenderBadgeNew }: TAIToolsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dotClassName =
    "relative after:content-[''] after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-[#6AEBC3] after:rounded-full";

  const hasNewFeature = features.some(
    (feature) => feature.badge && feature.badge.color === "green"
  );

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <ButtonV2
          className={compositeStyles("lg:hidden", {
            [dotClassName]: hasNewFeature,
          })}
          size="icon"
          color="outline"
          rounded="circle"
          startIcon={<Icon name="plus" size={16} />}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          side="top"
          align="end"
          className="gap-small-0.75 rounded-rounded border-border-input-default bg-surface-general-primary p-small-1 z-1199 flex flex-col items-start border"
        >
          {features.map((feature) => {
            if (!feature.isEnabled) {
              return null;
            }

            return (
              <DropdownMenu.Item
                key={feature.id}
                // oxlint-disable-next-line react/jsx-handler-names -- forwarded from the feature config object, not a local handler
                onSelect={feature.onClick}
                asChild
              >
                <FeatureChip
                  className="group"
                  color="transparent"
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
                    endIcon:
                      onRenderBadgeNew?.(feature.id, feature.badge) || "",
                  })}
                >
                  {feature.label}
                </FeatureChip>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default AIToolsButton;
