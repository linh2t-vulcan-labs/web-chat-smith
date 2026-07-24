import { useToggle } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";

import { Button } from "@/components/button-ds";
import { GetProMobile, QrAppMobileButton } from "@/components/sidebar-promo";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { useNotification } from "@/features/notification/provider/notification-provider";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { SIDEBAR_MENU_ID } from "@/utils/constants/common";

import { UserDropdown } from "../user-dropdown";
import ConversationHeader from "./conversation-header";
import ConversationHistory from "./conversation-history";
import type { SidebarContentProps } from "./types";

const NotificationModal = dynamic(
  () =>
    import("@/features/notification/components/notification-modal/notification-modal")
);

const SidebarMobile: React.FC<SidebarContentProps> = ({
  isExpanded,
  menuItems,
  onMenuClick,
}) => {
  const t = useTranslations("mainLayout.sidebarV2");
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);
  const userId = useGlobalState((state) => state.user.id);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const [openNotificationModal, toggleNotificationModal] = useToggle(false);
  const {
    refetchUnreadCount,
    shouldFetchNotifications,
    unReadCount,
    enableNotificationFetch,
  } = useNotification();

  const handleClickNotificationBell = () => {
    if (userId) {
      sendTrackingEvent({
        name: EventKeys.NewNavbarClick,
        payload: { trigger: "notification", vulcan_user_id: userId },
      });
    }
    refetchUnreadCount();
    toggleNotificationModal();
    if (!shouldFetchNotifications) {
      enableNotificationFetch();
    }
  };

  const handleCloseNotification = () => {
    toggleNotificationModal(false);
  };

  const handleCloseSidebarClick = () => {
    toggleSidebar();
  };

  const sidebarState = isExpanded ? "expanded" : "collapsed";
  const newChatLabel = t("newChat");

  return (
    <>
      <div className="p-v1-2 flex w-full flex-col items-start">
        {/* Header */}
        <div
          data-sidebar="header"
          data-state={sidebarState}
          className={cn("group w-full", "flex items-center justify-between")}
        >
          <div
            className={cn(
              "py-v1-4 px-v1-1 flex w-full items-center overflow-hidden"
            )}
          >
            <button
              type="button"
              data-state={sidebarState}
              className="gap-v1-2 inline-flex flex-1 items-center"
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
              <div className="relative inline-block leading-0">
                <Button
                  variant="ghost"
                  className={cn(
                    "-m-1.5 box-border rounded-xl border border-transparent",
                    {
                      "border-v1-border-structural-default":
                        openNotificationModal,
                    }
                  )}
                  size="xs"
                  iconOnly
                  suffixIcon={<SvgIcon name="bell" size={20} />}
                  onClick={handleClickNotificationBell}
                />
                {unReadCount > 0 && (
                  <span className="badge end-v1-optical-2 absolute top-0 inline-flex size-2 items-center justify-center rounded-full">
                    <i className="size-small-0.75 min-w-small-0.75 inline-block rounded-full bg-green-300" />
                  </span>
                )}
              </div>
              <QrAppMobileButton />
              <Button
                variant="ghost"
                className="-m-1.5"
                size="xs"
                iconOnly
                suffixIcon={<SvgIcon name="x" size={20} />}
                onClick={handleCloseSidebarClick}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="gap-v1-3 pb-v1-2 relative flex min-h-0 w-full flex-1 flex-col items-start">
          <div className="flex w-full flex-col">
            <div className="px-v1-3 py-v1-2 flex flex-col">
              <button
                type="button"
                className="gap-x-v1-structural-content-micro flex w-max items-center"
                onClick={() => onMenuClick?.(SIDEBAR_MENU_ID.NEW_CHAT)}
              >
                <div>
                  <SvgIcon size={24} name="plus" />
                </div>
                <label className="typo-v1-action-md-light text-v1-text-hierarchy-primary px-v1-structural-content-micro text-center">
                  {newChatLabel}
                </label>
              </button>
            </div>
            <ul className="mb-v1-structural-section-compact list-none">
              {menuItems
                ?.filter((item) => item.id !== SIDEBAR_MENU_ID.HISTORY)
                .map((item) => (
                  <li className="flex flex-col" key={item.id}>
                    <button
                      type="button"
                      data-assistant-id={item.id}
                      className={cn(
                        "gap-x-v1-structural-content-micro px-v1-3 py-v1-2 rounded-v1-medium box-border",
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
            <ConversationHeader />
          </div>
          {/* Conversation list */}
          <ConversationHistory shouldFetch />
        </div>

        {/* Footer */}
        <div className="gap-v1-optical-2 flex w-full flex-col">
          <GetProMobile />
          <div className="p-v1-structural-content-normal bg-v1-surface-hierarchy-raised rounded-v1-large border-v1-border-structural-default mt-v1-2 w-full border">
            <UserDropdown isMobile={true} />
          </div>
        </div>
      </div>
      <NotificationModal
        open={openNotificationModal}
        onClose={handleCloseNotification}
      />
    </>
  );
};

export default SidebarMobile;
