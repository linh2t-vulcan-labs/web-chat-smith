import { useTranslations } from "next-intl";
import type { TooltipRenderProps } from "react-joyride";

import { ButtonV2 } from "@/components/button-v2";

export function CustomTooltip({
  continuous,
  index,
  step,
  primaryProps,
  skipProps,
  size,
  isLastStep,
}: TooltipRenderProps) {
  const ctaT = useTranslations("common.cta");
  const conversationT = useTranslations("conversationPage.guideTour");

  return (
    <div className="max-w-[246px] rounded-rounded bg-[#EDEDED] p-small-0.25">
      {step.content}
      <div className="flex items-center justify-between gap-small-0.75 py-small-0.5 ps-small-1 pe-small-0.5">
        <span className="text-footnoteS-neutral text-text-general-tertiary">
          {index + 1} {conversationT("others.of")} {size}
        </span>
        <div className="flex gap-small-0.75">
          {continuous && !isLastStep && (
            <ButtonV2
              {...skipProps}
              className="!text-footnoteM-highlight"
              color="text"
              size="xxs"
            >
              {ctaT("skip")}
            </ButtonV2>
          )}
          <ButtonV2
            {...primaryProps}
            className="!text-footnoteM-highlight"
            size="xxs"
          >
            {isLastStep ? ctaT("gotIt") : ctaT("next")}
          </ButtonV2>
        </div>
      </div>
    </div>
  );
}
