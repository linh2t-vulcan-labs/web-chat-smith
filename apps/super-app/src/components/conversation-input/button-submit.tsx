"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { compositeStyles } from "@/utils/commons/styles";

import type { TSubmitButton, TSubmitButtonStatus } from "./types";

const buttonSubmitStatusColor: Record<TSubmitButtonStatus, string> = {
  active: "text-text-action-secondary-default",
  inactive: "text-text-action-tertiary-default",
};

export default forwardRef(
  (
    { disabled = false, onClick }: TSubmitButton,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const { pending } = useFormStatus();
    const isDisabled = disabled || pending;

    const svgIconColor = isDisabled
      ? buttonSubmitStatusColor["inactive"]
      : buttonSubmitStatusColor["active"];

    return (
      <Button
        ref={ref}
        className="transition-none"
        disabled={isDisabled}
        color={isDisabled ? "neutral" : "primary"}
        rounded="default"
        // type="submit"
        size="baseIcon"
        startIcon={
          <Icon
            name="send"
            size={24}
            className={compositeStyles(
              svgIconColor,
              "text-text-general-inverse dark:text-text-action-secondary-default"
            )}
          />
          // <SVGIcon
          //   className={compositeStyles(svgIconColor)}
          //   src={"/icons/filled/send.svg"}
          //   width={24}
          //   height={24}
          // />
        }
        onClick={onClick}
      />
    );
  }
);
