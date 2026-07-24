"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { ButtonV2 } from "@/components/button-v2";
import { ModalV2 } from "@/components/modal";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { useBlockingOverlayRegistration } from "@/hooks/ui/use-blocking-overlay-registration";
import useShowModalOnce from "@/hooks/use-show-modal-once";
import { useGlobalState } from "@/store/global/hooks";
import { HAS_SEEN_PRO_PLAN_EXPIRED_MODAL_KEY } from "@/utils/commons/keys";

function ExpiredPlanModal() {
  const [isOpenModal, toggleIsOpenModal] = useToggle(false);
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const isOpenSubscriptionExpired = useGlobalState(
    (state) => state.isOpenSubscriptionExpired
  );
  const mainLayoutT = useTranslations("mainLayout");
  const commonT = useTranslations("common");

  const handleSkip = () => {
    toggleIsOpenModal(false);
  };

  const handleGoPro = () => {
    toggleIsOpenModal(false);
    setIsOpenSubscriptionModal(true, "expired_popup");
  };

  useShowModalOnce({
    isDisabled: !isOpenSubscriptionExpired,
    key: HAS_SEEN_PRO_PLAN_EXPIRED_MODAL_KEY,
    setModal: toggleIsOpenModal,
  });

  useBlockingOverlayRegistration(isOpenModal);

  return (
    <ModalV2
      zIndex={MODAL_Z_INDEX.BASE}
      containerClassName="md:max-w-[600px] w-full"
      className="rounded-default overflow-hidden p-0!"
      open={isOpenModal}
      onClose={toggleIsOpenModal}
      isPreventClickOutside
    >
      <div className="onboarding-image relative">
        <div className="relative aspect-600/324 w-full">
          <Image
            alt="Welcome Pro"
            className="object-cover"
            src="/images/premium-expired.png"
            fill
          />
        </div>
      </div>
      <div className="gap-medium-1.5 bg-neutral-150! px-medium-3 py-medium-1.5 flex flex-col">
        <h4 className="text-app-Title1 dark:text-text-general-inverse md:text-app-title-0 line-clamp-2">
          {mainLayoutT("expiredPlan.title")}
        </h4>
        <div className="text-bodyS-neutral dark:text-text-general-inverse line-clamp-3">
          {mainLayoutT("expiredPlan.description")}
        </div>
        <div className="gap-small-1 py-small-1 flex items-center justify-end">
          <div className="gap-small-1 flex w-full md:w-auto">
            <ButtonV2
              className="text-text-general-quaternary flex-1 focus:outline-hidden md:min-w-[112px] md:flex-auto"
              color="text"
              size="xxs"
              fullWidth
              onClick={handleSkip}
            >
              {commonT("cta.skip")}
            </ButtonV2>
            <ButtonV2
              size="xxs"
              fullWidth
              className="px-large-4 flex-1 whitespace-nowrap md:min-w-[200px] md:flex-auto"
              onClick={handleGoPro}
            >
              {mainLayoutT("expiredPlan.cta")}
            </ButtonV2>
          </div>
        </div>
      </div>
    </ModalV2>
  );
}

export default ExpiredPlanModal;
