import { useTranslations } from "next-intl";
import React, { useState } from "react";

import { Button } from "@/components/button-ds";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { SIDEBAR_MENU_ID } from "@/utils/constants/common";

import type { TSidebarBodyProps, TSidebarMenuItem } from "./types";

export const SidebarBody: React.FC<TSidebarBodyProps> = ({
  menuItems,
  onNewChat,
  onMenuChange,
  activeMenuId,
}) => {
  const t = useTranslations("mainLayout.sidebarV2");
  const newChatLabel = t("newChat");
  const commonT = useTranslations("common");
  const [open, setOpen] = useState(false);

  const handleClickMenuItem = (item: TSidebarMenuItem) => {
    setOpen(false);
    onMenuChange?.(item);
  };

  return (
    <div className="gap-v1-structural-section-compact max-xl:landscape:gap-v1-structural-component-medium relative flex min-h-0 flex-1 flex-col items-center overflow-x-hidden overflow-y-auto 2xl:overflow-hidden">
      <div className="flex flex-col">
        <button
          type="button"
          className="gap-v1-optical-subtle group/item flex flex-col items-center"
          onClick={onNewChat}
        >
          <div
            className={cn(
              "p-v1-structural-content-micro rounded-v1-medium thickness-v1-subtle border border-transparent transition-all duration-300",
              "group-hover/item:bg-v1-surface-overlay-interactive-hover group-hover/item:border-v1-border-interactive-hover",
              {
                "border-v1-border-interactive-hover bg-v1-surface-overlay-interactive-hover":
                  activeMenuId === SIDEBAR_MENU_ID.NEW_CHAT,
              }
            )}
          >
            <SvgIcon
              size={24}
              name="plus"
              className="text-v1-icons-hierarchy-primary"
            />
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
            className="gap-v1-optical-subtle rounded-v1-standard hidden w-max flex-col overflow-visible hover:bg-transparent focus:bg-transparent max-lg:landscape:flex"
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

            <label className="typo-v1-title-sm text-v1-text-hierarchy-primary">
              {commonT("cta.more")}
            </label>
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
                    "bg-v1-surface-overlay-interactive-selected":
                      activeMenuId === item.id,
                  }
                )}
                key={item.id}
              >
                <button
                  type="button"
                  className="gap-v1-structural-content-micro group/item rounded-v1-medium px-v1-structural-content-tight py-v1-structural-component-micro flex items-center hover:cursor-pointer"
                  onClick={() => handleClickMenuItem(item)}
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
      <ul className="space-y-v1-structural-section-compact block list-none max-lg:landscape:hidden">
        {menuItems?.map((item) => (
          <li className="flex flex-col" key={item.id}>
            <button
              type="button"
              className="gap-v1-optical-subtle group/item rounded-v1-medium flex flex-col items-center hover:cursor-pointer"
              onClick={() => onMenuChange?.(item)}
            >
              <div
                className={cn(
                  "p-v1-structural-content-micro rounded-v1-medium thickness-v1-subtle box-border border border-transparent transition-all duration-300",
                  "group-hover/item:bg-v1-surface-overlay-interactive-hover group-hover/item:border-v1-border-interactive-hover",
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

      <hr className="mt-v1-structural-component-micro border-v1-border-status-divider border-v1-subtle block w-full border-t max-xl:landscape:hidden" />
    </div>
  );
};
