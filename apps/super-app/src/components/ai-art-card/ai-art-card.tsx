import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import { Badge } from "../badge";
import { ToolTip } from "../tooltip";

interface TAIArtCardProps {
  image: string;
  gifImage?: string;
  title: string;
  description: string;
  isNew?: boolean;
  isSelected?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const AIArtCard = ({
  image,
  gifImage,
  title,
  description,
  isNew,
  isSelected,
  onClick,
}: TAIArtCardProps) => {
  const commonT = useTranslations("common");
  const [isHovered, setIsHovered] = useState(false);

  const renderImage = () => {
    const shouldShowGif = isHovered || isSelected;

    if (shouldShowGif && gifImage) {
      return (
        <Image
          src={gifImage}
          alt="preview image"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />
      );
    }
    return (
      <Image
        src={image}
        alt="preview image"
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
    );
  };

  return (
    <div
      className={compositeStyles(
        "group rounded-default p-small-1 hover:border-border-action-primary-default relative flex size-full items-end overflow-hidden border-2 transition-[border] hover:cursor-pointer",
        {
          "border-border-action-primary-default": isSelected,
          "border-transparent": !isSelected,
        }
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderImage()}

      {isNew && (
        <Badge
          containerClassName="absolute top-[20px] left-[14px]"
          type="default"
          color="green"
          rounded="half"
        >
          {commonT("cta.new")}
        </Badge>
      )}
      {isSelected ? (
        <SVGIcon
          src="/icons/filled/checked-circle.svg"
          className="absolute top-[16px] end-[14px]"
          width={32}
          height={32}
        />
      ) : (
        <SVGIcon
          src="/icons/filled/unchecked-circle.svg"
          className="absolute top-[16px] end-[14px] opacity-0 transition-opacity group-hover:opacity-100"
          width={32}
          height={32}
        />
      )}

      <div className="gap-small-0.5 rounded-rounded bg-surface-conversation-user-default px-medium-2 py-medium-1.5 text-text-general-secondary flex w-full flex-col backdrop-blur-md">
        <h4 className="text-bodyS-highlight truncate">{title}</h4>
        {description && (
          <ToolTip
            classNames="z-99 max-w-[300px]"
            color="dark"
            content={description}
            side="bottom"
            align="center"
          >
            <p className="text-footnoteM-neutral truncate">{description}</p>
          </ToolTip>
        )}
      </div>
    </div>
  );
};

export default AIArtCard;
