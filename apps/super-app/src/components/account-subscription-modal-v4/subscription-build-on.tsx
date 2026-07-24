import { useTranslations } from "next-intl";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { MODELS } from "@/config/build-on-models";

export const SubscriptionBuildOn = () => {
  const dsT = useTranslations("ds");

  return (
    <div className="flex flex-col gap-medium-1.5">
      <div className="text-center text-bodyM-highlight text-text-general-secondary opacity-50">
        {dsT("builtOn")}
      </div>
      <div className="flex justify-around px-medium-2 md:px-small-0">
        {MODELS.map((model, idx) => (
          <div className="flex items-center gap-small-0.5" key={idx}>
            <SVGIcon
              className="hidden rounded-soft md:inline-block"
              src={model.logo}
              width={32}
              height={32}
            />
            <SVGIcon
              className="inline-block rounded-soft md:hidden"
              src={model.logoMobile}
              width={20}
              height={20}
            />
            <span className="text-footnoteS-neutral text-text-general-secondary md:text-footnoteM-highlight">
              {model.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
