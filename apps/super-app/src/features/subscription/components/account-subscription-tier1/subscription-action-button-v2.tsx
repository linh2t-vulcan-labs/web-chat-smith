import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/button";
import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import type { TSubscriptionActionButtonV2Props } from "../../types/common";

export const SubscriptionActionButtonV2: React.FC<
  TSubscriptionActionButtonV2Props
> = ({ disabled, isTrial, showCancel = true, theme = "dark", onContinue }) => {
  const dsT = useTranslations("ds");
  return (
    <div className="gap-medium-1.25 flex flex-col">
      <Button
        type="button"
        disabled={Boolean(disabled)}
        onClick={onContinue}
        className="rounded-rounded text-bodyM-highlight text-text-general-secondary order-1 h-[36px] font-medium md:order-2"
      >
        {isTrial ? dsT("trialSubmit") : dsT("submit")}
        <SVGIcon
          className="text-text-general-primary hidden md:inline-block rtl:rotate-180"
          src="/icons/outlined/arrow-right-v2.svg"
          width={24}
          height={24}
        />
      </Button>
      {showCancel && (
        <div className="gap-small-1 py-small-0.25 order-2 flex items-center justify-center md:order-1">
          <SVGIcon
            className="text-text-general-primary"
            src="/icons/filled/time.svg"
            width={16}
            height={16}
          />
          <span
            className={compositeStyles(
              "text-footnoteM-highlight md:text-bodyS-highlight",
              theme === "light"
                ? "dark:text-text-general-inverse"
                : "text-text-general-secondary"
            )}
          >
            {dsT("cancelAnytime")}
          </span>
        </div>
      )}
    </div>
  );
};
