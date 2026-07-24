import Image from "next/image";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { rgbDataURL } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

import { Button } from "../button";
import { ImageWithFallback } from "../image-fallback";

interface TEditImageCardProps {
  className?: string;
  imageUrl: string;
  isLoading?: boolean;
  isActive?: boolean;
  isError?: boolean;
  onClick: () => void;
  onCancel?: () => void;
}

const EditImageCard = ({
  className,
  imageUrl,
  isLoading = false,
  isActive = false,
  isError = false,
  onClick,
  onCancel,
}: TEditImageCardProps) => {
  const renderIcon = () => {
    if (isLoading) {
      return (
        <div className="rounded-soft bg-surface-general-bright-overlay flex size-full items-center justify-center">
          <div className="absolute animate-spin">
            <Image
              src="/images/generating.png"
              alt="loading..."
              width={16}
              height={16}
            />
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="rounded-soft bg-surface-general-bright-overlay flex size-full items-center justify-center">
          <SVGIcon
            src="/icons/outlined/error.svg"
            className="text-[#9C231D]"
            width={16}
            height={16}
          />
        </div>
      );
    }

    return (
      <ImageWithFallback
        className="rounded-soft"
        src={imageUrl}
        style={{
          objectFit: "cover",
        }}
        blurDataURL={rgbDataURL(35, 35, 35)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        placeholder="blur"
        alt="thumbnail"
        altFallback="No Image"
        fill
      />
    );
  };

  return (
    <div
      className={compositeStyles(
        "rounded-rounded p-small-0.5 size-[60px] border transition duration-300 ease-out hover:cursor-pointer hover:brightness-50",
        {
          "border-[#9C231D]": isError,
          "border-border-action-primary-default border-2": isActive,
          "border-border-general-primary": !isActive && !isError,
        },
        className
      )}
      onClick={onClick}
    >
      <div className="relative size-full">
        {renderIcon()}
        {onCancel && (
          <Button
            className="bg-icon-general-primary absolute top-[3px] end-[3px] size-[10px] rounded-full"
            color="none"
            size="none"
            startIcon={
              <SVGIcon
                src="/icons/outlined/closed-v3.svg"
                className="text-icon-general-inverse"
                width={6}
                height={6}
              />
            }
            onClick={onCancel}
          />
        )}
      </div>
    </div>
  );
};

export default EditImageCard;
