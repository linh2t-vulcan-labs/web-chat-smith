import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { Button } from "@/components/button-ds";
import { QrAppMobileButton } from "@/components/sidebar-promo";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { useGlobalState } from "@/store/global/hooks";
import { SIDEBAR_MENU_ID } from "@/utils/constants/common";

import GetProMobileGuest from "../get-pro/get-pro-mobile-guest";
import UserDropdownGuest from "../user-dropdown/user-dropdown-guest";
import type { GuestSidebarContentProps } from "./types";

const GuestSidebarContentMobile: React.FC<GuestSidebarContentProps> = ({
  isExpanded,
  menuItems,
  onMenuClick,
}) => {
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);
  const t = useTranslations("mainLayout.sidebarV2");
  const newChatLabel = t("newChat");
  const sidebarState = isExpanded ? "expanded" : "collapsed";

  const handleCloseSidebarClick = () => {
    toggleSidebar();
  };

  return (
    <div className="p-v1-structural-component-micro flex w-full flex-col items-start">
      {/* Header */}
      <div
        data-sidebar="header"
        data-state={sidebarState}
        className={cn("group w-full", "flex items-center justify-between")}
      >
        <div
          className={cn(
            "px-v1-1 py-v1-3 flex w-full items-center overflow-hidden"
          )}
        >
          <button
            type="button"
            data-state={sidebarState}
            className="gap-v1-4 inline-flex flex-1 items-center"
            onClick={() => onMenuClick?.(SIDEBAR_MENU_ID.HOME)}
          >
            <Image
              src="/images/logo-v3.svg"
              width={32}
              height={32}
              alt="logo"
            />
            <h1 className="typo-v1-markdown-h3 flex-1 text-start whitespace-nowrap">
              Chat Smith
            </h1>
          </button>
          <div className="gap-v1-3 p-v1-1 inline-flex items-center justify-center">
            <QrAppMobileButton />

            <Button
              variant="ghost"
              className="p-0!"
              iconOnly
              suffixIcon={<SvgIcon name="x" size={20} />}
              onClick={handleCloseSidebarClick}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex w-full flex-1 flex-col">
        <ul className="list-none">
          <li className="flex flex-col">
            <button
              type="button"
              className={cn(
                "gap-v1-structural-content-micro py-v1-structural-content-tight px-v1-structural-content-normal rounded-v1-medium box-border",
                "flex w-full items-center ring-1 ring-transparent"
              )}
              onClick={() => onMenuClick?.(SIDEBAR_MENU_ID.NEW_CHAT)}
            >
              <div>
                <SvgIcon name="plus" />
              </div>
              <label className="typo-v1-action-md-light text-v1-text-hierarchy-primary px-v1-structural-content-micro text-center">
                {newChatLabel}
              </label>
            </button>
          </li>
          {menuItems?.map((item) => (
            <li className="flex flex-col" key={item.id}>
              <button
                type="button"
                className={cn(
                  "gap-v1-structural-content-micro py-v1-structural-content-tight px-v1-structural-content-normal rounded-v1-medium box-border",
                  "flex w-full items-center ring-1 ring-transparent"
                )}
                onClick={() => onMenuClick?.(item.id)}
              >
                <div>{item.icon}</div>
                <label className="typo-v1-action-md-light text-v1-text-hierarchy-primary px-v1-structural-content-micro text-center">
                  {item.label}
                </label>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="gap-v1-optical-4 flex w-full flex-col">
        <GetProMobileGuest />
        <UserDropdownGuest isMobile />
      </div>
    </div>
  );
};

export default GuestSidebarContentMobile;
