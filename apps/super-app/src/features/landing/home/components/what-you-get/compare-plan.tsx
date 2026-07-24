"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";

import type { TSanityHomePage } from "@/libs/sanity";
import { compositeStyles } from "@/utils/commons/styles";

import { BenefitIcon } from "./constants";
import { TaskCard } from "./task-card";

const PLAN_TYPE = [
  {
    id: "1",
    label: "Free",
  },
  {
    id: "2",
    label: "Chat Smith Pro",
  },
];

const ComparePlan = ({
  isDesktop,
  data,
}: {
  isDesktop?: boolean;
  data: TSanityHomePage;
}) => {
  const { plan } = data;
  const [activePlan, setActivePlan] = useState(PLAN_TYPE[1]?.id ?? "2");
  const t = useTranslations("landingPage.plan");

  const handleClickPlan = (planId: string) => {
    setActivePlan(planId);
  };

  const ProPlanTabActive = activePlan === "2";

  return (
    <div>
      {/* Tabs header */}
      <div className="no-scrollbar my-medium-2.5 flex justify-between space-x-medium-3 overflow-x-auto border-y-thin border-white/20 md:my-large-6 md:hidden md:overflow-x-hidden">
        {PLAN_TYPE.map((plan) => (
          <button
            type="button"
            className={compositeStyles(
              "relative w-max flex-1 whitespace-nowrap px-small-1 py-medium-1.5 text-Heading-h6 after:absolute after:-bottom-px after:left-0 after:h-small-0.25 after:w-full md:w-auto md:py-medium-2",
              {
                "text-text-highlight after:bg-text-highlight":
                  activePlan === plan.id,
                "text-white/80 after:bg-transparent": activePlan !== plan.id,
              }
            )}
            key={plan.id}
            onClick={() => handleClickPlan(plan.id)}
          >
            {plan.label}
          </button>
        ))}
      </div>
      {/* Task header desktop */}
      <div className="mb-medium-1.5 hidden justify-between gap-small-1 md:flex">
        <div className="flex-1 ps-medium-2 text-Heading-h5 text-white/90 opacity-85">
          {t("sectionTitle")}
        </div>
        <div className="w-[180px] text-center text-Heading-h5 opacity-85">
          {t("freeLabel")}
        </div>
        <div className="w-[180px] text-center text-Heading-h5 font-medium text-text-highlight">
          {t("proLabel")}
        </div>
      </div>
      {/* Tabs content */}
      <div className="flex flex-col gap-small-1">
        {plan?.benefits?.map((benefit, idx) => {
          if (!isDesktop && !ProPlanTabActive && benefit.isProPlan) {
            return null;
          }
          return (
            <TaskCard
              key={`task-${idx.toString()}`}
              feature={benefit.title || ""}
              description={benefit.description || ""}
              icon={BenefitIcon[idx % 6] ?? ""}
              limit={benefit.isLimit}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ComparePlan;
