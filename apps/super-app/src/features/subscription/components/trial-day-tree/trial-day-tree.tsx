import { useLocale, useTranslations } from "next-intl";
import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { getSubscriptionDueDate } from "../../utils/helpers";
import { BorderTrialBadge } from "../border-trial-badge";
import { GradientTrialBadge } from "../gradient-trial-badge";

interface Props {
  price: string;
  theme?: "light" | "dark";
}

const TrialDayTree: React.FC<Props> = ({ price, theme = "dark" }) => {
  const locale = useLocale();
  const dsT = useTranslations("ds");
  return (
    <div className="mb-small-0.5 flex items-center justify-between">
      <div className="gap-small-0.75 ps-medium-2.5 relative flex flex-col">
        <div
          className="top-medium-1.5 bg-text-general-tertiary absolute h-1/2 w-px"
          style={{ left: 3.5 }}
        />
        <div className="relative flex min-h-6 items-center">
          <span className="-left-medium-2.5 h-small-1 w-small-1 bg-text-general-tertiary absolute flex items-center justify-center rounded-full" />
          <p className="text-footnoteM-neutral text-text-general-quaternary">
            {dsT("info.dueToday")}
          </p>
        </div>
        <div className="relative flex items-center">
          <span className="-left-medium-2.5 h-small-1 w-small-1 bg-text-general-tertiary absolute flex items-center justify-center rounded-full" />
          <p
            className={compositeStyles(
              "text-footnoteM-neutral text-text-general-quaternary"
            )}
          >
            {dsT("info.due")} {getSubscriptionDueDate(locale)}
          </p>
        </div>
      </div>
      <div className="gap-small-0.5 flex flex-col items-end">
        <div className="gap-small-1 flex items-center">
          {theme === "dark" ? (
            <GradientTrialBadge content={dsT("pricing.dayFree")} />
          ) : (
            <BorderTrialBadge content={dsT("pricing.dayFree")} />
          )}

          <span
            className={compositeStyles(
              "text-footnoteM-highlight font-bold",
              theme === "dark"
                ? "text-text-general-secondary"
                : "dark:text-text-general-inverse"
            )}
          >
            $0.00
          </span>
        </div>
        <div
          className={compositeStyles(
            "text-footnoteM-neutral",
            theme === "dark"
              ? "text-text-general-secondary"
              : "dark:text-text-general-inverse"
          )}
        >
          {price}
        </div>
      </div>
    </div>
  );
};

export default TrialDayTree;
