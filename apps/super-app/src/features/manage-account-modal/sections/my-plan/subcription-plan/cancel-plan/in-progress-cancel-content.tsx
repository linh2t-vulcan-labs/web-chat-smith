import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { SvgIcon } from "@/components/svg-icon-ds";

import type { TInProgressCancelContentProps } from "./types";

function loseAccessDateStrong(chunks: ReactNode) {
  return <span className="typo-v1-body-default-strong">{chunks}</span>;
}

export default function InProgressCancelContent(
  props: TInProgressCancelContentProps
) {
  const { expiredAt } = props;
  const t = useTranslations("myPlan");
  return (
    <div className="typo-v1-body-default-normal text-v1-text-hierarchy-secondary flex flex-col">
      <div className="gap-v1-structural-component-large flex flex-col">
        <p>{t("cancel.reviewDescription")}</p>
        <p>
          {t.rich("cancel.loseAccessDescription", {
            date: expiredAt,
            strong: loseAccessDateStrong,
          })}
        </p>
      </div>
      <div className="gap-v1-structural-content-tight py-v1-structural-section-standard flex flex-col">
        <div className="gap-v1-optical-normal flex items-start">
          <SvgIcon
            name="circle-minus"
            size={24}
            className="text-v1-icons-status-error"
          />
          <p>{t("cancel.limitedHistory")}</p>
        </div>
        <div className="gap-v1-optical-normal flex items-start">
          <SvgIcon
            name="circle-minus"
            size={24}
            className="text-v1-icons-status-error"
          />
          <p>{t("cancel.noAiModels")}</p>
        </div>
        <div className="gap-v1-optical-normal flex items-start">
          <SvgIcon
            name="circle-minus"
            size={24}
            className="text-v1-icons-status-error"
          />
          <p>{t("cancel.removeCustomizations")}</p>
        </div>
        <div className="gap-v1-optical-normal flex items-start">
          <SvgIcon
            name="circle-minus"
            size={24}
            className="text-v1-icons-status-error"
          />
          <p>{t("cancel.loseUpcomingFeatures")}</p>
        </div>
      </div>
    </div>
  );
}
