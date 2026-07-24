import { useTranslations } from "next-intl";
// confirm-modal.tsx
import type { ReactNode } from "react";
import { useState } from "react";

import { Input } from "@/components/input-ds";
import { cn } from "@/components/utils/cn";
import { MODAL_Z_INDEX } from "@/config/z-index";
import type { TPaymentVendorOfSubscriptionUser } from "@/core/models/payment";
import { AlertDialog } from "@/features/manage-account-modal/components/alert-dialog";
import { useHandleUserSubscriptions } from "@/hooks/subscriptions";
import { useGlobalState } from "@/store/global/hooks";
import { openMailto } from "@/utils/commons/open-mailto";
import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";
import { MY_PLAN_URL } from "@/utils/constants/url";

import type {
  TConfirmModalConfig,
  TConfirmModalProps,
  TConfirmModalType,
} from "./types";

const renderLineBreak = (): ReactNode => <br />;
const renderSpanChunk = (chunks: ReactNode): ReactNode => <span>{chunks}</span>;
const renderIndentedSpanChunk = (chunks: ReactNode): ReactNode => (
  <span className="mt-4 inline-block!">{chunks}</span>
);
const renderInlineSpanChunk = (chunks: ReactNode): ReactNode => (
  <span className="inline!">{chunks}</span>
);

function CancelPlanLinkChunk({ chunks }: Readonly<{ chunks: ReactNode }>) {
  const user = useGlobalState((state) => state.user);
  const { handleManageBillingHistory } = useHandleUserSubscriptions();
  const paymentVendorOfSubscriptionUser: TPaymentVendorOfSubscriptionUser =
    useGlobalState((state) => state.paymentVendorOfSubscriptionUser);

  return (
    <button
      type="button"
      onClick={() => {
        if (paymentVendorOfSubscriptionUser === "stripe") {
          handleManageBillingHistory(user.id);
        } else {
          window.open(MY_PLAN_URL, "_blank");
        }
      }}
      className="typo-v1-action-inline-md text-v1-text-hierarchy-primary inline cursor-pointer underline"
    >
      {chunks}
    </button>
  );
}

const renderCancelPlanLinkChunk = (chunks: ReactNode): ReactNode => (
  <CancelPlanLinkChunk chunks={chunks} />
);

