"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import React, { useRef } from "react";

import { AccountStatusBadge } from "@/components/account-status-badge";
import { AvatarBadge } from "@/components/avatar-badge";
import { HorizontalDivider } from "@/components/divider/divider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { MarqueeText } from "@/components/marquee-text";
import { AtomicOptionItem } from "@/components/option-item";
import { SvgIcon } from "@/components/svg-icon-ds";
import { useUserInfoActions } from "@/components/user-info/hooks/use-user-info-actions";
import { useUserInfoState } from "@/components/user-info/hooks/use-user-info-state";
import { useHandleManageSubscriptionMechanism } from "@/features/manage-account-modal/hooks/use-handle-manage-subscription-mechanism";
import { useIsEnablePaddleCheckout } from "@/hooks/remote-config/use-enable-paddle-checkout";
import { LIST_LANGUAGE_SUPPORTED } from "@/i18n/constant";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";
import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";

interface Props {
  isMobile?: ReactNode;
}

const UserDropdown: React.FC<Props> = ({ isMobile = false }) => {
  const t = useTranslations("common");
  const mainLayoutT = useTranslations("mainLayout");
  const locale = useLocale();

  const state = useUserInfoState();
  const actions = useUserInfoActions(state);
  const { handleManageSubscription } = actions;
  const isEnablePaddleCheckoutFeature = useIsEnablePaddleCheckout();
  const { isInlineManageSubscriptionMechanism } =
    useHandleManageSubscriptionMechanism();
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const dsVersion = useGlobalState((state) => state.dsVersion);
  const userId = useGlobalState((state) => state.user.id);
  const paymentVendorOfSubscriptionUser = useGlobalState(
    (state) => state.paymentVendorOfSubscriptionUser
  );
  const { sendTrackingEvent } = useSendTrackingEvent();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownContentWidth =
    locale === LIST_LANGUAGE_SUPPORTED.JA ? "w-56" : "w-52";

  const fallbackName = t("unknownUser");
  const {
    user,
    userSubscriptionInfo: { isValidPremiumUser, isExpired },
  } = state;
  const displayName = user.username ?? fallbackName;
  const displayEmail = user.email ?? fallbackName;

  const getAccountStatusLabel = () => {
    if (isValidPremiumUser) {
      return t("pro");
    }
    if (isExpired) {
      return t("expire");
    }
    return t("free");
  };

  const handleManageAccountClick = () => {
    if (user.id) {
      sendTrackingEvent({
        name: EventKeys.MainProfile,
        payload: { vulcan_user_id: userId },
      });
      sendTrackingEvent({
        name: EventKeys.NewProfileClick,
        payload: { trigger: "account", vulcan_user_id: user.id },
      });
    }
    actions.handleOpenManageAccountModal();
  };

  const handleUpgradeToProClick = () => {
    setIsOpenSubscriptionModal(true, "user_menu");
    if (user.id) {
      sendTrackingEvent({
        name: EventKeys.NewUpgradeClick,
        payload: { trigger: "profile", vulcan_user_id: user.id },
      });
      sendTrackingEvent({
        name: EventKeys.DSOpen,
        payload: {
          ds_version: dsVersion,
          vulcan_source: "user_menu",
          vulcan_user_id: user.id,
        },
      });
    }
  };

  const handleContactUsClick = () => {
    if (user.id) {
      sendTrackingEvent({
        name: EventKeys.NewProfileClick,
        payload: { trigger: "contact_us", vulcan_user_id: user.id },
      });
    }
    actions.handleContactUs();
  };

  const handleLogOutClick = async () => {
    await actions.handleLogOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:outline-none">
        <div className="gap-v1-structural-content-tight flex">
          <AvatarBadge
            avatarUrl={user.avatar}
            size="large"
            isPremium={isValidPremiumUser}
            isExpired={isExpired}
          />
          {isMobile && (
            <div className="gap-v1-structural-content-micro flex flex-col">
              <div className="flex items-start">
                <AccountStatusBadge
                  size="sm"
                  isExpired={isExpired}
                  isPremium={isValidPremiumUser}
                >
                  {getAccountStatusLabel()}
                </AccountStatusBadge>
              </div>
              <p className="typo-v1-body-default-strong text-v1-text-hierarchy-primary">
                {displayName}
              </p>
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? "top" : "right"}
        sideOffset={28}
        className={compositeStyles(
          "rounded-v1-medium border-v1-border-structural-subtle bg-v1-surface-hierarchy-raised relative border-4",
          dropdownContentWidth
        )}
        style={isMobile ? {} : { bottom: 10 }}
      >
        {!isMobile && (
          <div className="mb-v1-structural-content-tight rounded-v1-standard bg-v1-glass-neutral-6 dark:bg-v1-surface-glass-light-airy p-v1-structural-content-tight flex items-center gap-4">
            <div className="flex flex-col">
              <div className="typo-v1-title-lg text-v1-text-hierarchy-primary line-clamp-1">
                {displayName}
              </div>
              <div
                className="typo-v1-support-micro text-v1-text-hierarchy-secondary w-29 overflow-hidden"
                ref={containerRef}
              >
                <MarqueeText containerRef={containerRef}>
                  {displayEmail}
                </MarqueeText>
              </div>
            </div>
            <AvatarBadge
              avatarUrl={user.avatar}
              isPremium={isValidPremiumUser}
              isExpired={isExpired}
            />
          </div>
        )}

        <DropdownMenuItem
          className="gap-v1-structural-content-tight flex items-center justify-between"
          onClick={handleManageAccountClick}
        >
          <AtomicOptionItem
            type="inline"
            icon={<SvgIcon name="user" size={20} />}
            label={mainLayoutT("manageAccount.account.title")}
            labelClassName="typo-v1-action-md-light"
          />
          <AccountStatusBadge
            size="sm"
            isExpired={isExpired}
            isPremium={isValidPremiumUser}
          >
            {getAccountStatusLabel()}
          </AccountStatusBadge>
        </DropdownMenuItem>
        {paymentVendorOfSubscriptionUser === "stripe" && isValidPremiumUser && (
          <DropdownMenuItem
            className="gap-v1-structural-content-tight flex items-center"
            onClick={() =>
              handleManageSubscription(
                isInlineManageSubscriptionMechanism,
                isEnablePaddleCheckoutFeature,
                paymentVendorOfSubscriptionUser
              )
            }
          >
            <AtomicOptionItem
              type="inline"
              icon={<SvgIcon name="crown" size={20} />}
              label={mainLayoutT("header.userInfo.manageSubscription")}
              labelClassName="typo-v1-action-md-light"
            />
          </DropdownMenuItem>
        )}
        {!isValidPremiumUser && (
          <DropdownMenuItem
            className="gap-v1-structural-content-tight flex items-center"
            onClick={handleUpgradeToProClick}
          >
            <AtomicOptionItem
              type="inline"
              icon={
                <SvgIcon
                  name="gold"
                  size={20}
                  className="text-v1-level-gold-icon"
                />
              }
              label={mainLayoutT("header.userInfo.upgradeToProV2")}
              labelClassName="typo-v1-action-md-light text-v1-level-gold-text"
            />
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild onClick={handleContactUsClick}>
          <a
            href={LINK_NEED_HELP_CONST}
            className="gap-v1-structural-content-micro flex items-center"
          >
            <SvgIcon name="mail" size={20} />
            <label className="px-v1-structural-content-micro typo-v1-action-md-light cursor-pointer">
              {t("contactUs")}
            </label>
          </a>
        </DropdownMenuItem>
        <HorizontalDivider className="my-v1-structural-content-tight" />
        <DropdownMenuItem
          className="gap-v1-structural-content-tight flex items-center"
          onClick={handleLogOutClick}
        >
          <AtomicOptionItem
            type="inline"
            icon={<SvgIcon name="logout" size={20} />}
            label={mainLayoutT("logout.title")}
            labelClassName="typo-v1-action-md-light capitalize"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
