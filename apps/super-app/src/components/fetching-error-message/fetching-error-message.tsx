"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import { ButtonV2 } from "../button-v2";
import type { TFetchingErrorMessageProps } from "./types";

const FetchingErrorMessage: React.FC<TFetchingErrorMessageProps> = ({
  text,
  align = "center",
  size = "medium",
  onRetry,
}) => {
  const commonT = useTranslations("common");

  return (
    <div
      className={compositeStyles(
        "flex size-full items-center",
        align === "center" && "justify-center",
        align === "left" && "justify-start"
      )}
    >
      <div className="gap-small-0.75 flex items-center justify-center">
        <SVGIcon
          src="/icons/outlined/error-triangle.svg"
          width={16}
          height={16}
        />
        <span
          className={compositeStyles(
            "text-text-tomato-red",
            size === "medium" && "text-bodyS-neutral",
            size === "small" && "text-footnoteM-neutral"
          )}
        >
          {text}
        </span>
        <ButtonV2
          type="button"
          color="text"
          className="text-footnoteM-link! text-text-action-primary-default px-0! font-normal! underline"
          onClick={onRetry}
        >
          {commonT("cta.tryAgain")}
        </ButtonV2>
      </div>
    </div>
  );
};

export default FetchingErrorMessage;
