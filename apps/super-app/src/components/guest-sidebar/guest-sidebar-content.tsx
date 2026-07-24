"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState } from "react";

import { Button } from "@/components/button-ds";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { QrAppDesktopButton } from "@/components/sidebar-promo";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { SIDEBAR_MENU_ID } from "@/utils/constants/common";

import GetProDesktopGuest from "../get-pro/get-pro-desktop-guest";
import UserDropdownGuest from "../user-dropdown/user-dropdown-guest";
import type { GuestSidebarContentProps } from "./types";

const GuestSidebarContent: React.FC<GuestSidebarContentProps> = ({
  menuItems,
  onMenuClick,
}) => {
  const t = useTranslations("mainLayout.sidebarV2");
  const newChatLabel = t("newChat");
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-v1-surface-hierarchy-base gap-v1-structural-section-standard px-v1-structural-content-normal border-v1-border-status-divider py-v1-structural-content-relaxed flex h-full w-18.5 min-w-18.5 flex-col border-e">
      {/* Header */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onMenuClick?.(SIDEBAR_MENU_ID.HOME)}
        >
          <Image src="/images/logo-v3.svg" width={32} height={32} alt="logo" />
        </button>
      </div>
      {/* Body */}
      <div className="space-y-v1-structural-section-compact relative flex min-h-0 flex-1 flex-col items-center">
        <div className="flex flex-col">
          <button
            type="button"
            className="gap-v1-optical-subtle group/menuItem flex flex-col items-center"
            onClick={() => onMenuClick?.(SIDEBAR_MENU_ID.NEW_CHAT)}
          >
            <div className="p-v1-structural-content-micro rounded-v1-medium group-hover/menuItem:bg-v1-surface-overlay-interactive-hover thickness-v1-subtle group-hover/menuItem:border-v1-border-interactive-hover border border-transparent">
              <SvgIcon size={24} name="plus" />
            </div>
            <label className="typo-v1-title-sm text-v1-text-hierarchy-primary">
              {newChatLabel}
            </label>
          </button>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="utility"
              size="xs"
              className="gap-v1-optical-subtle rounded-v1-standard hidden w-max flex-col max-xl:landscape:flex"
              iconOnly
            >
              <div
                className={cn(
                  "p-v1-structural-content-micro rounded-v1-medium thickness-v1-subtle box-border border border-transparent",
                  "group-hover/item:bg-v1-surface-overlay-interactive-hover group-hover/item:border-v1-border-interactive-hover",
                  {
                    "border-v1-border-interactive-hover bg-v1-surface-overlay-interactive-hover":
                      open,
                  }
                )}
              >
                <SvgIcon
                  name="ellipsis-vertical"
                  className="text-v1-icons-hierarchy-primary min-w-6"
                  size={24}
                />
              </div>

              <span className="typo-v1-title-sm text-v1-text-hierarchy-primary">
                More
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            sideOffset={28}
            className="rounded-v1-xl p-v1-structural-content-tight border-v1-border-structural-subtle thickness-v1-heavy relative z-99 flex w-52 flex-col overflow-hidden"
          >
            <ul className="flex w-full list-none flex-col">
              {menuItems?.map((item) => (
                <li
                  className={cn(
                    "rounded-v1-medium flex flex-col",
                    "group-hover/item:bg-v1-surface-overlay-interactive-hover",
                    {
                      "bg-v1-surface-overlay-interactive-selected": item.active,
                    }
                  )}
                  key={item.id}
                >
                  <button
                    type="button"
                    className="gap-v1-structural-content-micro group/item rounded-v1-medium px-v1-structural-content-tight py-v1-structural-component-micro flex items-center hover:cursor-pointer"
                    onClick={() => onMenuClick?.(item.id)}
                  >
                    <div
                      className={cn(
                        "rounded-v1-medium box-border ring-1 ring-transparent"
                      )}
                    >
                      {item.icon}
                    </div>
                    <label className="typo-v1-title-sm text-v1-text-hierarchy-primary text-center">
                      {item.label}
                    </label>
                  </button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        <ul className="space-y-v1-structural-section-compact list-none max-xl:landscape:hidden">
          {menuItems?.map((item) => (
            <li className="flex flex-col" key={item.id}>
              <button
                type="button"
                className="gap-v1-optical-subtle group/menuItem flex flex-col items-center"
                onClick={() => onMenuClick?.(item.id)}
              >
                <div
                  className={cn(
                    "p-v1-structural-content-micro rounded-v1-medium thickness-v1-subtle box-border border border-transparent",
                    "group-hover/menuItem:bg-v1-surface-overlay-interactive-hover box-border",
                    {
                      "border-v1-border-interactive-hover bg-v1-surface-overlay-interactive-hover":
                        item.active,
                    }
                  )}
                >
                  {item.icon}
                </div>
                <label className="typo-v1-title-sm text-v1-text-hierarchy-primary text-center">
                  {item.label}
                </label>
              </button>
            </li>
          ))}
        </ul>
        <hr className="border-v1-subtle border-v1-border-status-divider mt-v1-structural-component-micro w-full border-t" />
      </div>
      {/* Footer */}
      <div className="gap-v1-structural-section-compact max-xl:landscape:gap-v1-structural-component-micro flex flex-col items-center">
        <QrAppDesktopButton />
        <GetProDesktopGuest />
        <UserDropdownGuest />
      </div>
    </div>
  );
};

export default GuestSidebarContent;
