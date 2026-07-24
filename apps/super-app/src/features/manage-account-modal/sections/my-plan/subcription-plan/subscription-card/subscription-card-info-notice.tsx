import { useTranslations } from "next-intl";

import { Badge } from "@/components/badge-ds";
import { Button } from "@/components/button-ds";
import { SVGIcon } from "@/components/svg-icon";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";

import { MyPlanSectionItemContainer } from "../../my-plan-section-item-container";
import type { TSubscriptionCardInfoNoticeProps } from "./types";

export default function SubscriptionCardInfoNoticeV2(
  props: TSubscriptionCardInfoNoticeProps
) {
  const { type = "free", onClick } = props;
  const t = useTranslations("myPlan");
  const commonT = useTranslations("common");
  const isFree = type === "free";

  const renderButtonNode = () => {
    if (isFree) {
      return (
        <Button
          variant="gold"
          size="l"
          className={cn("w-full text-nowrap md:w-fit")}
          prefixIcon={<SvgIcon name="gold" size={24} />}
          onClick={onClick}
        >
          {commonT("getProV2")}
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="l"
        onClick={onClick}
        className={cn("w-full text-nowrap md:w-fit")}
      >
        {t("actions.needHelp")}
      </Button>
    );
  };

  const renderContentNode = () => {
    if (isFree) {
      return (
        <>
          <span className="typo-v1-label-compact-default">
            {t("notice.featuresTitle")}
          </span>
          <ul className="space-y-medium-1.5 typo-v1-label-compact-default text-text-general-secondary">
            <li className="gap-x-v1-structural-content-tight flex items-center">
              <SVGIcon src="/icons/checked.svg" width={16} height={16} />
              <span className="typo-v1-label-compact-default">
                {t("notice.limitedDailyAccess")}
              </span>
            </li>
            <li className="gap-x-v1-structural-content-tight flex items-center">
              <SVGIcon src="/icons/checked.svg" width={16} height={16} />
              <span className="typo-v1-label-compact-default">
                {t("notice.basicWritingAssistant")}
              </span>
            </li>
            <li className="gap-x-v1-structural-content-tight flex items-center">
              <SVGIcon src="/icons/checked.svg" width={16} height={16} />
              <span className="typo-v1-label-compact-default">
                {t("notice.limitedFileUploads")}
              </span>
            </li>
            <li className="gap-x-v1-structural-content-tight flex items-center">
              <SVGIcon src="/icons/checked.svg" width={16} height={16} />
              <span className="typo-v1-label-compact-default">
                {t("notice.standardSecurityPrivacy")}
              </span>
            </li>
          </ul>
        </>
      );
    }

    return (
      <p className="typo-v1-body-secondary">
        {t("notice.mobileOnlyDescription")}
      </p>
    );
  };

  return (
    <MyPlanSectionItemContainer>
      <div className="gap-v1-structural-content-tight flex items-center">
        <span className="typo-v1-markdown-h1 text-v1-text-hierarchy-primary">
          {t("notice.headerTitle")}
        </span>
        <Badge.Level color={isFree ? "free" : "gold"} size="md">
          {isFree ? t("notice.badgeFree") : t("notice.badgePro")}
        </Badge.Level>
      </div>
      <div className="gap-y-v1-structural-content-normal py-v1-structural-content-tight text-v1-text-hierarchy-primary flex flex-col">
        {renderContentNode()}
      </div>
      {renderButtonNode()}
    </MyPlanSectionItemContainer>
  );
}