export default function ConfirmModal(props: TConfirmModalProps) {
  const { open, type, onClose, onConfirm } = props;
  const [confirmInput, setConfirmInput] = useState("");

  const t = useTranslations("mainLayout.confirmModal");
  const commonT = useTranslations("common");

  // Generate configs using translations
  const getConfigs = (): Record<
    Exclude<TConfirmModalType, "">,
    TConfirmModalConfig
  > => ({
    "delete-account-no-active-subscription": {
      actionLabel: t("deleteAccountNoActiveSubscription.actionLabel"),
      cancelText: t("deleteAccountNoActiveSubscription.cancelText"),
      confirmText: t("deleteAccountWithActiveSubscriptionFromWeb.confirmText"),
      description: null, // Will be generated dynamically in component
      requiresConfirmation: true,
      title: t("deleteAccountNoActiveSubscription.title"),
      variant: "destructive" as const,
    },
    "delete-account-with-active-subscription-from-mobile": {
      actionClassName:
        "text-v1-action-text-primary bg-v1-action-background-primary",
      actionLabel: t(
        "deleteAccountWithActiveSubscriptionFromMobile.actionLabel"
      ),
      cancelText: t("deleteAccountWithActiveSubscriptionFromMobile.cancelText"),
      description: null, // Will be generated dynamically in component
      title: t("deleteAccountWithActiveSubscriptionFromMobile.title"),
      variant: "secondary" as const,
    },
    "delete-account-with-active-subscription-from-web": {
      actionLabel: t("deleteAccountWithActiveSubscriptionFromWeb.actionLabel"),
      cancelText: t("deleteAccountWithActiveSubscriptionFromWeb.cancelText"),
      confirmText: t("deleteAccountWithActiveSubscriptionFromWeb.confirmText"),
      description: null, // Will be generated dynamically in component
      requiresConfirmation: true,
      title: t("deleteAccountWithActiveSubscriptionFromWeb.title"),
      variant: "destructive" as const,
    },
    signout: {
      actionLabel: t("signout.actionLabel"),
      description: t("signout.description"),
      title: t("signout.title"),
      variant: "destructive" as const,
    },
  });

  const configs = getConfigs();

  if (!type) {
    return null;
  }

  const config = configs[type];

  const requiresInput =
    "requiresConfirmation" in config && config.requiresConfirmation;
  const isDisabled =
    requiresInput &&
    confirmInput.toLocaleLowerCase() !==
      config.confirmText?.toLocaleLowerCase();

  // Generate description dynamically
  const getDescription = () => {
    if (type === "delete-account-with-active-subscription-from-web") {
      return t.rich("deleteAccountWithActiveSubscriptionFromWeb.description", {
        beforeDeleting: renderInlineSpanChunk,
        break: renderLineBreak,
        cancelPlanInstruction: renderIndentedSpanChunk,
        cancelPlanLink: renderCancelPlanLinkChunk,
        subscriptionInfo: renderSpanChunk,
      });
    }
    if (type === "delete-account-no-active-subscription") {
      return t.rich("deleteAccountNoActiveSubscription.description", {
        break: renderLineBreak,
        warning: renderSpanChunk,
      });
    }
    if (type === "delete-account-with-active-subscription-from-mobile") {
      return t.rich(
        "deleteAccountWithActiveSubscriptionFromMobile.description",
        {
          afterCancellation: renderSpanChunk,
          break: renderLineBreak,
          span: renderSpanChunk,
        }
      );
    }
    return config.description;
  };

  const handleConfirmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmInput(e.target.value);
  };

  const handleCloseDialog = () => {
    if (type === "delete-account-with-active-subscription-from-mobile") {
      openMailto(LINK_NEED_HELP_CONST);
    }
    onClose();
  };

  return (
    <AlertDialog
      open={open}
      zIndex={MODAL_Z_INDEX.MANAGE_ACCOUNT}
      onOpenChange={onClose}
      className={cn(
        "bg-surface-general-secondary outline-hidden md:max-w-[488px]"
      )}
      header={{
        onClose,
        showCloseIcon: false,
        title: config.title,
      }}
      body={{
        spacing: "none",
      }}
      footer={{
        action: {
          className: config.actionClassName,
          disabled: isDisabled,
          label: config.actionLabel,
          onClick: onConfirm,
          variant: config.variant,
        },

        cancel: {
          label: config.cancelText || commonT("cta.cancel"),
          onClick: handleCloseDialog,
        },

        className: cn(
          "p-v1-structural-content-relaxed",
          "flex! flex-col-reverse! md:flex-row!",
          "justify-stretch md:justify-end! md:gap-v1-structural-content-micro",
          "[&>button]:w-full md:[&>button]:w-auto gap-v1-structural-content-normal",
          //first button have border on mobile, but not on desktop
          "md:[&>button:first-child]:border-0 [&>button:first-child]:border [&>button:first-child]:border-solid",
          "[&>button:first-child]:border-v1-action-border-ghost",
          "mt-v1-structural-content-relaxed"
        ),
      }}
    >
      <div
        className={cn(
          "gap-v1-structural-content-relaxed typo-v1-body-default-normal",
          "text-v1-text-hierarchy-secondary flex w-full flex-col",
          "md:px-1"
        )}
      >
        <div className="[&>span:first-child]:mt-small-1 [&>br]:hidden [&>span]:mt-4 [&>span]:block">
          {getDescription()}
        </div>
        {requiresInput && (
          <>
            <p>
              {t("deleteAccountNoActiveSubscription.confirmInstruction", {
                confirmText: config.confirmText || "",
              })}
            </p>

            <div className="py-v1-5">
              <Input
                value={confirmInput}
                type="inline"
                placeholder={t(
                  "deleteAccountNoActiveSubscription.confirmPlaceholder",
                  {
                    confirmText: config.confirmText ?? "",
                  }
                )}
                wrapperClassName={cn(
                  "border-v1-form-border-default thickness-v1-subtle bg-v1-surface-glass-dark-whisper rounded-v1-medium p-medium-1.5",
                  "items-start"
                )}
                className={cn(
                  "placeholder:typo-v1-body-default-normal placeholder:text-v1-text-hierarchy-tertiary typo-v1-body-default-normal text-v1-text-hierarchy-primary"
                )}
                onChange={handleConfirmInputChange}
              />
            </div>
          </>
        )}
      </div>
    </AlertDialog>
  );
}
