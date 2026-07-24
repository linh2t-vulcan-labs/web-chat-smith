import { useTranslations } from "next-intl";
import Image from "next/image";
import { forwardRef } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import { Badge } from "../badge";
import { GradientBadge } from "../gradient-badge";
import { Icon } from "../icon";
import type { TModelCardProps } from "./types";

const ModelCard = forwardRef<HTMLDivElement, TModelCardProps>(
  (
    {
      className = "",
      logo,
      title,
      description,
      badge,
      isSelected = false,
      isPremium = false,
      isLocked = false,
      ...restProps
    },
    ref
  ) => {
    const commonT = useTranslations("common");
    const renderModelStatus = () => {
      // GU-1573
      // priority: selected > locked > premium
      if (isSelected) {
        return (
          <SVGIcon
            src="/icons/checked.svg"
            className="text-icon-action-primary-default"
            width={16}
            height={16}
          />
        );
      }
      if (isLocked) {
        return (
          <Icon name="lock" className="text-icon-general-tertiary" size={16} />
        );
      }
      if (isPremium) {
        return <GradientBadge type="premium" text={commonT("pro")} />;
      }
      return null;
    };

    return (
      <div
        ref={ref}
        className={compositeStyles(
          "gap-small-0.75 rounded-soft p-small-1 hover:bg-surface-general-bright-overlay flex h-[48px] items-start hover:cursor-pointer focus:outline-hidden",
          { "bg-surface-general-bright-overlay": isSelected },
          className
        )}
        {...restProps}
      >
        <Image width={16} height={16} src={logo} alt="logo" />
        <div className="flex flex-1 flex-col">
          <h4 className="gap-small-1 text-footnoteM-neutral text-text-action-secondary-default line-clamp-1 inline-flex items-center">
            {title}
            {/* GU-1573 */}
            {badge && (
              <Badge
                className="px-0! text-[8px]! leading-3 font-semibold uppercase"
                type="default"
                containerClassName="py-0!"
                rounded="half"
                color="green"
              >
                {badge}
              </Badge>
            )}
          </h4>
          <p className="text-footnoteS-neutral text-text-action-tertiary-default line-clamp-1">
            {description}
          </p>
        </div>
        {renderModelStatus()}
      </div>
    );
  }
);

ModelCard.displayName = "ModelCard";

export default ModelCard;
