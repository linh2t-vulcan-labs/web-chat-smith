"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Toast } from "radix-ui";
import React, { useRef } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { cn } from "@/components/utils/cn";
import type { TNotificationTrigger } from "@/libs/tracking-event";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";

import type { TConfirmToastOptions } from "../../types/common";
import { NOTIFICATION_CONFIRM_TEXT_DEFAULT } from "./constants";

interface NotificationConfirmDialogProps {
  open: boolean;
  isPremium?: boolean;
  userId: string;
  options?: TConfirmToastOptions;
  onOpenChange: (open: boolean) => void;
  onRequestPermission?: () => void;
}

const NotificationConfirmToast: React.FC<NotificationConfirmDialogProps> = ({
  open,
  userId,
  isPremium,
  options,
  onOpenChange,
  onRequestPermission,
}) => {
  const commonT = useTranslations("common");
  const { sendTrackingEvent } = useSendTrackingEvent();
  const toastCloseRef = useRef<HTMLButtonElement>(null);
  const toastPositionCls = isPremium
    ? "md:bottom-[116px]"
    : "md:bottom-[175px]";
  return (
    <Toast.Root
      open={open}
      duration={30_000}
      onOpenChange={onOpenChange}
      className={cn(
        "left-small-1 rtl:right-small-1 top-large-8 rounded-rounded bg-surface-general-tertiary dark:bg-icon-general-primary p-small-0.25 fixed right-auto w-[284px] shadow-md sm:w-[332px] md:top-auto md:left-[86px] rtl:left-auto md:rtl:right-[86px] md:rtl:left-auto dark:shadow-none",
        toastPositionCls
      )}
    >
      <Toast.Close
        asChild
        className="end-medium-1.25 top-small-0.75 md:right-small-0.5 md:top-small-0.5 absolute"
      >
        <button
          type="button"
          aria-label="Close"
          className="hidden"
          ref={toastCloseRef}
        />
      </Toast.Close>
      {/* <span className="left-medium-2.5 border-b-medium border-l-medium border-r-medium md:right-large-5 md:rtl:left-large-10 absolute -top-1 right-auto inline-block size-0 -translate-x-1/2 border-x-transparent border-b-white md:left-auto md:hidden md:rtl:right-auto"></span> */}
      <span className="start-medium-2.5 border-b-medium border-s-medium border-e-medium md:right-large-5 md:rtl:left-large-10 rtl:right-medium-2.5 absolute -top-1 end-auto inline-block size-0 -translate-x-1/2 border-x-transparent border-b-white md:left-auto md:hidden md:rtl:right-auto" />
      <span className="md:right-large-5 md:rtl:-right-medium-1.5 md:top-large-6 -left-small-0.75 absolute -top-1 end-auto hidden size-0 border-t-[6px] border-e-[6px] border-b-[6px] border-y-transparent border-e-white md:inline-block md:rtl:left-auto md:rtl:border-l-[6px] md:rtl:border-y-transparent md:rtl:border-r-transparent md:rtl:border-l-white" />
      <div className="gap-small-0.25 flex">
        <Image
          className="rounded-soft h-[110px] w-[102px] object-cover md:size-[102px]"
          src="/images/notification-bell.png"
          width={102}
          height={102}
          alt="Bell"
        />
        <div className="flex flex-col justify-between">
          <div className="ps-small-1 pt-small-1 rtl:pr-small-1 rtl:pl-small-0 flex flex-col">
            <div className="text-footnoteM-bold! text-text-general-inverse">
              {options?.title ??
                commonT(NOTIFICATION_CONFIRM_TEXT_DEFAULT.TITLE)}
            </div>
            <p className="pe-medium-1.25 rtl:pl-medium-1.25 rtl:pr-small-0 text-footnoteS-neutral text-text-general-quaternary font-medium!">
              {options?.description ??
                commonT(NOTIFICATION_CONFIRM_TEXT_DEFAULT.DESCRIPTION)}
            </p>
          </div>
          <div className="p-small-0.5 flex justify-end">
            <ButtonV2
              size="small"
              color="text"
              className="px-medium-1.5! py-small-0.75! text-footnoteM-highlight!"
              onClick={() => {
                const triggerName = options?.triggerName;
                sendTrackingEvent({
                  name: EventKeys.MainNotificationSkipPermission,
                  payload: {
                    trigger: triggerName as TNotificationTrigger,
                    vulcan_user_id: userId,
                  },
                });
                toastCloseRef.current?.click();
              }}
            >
              {commonT("notification.skip")}
            </ButtonV2>
            <ButtonV2
              size="small"
              className="px-medium-1.5! py-small-0.75! text-footnoteM-highlight!"
              onClick={() => {
                const triggerName = options?.triggerName;
                sendTrackingEvent({
                  name: EventKeys.MainNotificationEnablePermission,
                  payload: {
                    trigger: triggerName as TNotificationTrigger,
                    vulcan_user_id: userId,
                  },
                });
                onRequestPermission?.();
              }}
            >
              {commonT("notification.enableNow")}
            </ButtonV2>
          </div>
        </div>
      </div>
    </Toast.Root>
  );
};

export default NotificationConfirmToast;
