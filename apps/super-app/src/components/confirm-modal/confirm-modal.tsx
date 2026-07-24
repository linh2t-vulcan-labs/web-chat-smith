"use client";

import { useTranslations } from "next-intl";

import { ButtonV2 } from "@/components/button-v2";
import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";

import type { TConfirmModal } from "./types";

const ConfirmModal = ({
  className = "",
  open = false,
  description,
  isDisabledSubmit = false,
  title,
  showCloseButton = true,
  showProceedButton = true,
  closeText,
  proceedText,
  onClose,
  onProceed,
}: TConfirmModal) => {
  const t = useTranslations("ConfirmModal");

  const handleOnClose = () => {
    onClose?.();
  };

  const handleOnProceed = () => {
    onProceed?.();
  };

  return (
    <ModalV2
      open={open}
      onClose={handleOnClose}
      zIndex={99}
      containerClassName={`bg-surface-general-secondary! md:max-w-[426px] min-h-[156px] ${className}`}
      className="p-medium-2! flex size-full flex-1 flex-col"
      isPreventClickOutside
    >
      <div className="gap-small-1 flex items-center justify-between">
        {title && (
          <h4 className="text-bodyL-highlight text-text-general-secondary">
            {title}
          </h4>
        )}
        <SVGIcon
          src="/icons/close.svg"
          className="text-icon-general-tertiary hover:cursor-pointer hover:brightness-90"
          width={14}
          height={14}
          onClick={handleOnClose}
        />
      </div>
      {description && (
        <div className="mt-small-1">
          <p className="text-bodyS-neutral text-text-general-tertiary">
            {description}
          </p>
        </div>
      )}
      <div className="mt-large-4 gap-small-1 flex justify-end">
        {showCloseButton ? (
          <ButtonV2 color="outline" onClick={handleOnClose}>
            {closeText || t("Close")}
          </ButtonV2>
        ) : (
          ""
        )}

        {showProceedButton ? (
          <ButtonV2 onClick={handleOnProceed} disabled={isDisabledSubmit}>
            {proceedText || t("Confirm")}
          </ButtonV2>
        ) : null}
      </div>
    </ModalV2>
  );
};

export default ConfirmModal;
