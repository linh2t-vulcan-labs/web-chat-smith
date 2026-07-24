import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useRef, useState } from "react";

import useCheckLineClamp from "@/hooks/use-check-line-clamp";
import { compositeStyles } from "@/utils/commons/styles";

import { Badge } from "../badge";
import { Marquee } from "../marquee";

interface TAIArtCardMiniProps {
  image: string;
  gifImage?: string;
  title: string;
  isSelected?: boolean;
  isNew?: boolean;
  isDisabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const AIArtCardMini = ({
  image,
  gifImage,
  title,
  isSelected = false,
  isNew = false,
  isDisabled,
  onClick,
}: TAIArtCardMiniProps) => {
  const commonT = useTranslations("common");
  const textRef = useRef<HTMLDivElement>(null);
  const isClamped = useCheckLineClamp(textRef, title);
  const [isHovered, setIsHovered] = useState(false);

  const textStyle =
    "text-footnoteM-neutral text-text-general-primary truncate max-w-[56px] text-center";
  const imageStyle = "size-[56px] rounded-soft object-cover";

  const renderImage = () => {
    const shouldShowGif = isHovered || isSelected;

    if (shouldShowGif && gifImage) {
      return (
        <Image
          className={imageStyle}
          src={gifImage || ""}
          width={56}
          height={56}
          alt="ai art thumbnail"
          unoptimized
        />
      );
    }

    return (
      <Image
        className={imageStyle}
        src={image || ""}
        width={56}
        height={56}
        alt="ai art thumbnail"
      />
    );
  };

  return (
    <div
      className={compositeStyles(
        "gap-small-0.5 rounded-rounded border-border-general-secondary p-small-1 hover:border-border-general-secondary hover:bg-surface-general-bright-overlay relative box-border inline-flex flex-col items-center border hover:cursor-pointer",
        {
          "border-border-action-primary-default! bg-surface-general-soft":
            isSelected,
          "pointer-events-none opacity-30": isDisabled,
        }
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderImage()}
      {isNew && (
        <Badge
          className="px-0! text-[8px]! leading-3 font-semibold uppercase"
          type="default"
          containerClassName="py-0! absolute top-[4px] right-[4px]"
          rounded="half"
          color="green"
        >
          {commonT("cta.new")}
        </Badge>
      )}
      {isHovered && isClamped ? (
        <Marquee className={textStyle} pauseOnHover>
          {title}
        </Marquee>
      ) : (
        <p ref={textRef} className={textStyle}>
          {title}
        </p>
      )}
    </div>
  );
};

export default AIArtCardMini;
