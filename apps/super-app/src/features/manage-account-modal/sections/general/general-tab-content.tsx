"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

import AccountStatusBadge from "@/components/account-status-badge/account-badge";
import AvatarBadge from "@/components/avatar-badge/avatar-badge";
import { MarqueeText } from "@/components/marquee-text";
import { useUserInfoState } from "@/components/user-info/hooks/use-user-info-state";
import { cn } from "@/components/utils/cn";
import { compositeStyles } from "@/utils/commons/styles";

import type { TGeneralTabContentProps } from "./types";

export default function GeneralTabContent(props: TGeneralTabContentProps) {
  const { title, description, avatarProps, prefixNode } = props;
  const titleContainerRef = useRef<HTMLHeadingElement>(null);
  const descriptionContainerRef = useRef<HTMLParagraphElement>(null);
  const isExistMarqueeText = !!avatarProps;
  const state = useUserInfoState();
  const { isValidPremiumUser, isExpired } = state.userSubscriptionInfo;

  const t = useTranslations("common");

  let premiumBadgeLabel: string;
  if (isValidPremiumUser) {
    premiumBadgeLabel = t("pro");
  } else if (isExpired) {
    premiumBadgeLabel = t("expire");
  } else {
    premiumBadgeLabel = t("free");
  }

  return (
    <div className="gap-small-1 flex w-full items-center justify-between">
      <div className="gap-v1-structural-content-normal flex w-full items-center">
        {avatarProps && (
          <div className="flex items-center justify-center">
            <AvatarBadge
              avatarUrl={avatarProps.imageURL}
              size="xlarge"
              color={avatarProps.color}
              className={cn(
                avatarProps.className,
                "flex items-center justify-center"
              )}
              isPremium={isValidPremiumUser}
              isExpired={isExpired}
            >
              {avatarProps.children || ""}
            </AvatarBadge>
          </div>
        )}
        <div
          className={compositeStyles("flex w-full flex-col", {
            "gap-v1-structural-content-micro": avatarProps,
          })}
        >
          <h2
            ref={titleContainerRef}
            className={compositeStyles(
              "text-v1-text-hierarchy-primary overflow-hidden",
              avatarProps
                ? `typo-v1-body-default-strong max-w-[calc(100%-64px)]`
                : `typo-v1-title-md-normal max-w-full`
            )}
          >
            {isExistMarqueeText ? (
              <MarqueeText containerRef={titleContainerRef}>
                {title}
              </MarqueeText>
            ) : (
              title
            )}
          </h2>
          {description && (
            <p
              ref={descriptionContainerRef}
              className={compositeStyles(
                "text-text-general-tertiary typo-v1-caption-mdhelper-text line-clamp-2 overflow-hidden",
                isExistMarqueeText
                  ? `max-w-[calc(100%-64px)]`
                  : `text-v1-text-hierarchy-secondary max-w-full`
              )}
            >
              {isExistMarqueeText ? (
                <AccountStatusBadge
                  size="sm"
                  isExpired={isExpired}
                  isPremium={isValidPremiumUser}
                >
                  {premiumBadgeLabel}
                </AccountStatusBadge>
              ) : (
                description
              )}
            </p>
          )}
        </div>
      </div>
      {prefixNode}
    </div>
  );
}
