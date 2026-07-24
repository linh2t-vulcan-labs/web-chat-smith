"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { cn } from "@/components/utils/cn";
import { useIsEnablePaddleCheckout } from "@/hooks/remote-config/use-enable-paddle-checkout";
import { useGlobalState } from "@/store/global/hooks";

import { useHandleManageSubscriptionMechanism } from "../hooks/use-handle-manage-subscription-mechanism";
import { EManageAccountModalTab } from "../types";
import ManageAccountSidebarItem from "./manage-account-sidebar-item";
import type { TManageAccountSidebarProps } from "./types";

export default function ManageAccountSidebar(
  props: TManageAccountSidebarProps
) {
  const { activeTab, isDesktop = true, onTabChange } = props;
  const activeItemRef = useRef<HTMLDivElement>(null);
  const { isInlineManageSubscriptionMechanism } =
    useHandleManageSubscriptionMechanism();
  const isEnablePaddleCheckoutFeature = useIsEnablePaddleCheckout();
  const mainLayoutT = useTranslations("mainLayout");
  const paymentVendorOfSubscriptionUser = useGlobalState(
    (state) => state.paymentVendorOfSubscriptionUser
  );

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, [activeTab]);

  const items = [
    {
      enabled: true,
      icon: (
        <SVGIcon
          src="/icons/outlined/setting-v3.svg"
          className="text-text-general-primary dark:text-v1-neutral-200"
          width={24}
          height={24}
        />
      ),
      id: EManageAccountModalTab.GENERAL,
      isActive: activeTab === EManageAccountModalTab.GENERAL,
      onClick: () => onTabChange(EManageAccountModalTab.GENERAL),
      title: mainLayoutT("generalTab"),
    },
    {
      enabled:
        isInlineManageSubscriptionMechanism &&
        isEnablePaddleCheckoutFeature &&
        paymentVendorOfSubscriptionUser !== "stripe",
      icon: (
        <SVGIcon
          src="/icons/outlined/plan-v2.svg"
          className="text-text-general-primary dark:text-v1-neutral-200"
          width={24}
          height={24}
        />
      ),
      id: EManageAccountModalTab.MY_PLAN,
      isActive: activeTab === EManageAccountModalTab.MY_PLAN,
      onClick: () => onTabChange(EManageAccountModalTab.MY_PLAN),
      title: mainLayoutT("myPlan"),
    },
    {
      enabled: true,
      icon: (
        <SVGIcon
          src="/icons/outlined/info-square-v2.svg"
          className="text-text-general-primary dark:text-v1-neutral-200"
          width={24}
          height={24}
        />
      ),
      id: EManageAccountModalTab.HELP_CENTER,
      isActive: activeTab === EManageAccountModalTab.HELP_CENTER,
      onClick: () => onTabChange(EManageAccountModalTab.HELP_CENTER),
      title: mainLayoutT("helpCenter.title"),
    },
  ];

  return (
    <div
      className={cn(
        "gap-small-1 flex flex-row",
        "md:gap-v1-structural-content-micro md:flex-col"
      )}
    >
      {items.map((item) => {
        if (!item.enabled) {
          return null;
        }

        return (
          <div key={item.id} ref={item.isActive ? activeItemRef : undefined}>
            <ManageAccountSidebarItem
              title={item.title}
              icon={item.icon}
              isActive={item.isActive}
              isDesktop={isDesktop}
              // oxlint-disable-next-line react/jsx-handler-names -- forwarded from the sidebar item config object, not a local handler
              onClick={item.onClick}
            />
          </div>
        );
      })}
    </div>
  );
}
