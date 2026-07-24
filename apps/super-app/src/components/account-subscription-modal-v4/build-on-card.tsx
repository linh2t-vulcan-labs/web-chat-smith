import { useLocale, useTranslations } from "next-intl";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { LIST_LANGUAGE_SUPPORTED } from "@/i18n/constant";
import { compositeStyles } from "@/utils/commons/styles";

import { productBenefits } from "./constants";
import { SubscriptionBuildOn } from "./subscription-build-on";

export const BuildOnCard = () => {
  const locale = useLocale();
  const dsT = useTranslations("ds");
  const commonT = useTranslations("common");
  const footerCls =
    locale === LIST_LANGUAGE_SUPPORTED.TH ||
    locale === LIST_LANGUAGE_SUPPORTED.ES
      ? "mt-large-5"
      : "mt-medium-3";
  return (
    <div className="rounded-default border-border-general-disabled bg-surface-general-tertiary p-large-4 flex h-full flex-col overflow-hidden border">
      {/* Header */}
      <SubscriptionBuildOn />
      {/* Body */}
      <div className="mt-large-5 gap-medium-1.5 flex flex-col">
        <div className="gap-small-1 flex justify-between">
          <div className="ps-medium-2 text-bodyM-highlight text-text-general-secondary rtl:pr-medium-2 uppercase">
            {dsT("yourBenefits")}
          </div>
          <div className="gap-x-medium-3 flex">
            <span className="px-small-0.5 text-bodyM-highlight min-w-7.5 uppercase">
              {commonT("free")}
            </span>
            <span className="dark:bg-gradient-yellow text-bodyM-highlight text-vul-yellow-400 min-w-7.5 uppercase dark:bg-clip-text dark:text-transparent">
              {commonT("pro")}
            </span>
          </div>
        </div>
        <div className="gap-small-1 flex flex-col">
          {/* GU-1573 */}
          {productBenefits.map((benefit, idx) => (
            <div
              className="gap-small-1 rounded-default dark:bg-gradiant-glassmorphism flex items-center justify-between"
              key={idx}
            >
              <div className="gap-medium-2 py-small-0.75 ps-medium-2 flex">
                <div className="py-small-0.75">
                  <SVGIcon
                    className="text-icon-general-primary"
                    src={benefit.icon}
                    width={24}
                    height={24}
                  />
                </div>
                <div className="gap-small-0.25 flex flex-col">
                  <h3 className="text-bodyS-highlight text-text-general-secondary">
                    {dsT(benefit.feature)}
                  </h3>
                  <p className="text-footnoteM-neutral text-text-general-quaternary">
                    {dsT(benefit.brief)}
                  </p>
                </div>
              </div>
              {/* Check */}
              <div className="gap-x-medium-3 flex items-center">
                {benefit.limit ? (
                  <span className="text-footnoteS-neutral text-text-general-secondary whitespace-nowrap">
                    {commonT("limited")}
                  </span>
                ) : (
                  <SVGIcon
                    className="me-small-0.25 text-text-general-primary"
                    src="/icons/filled/close-gray.svg"
                    width={24}
                    height={24}
                  />
                )}
                <div className="px-small-1">
                  <SVGIcon
                    className="text-text-general-primary"
                    src="/icons/filled/pro-check.svg"
                    width={24}
                    height={24}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className={compositeStyles("gap-medium-1.5 flex flex-col", footerCls)}
      >
        <div className="ps-medium-2 text-bodyM-highlight text-text-general-secondary rtl:pr-medium-2 opacity-50">
          {dsT("upcomingFeatures")}
        </div>
        {/* GU-1573 */}
        <div className="gap-medium-2 rounded-default dark:bg-gradiant-glassmorphism p-medium-2 flex justify-between">
          <div className="gap-small-0.75 flex items-center">
            <SVGIcon
              className="text-text-general-primary opacity-50"
              src="/icons/outlined/check.svg"
              width={16}
              height={16}
            />
            <span className="text-footnoteM-highlight text-text-general-secondary opacity-50">
              {dsT("AIAgents")}
            </span>
          </div>
          <div className="gap-small-0.75 flex items-center">
            <SVGIcon
              className="text-text-general-primary opacity-50"
              src="/icons/outlined/check.svg"
              width={16}
              height={16}
            />
            <span className="text-footnoteM-highlight text-text-general-secondary opacity-50">
              {dsT("videoGeneration")}
            </span>
          </div>
          <div className="gap-small-0.75 flex items-center">
            <SVGIcon
              className="text-text-general-primary opacity-50"
              src="/icons/outlined/check.svg"
              width={16}
              height={16}
            />
            <span className="text-footnoteM-highlight text-text-general-secondary opacity-50">
              {dsT("aiCompanion")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
