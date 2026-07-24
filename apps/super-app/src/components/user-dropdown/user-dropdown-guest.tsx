import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import React, { useState } from "react";

import { AccountStatusBadge } from "@/components/account-status-badge";
import { AvatarBadge } from "@/components/avatar-badge";
import { Button } from "@/components/button-ds";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { AtomicOptionItem } from "@/components/option-item";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { AVATAR_DEFAULT_URL } from "@/config/urls";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { LIST_LANGUAGE_SUPPORTED } from "@/i18n/constant";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { compositeStyles } from "@/utils/commons/styles";
import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";

interface Props {
  isMobile?: ReactNode;
}

const UserDropdownGuest: React.FC<Props> = ({ isMobile = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { showLoginModal, openSubscriptionModal } = useFeatureGating();
  const guestId = useGuestState((state) => state.anonId);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const t = useTranslations("loginPage.loginForm.guestPanel");
  const mainLayoutT = useTranslations("mainLayout");
  const loginPageT = useTranslations("loginPage");
  const commonT = useTranslations("common");
  const locale = useLocale();

  const dropdownContentWidth =
    locale === LIST_LANGUAGE_SUPPORTED.JA ? "w-56" : "w-52";

  const handleUpgradeToProClick = () => {
    sendTrackingEvent({
      name: EventKeys.NewUpgradeClick,
      payload: { guest_id: guestId || "", trigger: "profile" },
    });
    openSubscriptionModal();
    setMenuOpen(false);
  };

  const handleSignInFooterClick = () => {
    showLoginModal("sidebar");
    setMenuOpen(false);
  };

  const handleContactUsClick = () => {
    sendTrackingEvent({
      name: EventKeys.NewProfileClick,
      payload: { guest_id: guestId || "", trigger: "contact_us" },
    });
    setMenuOpen(false);
  };

  return (
    <div
      className={cn({
        "p-v1-structural-content-normal bg-v1-surface-hierarchy-raised rounded-v1-large border-v1-border-structural-default gap-v1-structural-content-tight flex w-full items-center border":
          isMobile,
      })}
    >
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger className="focus-visible:outline-none">
          <div className="gap-v1-structural-content-tight flex w-full">
            <AvatarBadge avatarUrl={AVATAR_DEFAULT_URL} size="large" />
            {isMobile && (
              <div className="gap-v1-structural-content-tight flex w-full flex-1 items-center justify-between">
                <div className="gap-v1-structural-content-micro flex flex-col">
                  <div className="flex items-start">
                    <AccountStatusBadge size="sm">
                      {commonT("free")}
                    </AccountStatusBadge>
                  </div>
                  <p className="typo-v1-body-default-strong text-v1-text-hierarchy-primary">
                    {loginPageT("loginForm.guestPanel.guest")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isMobile ? "top" : "right"}
          sideOffset={24}
          className={compositeStyles(
            "rounded-v1-medium border-v1-border-structural-subtle bg-v1-surface-hierarchy-raised relative w-52 border-4",
            dropdownContentWidth
          )}
          style={isMobile ? {} : { bottom: 10 }}
        >
          {!isMobile && (
            <div className="rounded-v1-standard bg-v1-glass-neutral-6 dark:bg-v1-surface-glass-light-airy p-v1-structural-content-tight gap-v1-4 mb-v1-structural-content-relaxed flex items-center">
              <div className="flex flex-col">
                <div className="typo-v1-title-lg text-v1-text-hierarchy-primary">
                  {t("guest")}
                </div>
                <div className="typo-v1-support-micro text-v1-text-hierarchy-secondary">
                  {t("descV2")}
                </div>
              </div>
              <div className="bg-v1-surface-glass-light-mist rounded-v1-circle flex size-10 items-center justify-center p-[3.33px]">
                <AvatarBadge avatarUrl={AVATAR_DEFAULT_URL} />
              </div>
            </div>
          )}
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
          <DropdownMenuItem asChild>
            <a
              href={LINK_NEED_HELP_CONST}
              className="gap-v1-structural-content-tight flex items-center"
              onClick={handleContactUsClick}
            >
              <SvgIcon name="mail" size={20} />
              <div className="typo-v1-action-md-light cursor-pointer">
                {commonT("contactUs")}
              </div>
            </a>
          </DropdownMenuItem>
          {!isMobile && (
            <div className="mt-v1-structural-content-tight flex flex-col">
              <Button
                className="bg-v1-action-background-primary rounded-v1-circle"
                onClick={handleSignInFooterClick}
              >
                {commonT("signIn")}
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isMobile && (
        <div className="flex flex-1 justify-end">
          <Button
            className="bg-v1-action-background-primary rounded-v1-circle"
            onClick={handleSignInFooterClick}
          >
            {commonT("signIn")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserDropdownGuest;
