"use client";

import { useToggle } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { AspectRatio } from "radix-ui";
import { useEffect, useState } from "react";

import ConfettiMobileData from "@/assets/lottie/confetti_mobile.json";
import ConfettiPCData from "@/assets/lottie/confetti_pc.json";
import { ButtonV2 } from "@/components/button-v2";
import { ModalV2 } from "@/components/modal";
import { cn } from "@/components/utils/cn";
import { MODAL_Z_INDEX, OVERLAY_Z_INDEX } from "@/config/z-index";
import { useBlockingOverlayRegistration } from "@/hooks/ui/use-blocking-overlay-registration";
import useLocalStorage from "@/hooks/use-local-storage";
import { useMediaQuery } from "@/hooks/use-media-query";
import useShowModalOnce from "@/hooks/use-show-modal-once";
import { useGlobalState } from "@/store/global/hooks";
import {
  ENABLE_PREMIUM_ONBOARDING_MODAL_KEY,
  HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY,
} from "@/utils/commons/keys";
import { compositeStyles } from "@/utils/commons/styles";

import LottieAnimation from "../lottie-animation/lottie-animation";
import { ONBOARDING_FEATURE_DATA } from "./constant";
import type { TOnboardingStepProps } from "./types";

const CONFETTI_TTL = 3200;

const OnboardingStep: React.FC<TOnboardingStepProps> = ({
  stepNumber,
  current,
}) => (
  <div className="gap-small-0.5 flex">
    {Array.from({ length: stepNumber }).map((_, idx) => (
      <span
        key={idx.toString()}
        className={compositeStyles(
          "bg-text-general-brand-identity h-small-0.75 rounded-circle inline-block transition-all",
          idx === current ? "w-[18px]" : "w-small-0.75 opacity-40"
        )}
      />
    ))}
  </div>
);

function PremiumOnboardingModal() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDesktop = useMediaQuery("md");
  const commonT = useTranslations("common");
  const mainLayoutT = useTranslations("mainLayout");
  const [isOpenModal, toggleIsOpenModal] = useToggle(false);
  const [enablePremiumOnboarding] = useLocalStorage(
    ENABLE_PREMIUM_ONBOARDING_MODAL_KEY
  );
  const { isValidPremiumUser } = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const [confettiVisible, setConfettiVisible] = useState(false);
  const openPremiumOnboarding = isOpenModal && isValidPremiumUser;

  const featuresData = ONBOARDING_FEATURE_DATA;

  const currentStep = featuresData[currentIndex];
  const isFirstStep = currentIndex === 0;
  const isStepDone = currentIndex === featuresData.length - 1;

  const handleSkip = () => {
    toggleIsOpenModal(false);
  };

  const handlePreviousStep = () => {
    setCurrentIndex(currentIndex - 1);
  };

  const handleNextStep = () => {
    if (isStepDone) {
      toggleIsOpenModal();
      return;
    }

    setCurrentIndex(currentIndex + 1);
  };

  useShowModalOnce({
    isDisabled: !isValidPremiumUser || !enablePremiumOnboarding,
    isListenToLocalStorageChange: true,
    key: HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY,
    setModal: toggleIsOpenModal,
  });

  useBlockingOverlayRegistration(openPremiumOnboarding);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (openPremiumOnboarding) {
      // oxlint-disable-next-line react/react-compiler -- shows confetti and schedules its auto-hide when the onboarding modal opens; timer-driven UI effect, not a render derivation
      setConfettiVisible(true);
      // auto hide confetti after 3200ms
      timeoutId = setTimeout(() => {
        setConfettiVisible(false);
      }, CONFETTI_TTL);
    }

    return () => {
      setCurrentIndex(0);
      clearTimeout(timeoutId);
      setConfettiVisible(false);
    };
  }, [openPremiumOnboarding]);

  if (!currentStep) {
    return null;
  }

  return (
    <ModalV2
      zIndex={MODAL_Z_INDEX.BASE}
      containerClassName="md:max-w-[600px] w-full"
      className="rounded-default p-0!"
      open={openPremiumOnboarding}
      onClose={toggleIsOpenModal}
      isPreventClickOutside
    >
      <div className="onboarding-image relative">
        {/* confetti animation */}
        {confettiVisible && (
          <div
            className="pointer-events-none absolute top-1/2 start-1/2 h-screen w-screen -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: OVERLAY_Z_INDEX.MODAL_CRITICAL + 1 }}
          >
            <LottieAnimation
              loop={false}
              animationData={isDesktop ? ConfettiPCData : ConfettiMobileData}
            />
          </div>
        )}
        <div
          className="rounded-t-default absolute inset-0 z-10 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 65.1%, rgba(0, 0, 0, 0.48) 100%), transparent 50% / cover no-repeat",
          }}
        />
        {currentIndex !== 0 && (
          <div className="overflow-hidden rounded-none">
            <AspectRatio.Root ratio={600 / 324}>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="size-full object-cover"
              >
                <source src={currentStep.video} type="video/mp4" />
              </video>
            </AspectRatio.Root>
          </div>
        )}
        {currentIndex === 0 && (
          <div className="relative aspect-600/324 w-full">
            <Image
              alt="Welcome Pro"
              className="object-cover"
              src="/images/welcome-premium.png"
              fill
            />
          </div>
        )}
      </div>
      <div
        className={cn(
          "rounded-b-default flex flex-col overflow-hidden",
          "bg-neutral-150! gap-medium-1.5 px-medium-3 py-medium-1.5"
        )}
      >
        <div className="flex justify-center md:hidden">
          <OnboardingStep
            stepNumber={featuresData.length}
            current={currentIndex}
          />
        </div>
        <h4 className="text-app-Title1 dark:text-text-general-inverse md:text-app-title-0 line-clamp-2">
          {mainLayoutT(currentStep.title)}
        </h4>
        <div className="text-bodyS-neutral dark:text-text-general-inverse line-clamp-3">
          <p>{mainLayoutT(currentStep.description)}</p>
        </div>
        <div className="gap-small-1 py-small-1 flex items-center justify-between">
          <div className="hidden md:block">
            <OnboardingStep
              stepNumber={featuresData.length}
              current={currentIndex}
            />
          </div>
          <div className="gap-small-1 flex w-full md:w-auto">
            {currentIndex === 0 ? (
              <ButtonV2
                className="text-text-general-quaternary flex-1 focus:outline-none md:flex-auto"
                color="text"
                size="xxs"
                fullWidth
                onClick={handleSkip}
              >
                {commonT("cta.skip")}
              </ButtonV2>
            ) : (
              <ButtonV2
                className="text-text-general-inverse flex-1 md:min-w-[156px] md:flex-auto"
                color="secondary"
                size="xxs"
                fullWidth
                disabled={isFirstStep}
                onClick={handlePreviousStep}
              >
                {commonT("cta.back")}
              </ButtonV2>
            )}
            <ButtonV2
              size="xxs"
              fullWidth
              className="px-large-4 flex-1 whitespace-nowrap md:min-w-[156px] md:flex-auto"
              onClick={handleNextStep}
            >
              {(() => {
                if (isFirstStep) {
                  return `${commonT("cta.exploreNow")}!`;
                }
                if (isStepDone) {
                  return `${commonT("cta.letGo")}!`;
                }
                return commonT("cta.next");
              })()}
            </ButtonV2>
          </div>
        </div>
      </div>
    </ModalV2>
  );
}

export default PremiumOnboardingModal;
