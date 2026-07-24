import { useTranslations } from "next-intl";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { EXPRESS_CHECKOUT_MODELS } from "@/config/build-on-models";

export const ExpressionSubscriptionBuildOn = () => {
  const dsT = useTranslations("ds");

  return (
    <div className="gap-medium-1.5 flex flex-col">
      <div className="text-bodyS-highlight text-text-general-primary text-center">
        {dsT("allInOneAI")}
      </div>
      <div className="flex items-center justify-around">
        {EXPRESS_CHECKOUT_MODELS.map((model, idx) => (
          <div className="gap-small-0.5 flex items-center" key={idx}>
            <SVGIcon
              className="rounded-soft hidden md:inline-block"
              src={model.logo}
              width={32}
              height={32}
            />
            <SVGIcon
              className="rounded-circle inline-block md:hidden"
              src={model.logoMobile}
              width={20}
              height={20}
            />
            <span className="text-footnoteS-neutral text-text-general-secondary md:text-footnoteM-highlight">
              {model.name}
            </span>
          </div>
        ))}
        <span className="text-footnoteM-neutral text-text-general-secondary text-center">
          {dsT("andMore")}
        </span>
      </div>
    </div>
  );
};
