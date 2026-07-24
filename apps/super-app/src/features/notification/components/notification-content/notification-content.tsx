import { useTranslations } from "next-intl";
import React, { useEffect } from "react";
import { toast } from "sonner";

import type { NotificationModel } from "@/core/models/notification";
import { useMediaQuery } from "@/hooks/use-media-query";
import useNetwork from "@/hooks/use-network";
import { useRouter } from "@/i18n/navigation";
import { useConversationState } from "@/store/conversation/hooks";
import { getCurrentPathAndSearchParams } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

import { useMarkAllAsRead } from "../../hooks/use-mark-all-as-read";
import { useSmallWindowHeight } from "../../hooks/use-small-window-height";
import { useNotification } from "../../provider/notification-provider";
import { NotificationList } from "../notification-list";
import type { TNotificationContentProps } from "./types";

function getListMaxHeightClassName(
  isDesktop: boolean,
  isSmallWindow: boolean
): string {
  if (!isDesktop) {
    return "max-h-[calc(100dvh-200px)] min-h-[calc(100dvh-200px)]";
  }
  if (isSmallWindow) {
    return "max-h-[440px]";
  }
  return "max-h-[600px]";
}

const NotificationContent: React.FC<TNotificationContentProps> = ({
  isMobile,
  onMarkAllAsReadSuccess,
  onNotificationClick,
}) => {
  const isOnline = useNetwork();
  const isSmallWindow = useSmallWindowHeight();
  const isDesktop = useMediaQuery("md", { defaultValue: true });
  const router = useRouter();
  const resetConversationStore = useConversationState(
    (state) => state.resetStore
  );

  const t = useTranslations("mainLayout.header.notification");

  const { shouldFetchNotifications, unReadCount, enableNotificationFetch } =
    useNotification();
  const markAllAsReadMutation = useMarkAllAsRead();

  useEffect(() => {
    if (isMobile && !shouldFetchNotifications) {
      enableNotificationFetch();
    }
  }, [isMobile, shouldFetchNotifications, enableNotificationFetch]);

  const handleMarkAllRead = async () => {
    await markAllAsReadMutation
      .mutateAsync()
      .then(() => {
        onMarkAllAsReadSuccess?.();
      })
      .catch(() => {
        toast.error(null, {
          description: "Oops! Failed to update notifications.",
        });
        return null;
      });
  };

  const handleNotificationClick = (item: NotificationModel) => {
    onNotificationClick?.(Boolean(item.link));
    const currentPath = getCurrentPathAndSearchParams();
    if (item.link && item.link !== currentPath) {
      resetConversationStore({ selectedId: "" });
      router.push(item.link);
    }
  };

  return (
    <div className="notification-content">
      <div
        className={compositeStyles(
          "py-medium-2 pl-medium-2 flex items-center justify-between",
          isMobile ? "pr-large-6" : "pr-medium-2"
        )}
      >
        <h3 className="text-bodyL-highlight text-text-general-secondary">
          {t("title", { count: unReadCount })}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={compositeStyles(
              "text-footnoteM-neutral cursor-pointer",
              isOnline
                ? "text-text-general-tertiary underline"
                : "text-[#9e9e9e80] no-underline opacity-90"
            )}
            title={t("markAllAsRead")}
            onClick={handleMarkAllRead}
            disabled={unReadCount === 0 || !isOnline}
          >
            <span>{t("markAllAsRead")}</span>
          </button>
        </div>
      </div>
      <div
        className={compositeStyles(
          "overflow-x-hidden overflow-y-auto",
          getListMaxHeightClassName(isDesktop, isSmallWindow)
        )}
      >
        <NotificationList
          isOnline={Boolean(isOnline)}
          onNotificationClick={handleNotificationClick}
        />
      </div>
    </div>
  );
};

export default NotificationContent;
