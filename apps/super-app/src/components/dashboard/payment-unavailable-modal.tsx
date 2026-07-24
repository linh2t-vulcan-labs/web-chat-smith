"use client";

import { IconsOutlinedPrivacyIcon } from "@cs/icons/icons-outlined-privacy";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { ReactNode } from "react";

import { ButtonV2 } from "@/components/button-v2";
import ModalV2 from "@/components/modal/modal-v-2";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

const renderLineBreak = () => <br />;

const renderBrandChunk = (chunks: ReactNode) => (
  <span className="bg-gradient-green text-bodyS-highlight bg-clip-text text-transparent">
    {chunks}
  </span>
);

export default function PaymentUnavailableModal() {
  const paymentUnavailableModalT = useTranslations(
    "mainLayout.paymentUnavailableModal"
  );
  const commonT = useTranslations("common");
  const isOpenManageSubscriptionModal = useGlobalState(
    (state) => state.isOpenManageSubscriptionModal
  );

  const setIsOpenManageSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenManageSubscriptionModal
  );

  const handleClose = () => {
    setIsOpenManageSubscriptionModal(false);
  };

  return (
    <ModalV2
      open={isOpenManageSubscriptionModal}
      onClose={handleClose}
      zIndex={MODAL_Z_INDEX.MANAGE_ACCOUNT}
      isPreventClickOutside
      containerClassName={compositeStyles(
        "rounded-default bg-surface-general-primary! w-full md:w-[518px]"
      )}
      className={compositeStyles(
        "md:p-large-6! flex min-h-[315px] flex-col p-0! md:min-h-[407px]"
      )}
    >
      <div className="gap-large-4 p-medium-2 flex w-full flex-col items-center justify-center md:p-0">
        <div className="gap-small-1 md:gap-medium-2 flex flex-col items-center justify-center">
          <Image
            src="/icons/payment/warning.png"
            alt="success cancel"
            width={95}
            height={95}
          />
          <h1 className="text-bodyL-highlight text-text-general-secondary md:text-app-Title1 text-center">
            {paymentUnavailableModalT.rich("title", {
              break: renderLineBreak,
            })}
          </h1>
          <p className="text-bodyS-neutral text-text-general-tertiary text-center">
            {paymentUnavailableModalT.rich("description", {
              brand: renderBrandChunk,
              break: renderLineBreak,
            })}
          </p>
        </div>
        <div className="gap-medium-2 md:gap-large-4 flex w-full flex-col">
          <ButtonV2
            color="secondary"
            size="base"
            fullWidth
            className="text-bodyM-medium text-text-general-inverse"
            onClick={handleClose}
          >
            {commonT("cta.gotIt")}
          </ButtonV2>
          <div className="gap-small-0.5 text-text-general-tertiary flex items-center justify-center">
            <IconsOutlinedPrivacyIcon width={16} height={16} />
            <span className="text-footnoteM-highlight uppercase">
              {paymentUnavailableModalT("privacy")}
            </span>
          </div>
        </div>
      </div>
    </ModalV2>
  );
}
