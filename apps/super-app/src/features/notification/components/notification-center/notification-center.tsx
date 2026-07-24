"use client";

import { Popover } from "radix-ui";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { useMediaQuery } from "@/hooks/use-media-query";
import { debounce } from "@/libs/lodash-es";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

import { useNotification } from "../../provider/notification-provider";
import { NotificationContent } from "../notification-content";

interface Props {
  triggerAriaLabel?: string;
}

export default function NotificationCenter({
  triggerAriaLabel = "Open notifications",
}: Props) {
  const [open, setOpen] = useState(false);
  const userId = useGlobalState((state) => state.user.id);
  const isDesktop = useMediaQuery("md");

  const { sendTrackingEvent } = useSendTrackingEvent();

  const {
    shouldFetchNotifications,
    unReadCount,
    enableNotificationFetch,
    refetchUnreadCount,
  } = useNotification();

  // Create debounced function using useRef to maintain reference across renders
  const debounceGetUnreadCountRef = useRef(
    debounce(() => {
      refetchUnreadCount();
    }, 3000)
  );

  const debounceGetUnreadCount = useCallback(() => {
    debounceGetUnreadCountRef.current();
  }, []);

  // Cleanup debounced function on unmount
  useEffect(() => {
    const debouncedFn = debounceGetUnreadCountRef.current;
    return () => {
      debouncedFn.cancel();
    };
  }, []);

  const handleBellClick = () => {
    // Enable notification fetching on first click
    if (!shouldFetchNotifications) {
      enableNotificationFetch();
    }

    // Always open popover immediately
    setOpen(true);
  };

  if (!isDesktop) {
    return null;
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(toggleTo) => {
        if (toggleTo === true) {
          sendTrackingEvent({
            name: EventKeys.MainNotificationBell,
            payload: {
              vulcan_user_id: userId,
            },
          });
          sendTrackingEvent({
            name: EventKeys.NewNavbarClick,
            payload: { trigger: "notification", vulcan_user_id: userId },
          });
          debounceGetUnreadCount();
        }
        setOpen(toggleTo);
      }}
    >
      <Popover.Trigger asChild>
        <Button
          aria-label={triggerAriaLabel}
          variant="ghost"
          size="xs"
          iconOnly
          className={cn(
            "text-v1-icons-hierarchy-primary hover:border-v1-border-interactive-hover relative box-border rounded-xl border border-transparent transition-all duration-200",
            {
              "border-v1-border-structural-default": open,
            }
          )}
          onClick={handleBellClick}
        >
          <SvgIcon name="bell" size={24} />
          {unReadCount > 0 && (
            <span className="badge end-v1-1 top-v1-1 absolute inline-flex size-2 items-center justify-center rounded-full p-0.5 dark:bg-[#020202]">
              <i className="size-small-0.75 min-w-small-0.75 inline-block rounded-full bg-green-300" />
            </span>
          )}
        </Button>
        {/* <button
          aria-label={triggerAriaLabel}
          className="focus:ring-ring relative hidden cursor-pointer items-center justify-center outline-hidden focus:outline-hidden md:inline-flex"
          onClick={handleBellClick}
        >
          <div className="inline-block">
            <SvgIcon name="bell" size={20} />
          </div>
          {unReadCount > 0 && (
            <span className="badge right-small-0.25 top-medium-1.25 absolute inline-flex size-2 items-center justify-center rounded-full bg-[#020202] p-0.5">
              <i className="size-small-0.75 min-w-small-0.75 inline-block rounded-full bg-green-300" />
            </span>
          )}
        </button> */}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="center"
          side="right"
          sideOffset={33}
          alignOffset={0}
          className="rounded-overlays-dropdown-border-radius thickness-thin border-border-input-default bg-surface-general-primary z-20 max-w-[304px] min-w-[304px] overflow-hidden"
        >
          <NotificationContent isMobile={false} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
