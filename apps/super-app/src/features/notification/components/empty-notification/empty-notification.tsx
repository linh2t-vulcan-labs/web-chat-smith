import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { Button } from "@/components/button";

import type { TEmptyConversationProps } from "./types";

const EmptyNotification: React.FC<TEmptyConversationProps> = ({
  type = "empty",
  onReload,
  noConnectionImage = "/images/no-connection.svg",
}) => {
  const t = useTranslations("common");
  const isLowInternet = type === "internet";

  return (
    <div className="gap-medium-3 flex flex-col items-center justify-center text-[#9e9e9e80]">
      {isLowInternet ? (
        <Image
          alt="No connection"
          src={noConnectionImage}
          width={64}
          height={64}
          priority
          unoptimized
        />
      ) : (
        <Image
          alt="No notifications"
          src="/images/empty-noti.svg"
          width={64}
          height={64}
        />
      )}
      <div className="gap-small-0.5 flex flex-col items-center justify-center">
        <div className="text-app-Title3">
          {isLowInternet
            ? t("couldntLoadNotifications")
            : t("noNotificationsYet")}
        </div>
        <div className="text-bodyS-neutral text-center">
          {isLowInternet
            ? t("errorLoadingNotifications")
            : t("weWillNotifyWhenNew")}
          .
        </div>
      </div>
      {onReload && (
        <Button
          className="rounded-rounded text-bodyS-highlight! text-text-general-primary h-[36px] font-normal"
          onClick={onReload}
        >
          {t("reload")}
        </Button>
      )}
    </div>
  );
};

export default EmptyNotification;
