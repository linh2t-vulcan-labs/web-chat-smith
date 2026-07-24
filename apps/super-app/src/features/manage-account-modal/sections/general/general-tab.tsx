"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ButtonV2 } from "@/components/button-v2";
import { cn } from "@/components/utils/cn";
import { Switch } from "@/features/manage-account-modal/components/switch";
import { useNotification } from "@/features/notification/provider/notification-provider";
import { useDeleteAccountMutation } from "@/hooks/auth";
import useLocalStorage from "@/hooks/use-local-storage";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useAuthState } from "@/store/auth";
import { useGlobalState } from "@/store/global/hooks";
import { clearUserScopedStorage } from "@/utils/commons/helpers";
import { OPEN_SUGGESTIONS_KEY } from "@/utils/commons/keys";

import { SelectLanguage, SelectTheme } from "./components";
import GeneralTabGroupContent from "./general-tab-group-content";
import type {
  TConfirmModalProps,
  TConfirmModalType,
  TGeneralTabGroupContentProps,
} from "./types";

const LoadingProcessing = dynamic(
  () => import("@/components/loading-icon/loading-processing")
);

const ConfirmModal = dynamic(() => import("./confirm-modal"));

export default function GeneralTabSection() {
  const userInfo = useGlobalState((state) => state.user);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const resetGlobalStore = useGlobalState((state) => state.resetStore);
  const signOut = useAuthState((state) => state.signOut);
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const isEnabledThemeToggle = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.ENABLE_THEME_TOGGLE
  );
  const [isPendingLogout, startTransitionSignOut] = useTransition();
  const [isShowSuggestions, setIsShowSuggestion] = useLocalStorage(
    OPEN_SUGGESTIONS_KEY,
    true
  );

  const isLargeScreen = useMediaQuery("md");

  const {
    isExistActiveSubscriptionFromWeb,
    isExistActiveSubscriptionFromMobile,
  } = userSubscriptionInfo;

  const [confirmModalSetting, setConfirmModalSetting] = useState<
    Pick<TConfirmModalProps, "open" | "type">
  >({
    open: false,
    type: "",
  });

  const { isPending, mutateAsync: deleteAccount } = useDeleteAccountMutation();

  const isSpinning = isPendingLogout || isPending;

  const mainLayoutT = useTranslations("mainLayout");

  const commonT = useTranslations("common");

  const fallbackName = commonT("unknownUser");

  const displayUserName = userInfo.username || userInfo.email;

  const { sendTrackingEvent } = useSendTrackingEvent();

  const { firebasePushToken, unregisterPushToken } = useNotification();

  const handleSuggestionToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsShowSuggestion(event.target.checked);
    // Tracking ChatSuggestion
    sendTrackingEvent({
      name: EventKeys.ChatSuggestion,
      payload: {
        vulcan_status: event.target.checked ? "on" : "off",
        vulcan_user_id: userInfo.id,
      },
    });
  };

  const handleLogout = () => {
    sendTrackingEvent({
      name: EventKeys.MainLogout,
    });

    startTransitionSignOut(async () => {
      if (firebasePushToken) {
        await unregisterPushToken(firebasePushToken, true);
      }
      resetGlobalStore();
      await signOut();
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      const deletedUserId = userInfo.id;
      clearUserScopedStorage(deletedUserId);
      // Some still-mounted components may re-write their userId-scoped key
      // during the async logout teardown below (before the hard redirect to
      // /login actually happens) — sweep again right as the page unloads.
      window.addEventListener(
        "pagehide",
        () => clearUserScopedStorage(deletedUserId),
        { once: true }
      );
      handleLogout();
    } catch {
      toast.error(null, {
        description:
          "Something went wrong while deleting your account. Please try again later!",
      });
    }
  };

  const getDeleteAccountModalType = (): TConfirmModalType => {
    if (isExistActiveSubscriptionFromMobile) {
      return "delete-account-with-active-subscription-from-mobile";
    }
    if (isExistActiveSubscriptionFromWeb) {
      return "delete-account-with-active-subscription-from-web";
    }
    return "delete-account-no-active-subscription";
  };

  const onCloseDeleteAccountModal = () => {
    setConfirmModalSetting({
      open: false,
      type: "",
    });
  };

  const onOpenDeleteAccountModal = () => {
    setConfirmModalSetting({
      open: true,
      type: getDeleteAccountModalType(),
    });
  };

  const handleClickSignoutButton = () => {
    setConfirmModalSetting({
      open: true,
      type: "signout",
    });
  };

  const handleConfirmModal = () => {
    switch (confirmModalSetting.type) {
      case "signout": {
        handleLogout();
        break;
      }
      case "delete-account-no-active-subscription":
      case "delete-account-with-active-subscription-from-web": {
        handleDeleteAccount();
        break;
      }
      case "delete-account-with-active-subscription-from-mobile": {
        onCloseDeleteAccountModal();
        break;
      }
      default: {
        break;
      }
    }
  };

  const items: TGeneralTabGroupContentProps[] = [
    {
      description: mainLayoutT("manageAccount.account.description"),
      items: [
        {
          avatarProps: {
            alt: "user avatar",
            className: "relative",
            color: userInfo.avatarColor,
            imageURL: userInfo.avatar,
            size: "large",
          },
          description: userInfo.email,
          title: displayUserName || fallbackName,
        },
      ],
      title: mainLayoutT("manageAccount.account.title"),
    },
    {
      description: mainLayoutT("manageAccount.preference.description"),
      items: [
        {
          description: mainLayoutT("language.description"),
          prefixNode: (
            <SelectLanguage
              className={cn(
                "border-0 outline-0",
                "text-v1-action-text-secondary typo-v1-action-md-strong!"
              )}
              dropdownClassName={cn(
                "[&_.item-menu]:text-v1-action-text-secondary [&_.item-menu]:typo-v1-action-md-light"
              )}
            />
          ),
          title: mainLayoutT("language.title"),
        },
        ...(isEnabledThemeToggle
          ? [
              {
                description: mainLayoutT("theme.description"),
                prefixNode: (
                  <SelectTheme
                    className={cn(
                      "border-0 outline-0",
                      "text-v1-action-text-secondary typo-v1-action-md-strong!"
                    )}
                    dropdownClassName={cn(
                      "[&_.item-menu]:text-v1-action-text-secondary [&_.item-menu]:typo-v1-action-md-light"
                    )}
                  />
                ),
                title: mainLayoutT("theme.title"),
              },
            ]
          : []),
        {
          description: mainLayoutT("chatSuggestion.description"),
          prefixNode: (
            <Switch
              checked={isShowSuggestions}
              onChange={handleSuggestionToggle}
            />
          ),
          title: mainLayoutT("chatSuggestion.title"),
        },
      ],
      title: mainLayoutT("manageAccount.preference.title"),
    },
    {
      description: mainLayoutT("system.description"),
      items: [
        {
          description: mainLayoutT("logout.description"),
          prefixNode: (
            <ButtonV2
              color="outline"
              size={isLargeScreen ? "base" : "xxs"}
              className="!text-bodyS-highlight text-nowrap"
              onClick={handleClickSignoutButton}
            >
              {mainLayoutT("logout.title")}
            </ButtonV2>
          ),
          title: mainLayoutT("logout.title"),
        },
        {
          description: mainLayoutT("deleteAccount.description"),
          prefixNode: (
            <ButtonV2
              color="outline"
              size={isLargeScreen ? "base" : "xxs"}
              className="!text-bodyS-highlight text-nowrap"
              onClick={onOpenDeleteAccountModal}
            >
              {mainLayoutT("deleteAccount.title")}
            </ButtonV2>
          ),
          title: mainLayoutT("deleteAccount.title"),
        },
      ],
      title: mainLayoutT("system.title"),
    },
  ];

  return (
    <>
      {isSpinning && <LoadingProcessing isSpinning={isSpinning} />}
      <div className="gap-medium-2 md:gap-large-4 flex flex-col">
        {items.map((item) => (
          <GeneralTabGroupContent key={item.title} {...item} />
        ))}
      </div>
      {confirmModalSetting.open && (
        <ConfirmModal
          open={confirmModalSetting.open}
          type={confirmModalSetting.type}
          onClose={onCloseDeleteAccountModal}
          onConfirm={handleConfirmModal}
        />
      )}
    </>
  );
}
