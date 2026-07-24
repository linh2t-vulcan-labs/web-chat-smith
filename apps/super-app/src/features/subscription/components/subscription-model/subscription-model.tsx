import { useTranslations } from "next-intl";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import { SUBSCRIPTION_MODELS } from "../../constants/subscription";

const SubscriptionModel = ({
  direction = "vertical",
}: {
  direction?: "vertical" | "horizontal";
}) => {
  const dsT = useTranslations("ds");
  return (
    <div
      className={compositeStyles(
        "flex items-center",
        direction === "vertical"
          ? "gap-small-1 flex-col"
          : "gap-medium-3 flex-row"
      )}
    >
      <div className="text-bodyS-highlight text-text-general-secondary md:text-bodyM-highlight text-center">
        {dsT("builtOn")}
      </div>
      <div className="gap-medium-2 flex items-center">
        {SUBSCRIPTION_MODELS.map((model, idx) => (
          <div className="gap-small-0.5 flex items-center" key={idx}>
            <SVGIcon
              className="rounded-soft hidden md:inline-block"
              src={model.logo}
              width={24}
              height={24}
            />
            <SVGIcon
              className="rounded-soft inline-block md:hidden"
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

export default SubscriptionModel;
