import { useTranslations } from "next-intl";
import React from "react";

import { SafeImage } from "@/features/notification/components/safe-image";
import { compositeStyles } from "@/utils/commons/styles";

import type { TNotificationItemProps } from "../notification-center/types";

type TimeAgoTranslations = (
  key: string,
  values?: Record<string, number | string>
) => string;

/**
 * timeAgoByUnix with translation support (en, ar, es, th, zh).
 * Use with t from useTranslations("common") so current locale is applied.
 */
function timeAgoByUnixWithTranslation(
  input: string | number,
  t: TimeAgoTranslations
): string {
  const now = Math.floor(Date.now() / 1000);
  const timestamp =
    typeof input === "string" ? Math.trunc(Number(input)) : input;

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diff = now - timestamp;
  if (Number.isNaN(diff) || diff < 0) {
    return "";
  }

  if (diff < 5) {
    return t("timeAgo.justNow");
  }
  if (diff < 60) {
    return t("timeAgo.secondsAgo", { count: diff });
  }
  if (diff < 3600) {
    return t("timeAgo.minutesAgo", { count: Math.floor(diff / 60) });
  }
  if (diff < 86_400) {
    return t("timeAgo.hoursAgo", { count: Math.floor(diff / 3600) });
  }
  if (diff < 2_592_000) {
    return t("timeAgo.daysAgo", { count: Math.floor(diff / 86_400) });
  }
  if (diff < 31_536_000) {
    return t("timeAgo.monthsAgo", { count: Math.floor(diff / 2_592_000) });
  }

  return t("timeAgo.yearsAgo", { count: Math.floor(diff / 31_536_000) });
}

const NotificationItem: React.FC<TNotificationItemProps> = ({
  active,
  title,
  description,
  icon,
  time,
}) => {
  const commonT = useTranslations("common");
  return (
    <div
      className={compositeStyles(
        "p-medium-2 flex cursor-pointer",
        active ? "bg-surface-general-tertiary" : "bg-black-1000"
      )}
    >
      <div className="rounded-circle relative size-12 min-w-12">
        <SafeImage
          className="rounded-circle bg-text-general-brand-identity object-cover dark:bg-transparent"
          alt={title}
          fallbackSrc="/images/notification-icon-default.png"
          src={icon || "/images/notification-icon-default.png"}
          fill
          sizes="48px"
        />
        {active && (
          <span className="badge -left-small-0.25 top-small-0.25 h-medium-2 w-medium-2 bg-surface-general-secondary absolute inline-flex items-center justify-center rounded-full p-0.5">
            <i className="h-medium-1.5 min-w-medium-1.5 inline-block rounded-full bg-green-300" />
          </span>
        )}
      </div>
      <div className="gap-medium-2 ps-medium-2 flex flex-col">
        <div className="gap-small-0.5 flex flex-col">
          <div
            className={compositeStyles(
              "text-bodyS-highlight",
              active
                ? "text-text-general-secondary"
                : "text-text-general-tertiary"
            )}
          >
            {title}
          </div>
          <p
            className={compositeStyles(
              "text-footnoteM-neutral line-clamp-4",
              active
                ? "text-text-general-tertiary"
                : "text-text-general-quaternary"
            )}
          >
            {description}
          </p>
        </div>
        <p className="text-footnoteM-neutral text-text-general-tertiary">
          {timeAgoByUnixWithTranslation(time, commonT)}
        </p>
      </div>
    </div>
  );
};

export default NotificationItem;
