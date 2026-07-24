import { useTranslations } from "next-intl";
import React, { useState } from "react";

import { Button } from "@/components/button-ds";
import { ButtonTrigger } from "@/components/select-trigger-2";
import { SvgIcon } from "@/components/svg-icon-ds";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/features/manage-account-modal/components/accordion/accordion";
import { useMediaQuery } from "@/hooks/use-media-query";

import { MyPlanSectionItemContainer } from "../my-plan-section-item-container";
import { BillingContent } from "./billing";
import { SubscriptionCardInfo } from "./subscription-card";
import type { TManageSubscriptionItem } from "./types";

interface TSubscriptionAccordionItemProps {
  item: TManageSubscriptionItem;
  onCancelClick: (subscriptionId: string) => void;
  onUpdatePlanClick: (subscriptionId: string) => void;
}

function SubscriptionAccordionItem({
  item,
  onCancelClick,
  onUpdatePlanClick,
}: TSubscriptionAccordionItemProps) {
  const t = useTranslations("myPlan");
  const itemValue = `subscription-${item.id}`;
  const [isExpanded, setIsExpanded] = useState(false);
  const isLargeScreen = useMediaQuery("md");

  const handleValueChange = (value: string | undefined) => {
    setIsExpanded(value === itemValue);
  };

  const handleCancelClick = () => onCancelClick(item.id);
  const handleUpdatePlanClick = () => onUpdatePlanClick(item.id);

  return (
    <MyPlanSectionItemContainer>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={isExpanded ? itemValue : ""}
        onValueChange={handleValueChange}
      >
        <AccordionItem
          value={itemValue}
          className="gap-v1-structural-component-large md:gap-v1-structural-section-standard flex flex-col"
        >
          <SubscriptionCardInfo
            planInfo={item.planInfo}
            onCancelClick={handleCancelClick}
            onUpdatePlanClick={handleUpdatePlanClick}
            triggerNode={
              isLargeScreen ? (
                <AccordionTrigger asChild>
                  <ButtonTrigger
                    size="md"
                    intent="utility"
                    className="text-nowrap before:hidden"
                  >
                    {isExpanded
                      ? t("accordion.showLess")
                      : t("accordion.manageSubscription")}
                  </ButtonTrigger>
                </AccordionTrigger>
              ) : null
            }
          />
          {!isLargeScreen && (
            <AccordionTrigger asChild>
              <Button
                variant="outline"
                size="l"
                className="w-full items-center justify-center"
              >
                <span className="pe-small-1">
                  {isExpanded
                    ? t("accordion.showLess")
                    : t("accordion.manageSubscription")}
                </span>
                <SvgIcon
                  name="chevron-down"
                  size={24}
                  className="trigger-arrow transition-transform"
                />
              </Button>
            </AccordionTrigger>
          )}
          <AccordionContent className="md:pr-small-0.25">
            <BillingContent
              subscriptionId={item.id}
              subscriptionPlanInfo={item.planInfo}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </MyPlanSectionItemContainer>
  );
}

// Each item's props (`item`, and the now subscriptionId-based `onCancelClick`/
// `onUpdatePlanClick`) stay referentially stable across unrelated re-renders
// of the parent (cancel flow loading, other modals opening) — memo skips
// re-rendering every accordion item when only one part of the page changes.
export default React.memo(SubscriptionAccordionItem);
