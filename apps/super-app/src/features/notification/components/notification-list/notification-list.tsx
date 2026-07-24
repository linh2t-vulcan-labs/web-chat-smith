import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

import { useNotification } from "@/features/notification/provider/notification-provider";
import { useImageCache } from "@/hooks/use-image-cache";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import { useMarkAsRead } from "../../hooks/use-mark-as-read";
import { EmptyConversation } from "../empty-notification";
import type { TNotificationListProps } from "../notification-center/types";
import { NotificationItem } from "../notification-item";
import { NotificationSkeleton } from "../notification-skeleton";

const NotificationList: React.FC<TNotificationListProps> = ({
  isOnline,
  onNotificationClick,
}) => {
  const {
    loading,
    notifications,
    hasNextPage,
    error,
    loadMore,
    reloadNotifications,
  } = useNotification();
  const [isBumping, setIsBumping] = useState(false);

  const markAsReadMutation = useMarkAsRead();
  const userId = useGlobalState((state) => state.user.id);
  const { sendTrackingEvent } = useSendTrackingEvent();

  const t = useTranslations("mainLayout.header.notification");

  const upToDateRef = useRef<HTMLDivElement>(null);
  const hasTriggeredBump = useRef(false);

  // Use image cache for no-connection image
  const { cachedImage: preloadedImage, isLoading: isImageLoading } =
    useImageCache("/images/no-connection.svg");

  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    // When there is an error, we stop infinite loading.
    // It can be reactivated by setting "error" state as undefined.
    disabled: Boolean(error),
    // `rootMargin` is passed to `IntersectionObserver`.
    // We can use it to trigger 'onLoadMore' when the sentry comes near to become
    // visible, instead of becoming fully visible on the screen.
    rootMargin: "0px 0px 400px 0px",
  });

  // Handle bump animation when upToDateRef comes into viewport (only once)
  useEffect(() => {
    if (!upToDateRef.current || hasNextPage || hasTriggeredBump.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !isBumping && !hasTriggeredBump.current) {
            setIsBumping(true);
            hasTriggeredBump.current = true;
            // Reset bump animation after 800ms
            setTimeout(() => {
              setIsBumping(false);
            }, 800);
          }
        }
      },
      {
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before element is fully visible
        threshold: 0.1, // Trigger when 10% of element is visible
      }
    );

    observer.observe(upToDateRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isBumping]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsReadMutation
      .mutateAsync({
        notificationIds: [notificationId],
        userId,
      })
      .catch(() => null);
  };

  if (!isOnline) {
    return (
      <div className="flex min-h-[400px] flex-col justify-center">
        {isImageLoading ? (
          <NotificationSkeleton itemCount={1} />
        ) : (
          <EmptyConversation
            type="internet"
            noConnectionImage={preloadedImage}
            onReload={() => {
              // Try to reload notifications when user clicks reload button
              reloadNotifications();
            }}
          />
        )}
      </div>
    );
  }

  if (loading === false && notifications.length === 0) {
    return (
      <div className="md:px-large-4 flex min-h-[400px] flex-col justify-center">
        <EmptyConversation />
      </div>
    );
  }
  const shouldAnimationBump = isBumping && notifications.length > 5;
  return (
    <>
      {notifications.length === 0 && loading ? (
        <NotificationSkeleton itemCount={6} />
      ) : (
        <div className="flex flex-col">
          {notifications.map((item, idx) => {
            const handleItemActivate = async () => {
              sendTrackingEvent({
                name: EventKeys.MainNotificationItem,
                payload: {
                  vulcan_user_id: userId,
                },
              });
              if (item.read === false) {
                await handleMarkAsRead(item.id);
              }
              onNotificationClick?.(item);
            };
            return (
              <React.Fragment key={item.id}>
                <div
                  className={compositeStyles(
                    "flex flex-col",
                    idx < notifications.length - 1 &&
                      "thickness-b-thin border-[#3131313d] dark:border-[#313131]"
                  )}
                  key={item.id}
                  onClick={handleItemActivate}
                >
                  <NotificationItem
                    active={item.read === false}
                    icon={item.imageUrl}
                    title={item.title}
                    description={item.content}
                    time={item.createdAt}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
      {hasNextPage && (
        <div ref={infiniteRef}>
          <NotificationSkeleton itemCount={3} />
        </div>
      )}
      {!hasNextPage && (
        <div
          ref={upToDateRef}
          className={`thickness-t-thin border-border-input-default py-large-4 text-bodyS-highlight text-text-general-tertiary/50 flex justify-center transition-all duration-300 ease-out ${
            shouldAnimationBump ? "animate-bump" : ""
          }`}
        >
          {t("upToDate")}
        </div>
      )}
    </>
  );
};

export default NotificationList;
