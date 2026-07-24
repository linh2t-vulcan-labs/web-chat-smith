"use client";

import { useTranslations } from "next-intl";

import { ButtonV2 } from "@/components/button-v2";
import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";

import { useFeatureGating } from "../../hooks/use-feature-gating";
import { useGuestState } from "../../stores/guest-mode/hooks";

const GuestConfirmModal = () => {
  const t = useTranslations("loginPage.loginForm.guestConfirmModal");
  const commonT = useTranslations("common");
  const { showLoginModal } = useFeatureGating();
  const isOpenGuestConfirmModal = useGuestState(
    (state) => state.isOpenGuestConfirmModal
  );
  const setIsOpenGuestConfirmModal = useGuestState(
    (state) => state.setIsOpenGuestConfirmModal
  );

  const onClose = () => {
    setIsOpenGuestConfirmModal(false);
  };

  const onSignIn = () => {
    showLoginModal("new chat");
    onClose();
  };

  return (
    <ModalV2
      open={isOpenGuestConfirmModal}
      onClose={onClose}
      zIndex={99}
      containerClassName="bg-surface-general-secondary md:max-w-[426px] w-full h-[156px]"
      className="p-medium-2! flex size-full flex-1 flex-col"
      isPreventClickOutside
    >
      <div className="gap-small-1 flex items-center justify-between">
        <h4 className="text-bodyL-highlight text-text-general-secondary">
          {t("title")}
        </h4>
        <SVGIcon
          src="/icons/close.svg"
          className="text-icon-general-tertiary hover:cursor-pointer hover:brightness-90"
          width={24}
          height={24}
          onClick={onClose}
        />
      </div>
      <div className="mt-small-1">
        <p className="text-bodyS-neutral text-text-general-tertiary">
          {t("description")}
        </p>
      </div>
      <div className="mt-large-4 gap-small-1 flex justify-end">
        <ButtonV2 color="outline" onClick={onClose}>
          {commonT("cta.cancel")}
        </ButtonV2>
        <ButtonV2 onClick={onSignIn}>{commonT("signIn")}</ButtonV2>
      </div>
    </ModalV2>
  );
};

export default GuestConfirmModal;
