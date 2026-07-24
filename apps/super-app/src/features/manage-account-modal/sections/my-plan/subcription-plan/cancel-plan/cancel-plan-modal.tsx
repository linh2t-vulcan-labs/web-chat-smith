"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import { MODAL_Z_INDEX } from "@/config/z-index";
import { AlertDialog } from "@/features/manage-account-modal/components/alert-dialog";

import type { TCancelPlanModalProps } from "./types";

const InProgressCancelContent = dynamic(
  () => import("./in-progress-cancel-content")
);
const SuccessCancelContent = dynamic(() => import("./success-cancel-content"));
const UnCancelContent = dynamic(() => import("./uncancel-content"));

export default function CancelPlanModal(props: TCancelPlanModalProps) {
  const {
    open,
    item,
    status,
    isConfirming = false,
    onClose,
    onConfirm,
  } = props;
  const t = useTranslations("myPlan");

  const contentConfigByStatusMapping = {
    inProgress: {
      bodyClassName: "flex flex-col px-v1-structural-component-large!",
      className: "md:w-[528px] md:max-w-[528px] w-full",
      content: (
        <InProgressCancelContent
          expiredAt={item.planInfo.timeline.currentPeriodEnd}
        />
      ),
      footer: {
        action: {
          disabled: isConfirming,
          label: t("actions.cancelPlan"),
          onClick: () => onConfirm?.(item.id),
          variant: "destructive" as const,
        },
        cancel: { label: t("actions.back"), onClick: onClose },
        className: "p-v1-structural-content-relaxed",
      },
      header: { title: t("cancel.modalTitle") },
    },
    success: {
      bodyClassName: "p-0!",
      className: "md:w-[596px] md:max-w-[600px] w-full",
      content: (
        <SuccessCancelContent
          expiredAt={item.planInfo.timeline.currentPeriodEnd}
          onClose={onClose}
        />
      ),
      footer: undefined,
      header: undefined,
    },
    uncancelled: {
      bodyClassName: "flex flex-col px-v1-structural-component-large!",
      className: "md:w-[528px] md:max-w-[528px] w-full",
      content: <UnCancelContent />,
      footer: {
        action: {
          disabled: isConfirming,
          label: t("actions.yesContinue"),
          onClick: () => onConfirm?.(item.id),
          variant: "destructive" as const,
        },
        cancel: { label: t("actions.back"), onClick: onClose },
        className: "p-v1-structural-content-relaxed",
      },
      header: { title: t("cancel.uncancelTitle") },
    },
  };

  const contentConfig = contentConfigByStatusMapping[status];

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
      zIndex={MODAL_Z_INDEX.MANAGE_ACCOUNT}
      preventCloseOnOutsideClick
      className={contentConfig?.className}
      header={contentConfig?.header}
      body={{ className: contentConfig?.bodyClassName }}
      footer={contentConfig?.footer}
    >
      {contentConfig?.content}
    </AlertDialog>
  );
}
