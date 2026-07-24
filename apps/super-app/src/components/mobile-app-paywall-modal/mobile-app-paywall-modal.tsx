"use client";

import { IconsOutlinedClosedIcon } from "@cs/icons/icons-outlined-closed";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { ReactNode } from "react";
import React from "react";

import { productBenefits } from "@/components/account-subscription-modal-v4/constants";
import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import { MODELS } from "@/config/build-on-models";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { useBlockingOverlayRegistration } from "@/hooks/ui/use-blocking-overlay-registration";
import { GTM_EVENT_ID } from "@/libs/gtm/events";

import { QRCodePaywall } from "../qrcode-paywall";

interface Props {
  open: boolean;
  onClose?: () => void;
}

const renderPaywallTitleBreak = () => <br />;

const renderPaywallTitleHighlight = (chunks: ReactNode) => (
  <span className="text-text-action-primary-default">{chunks}</span>
);

const renderPurchasingHighlight = (chunks: ReactNode) => (
  <span className="bg-gradient-green bg-clip-text text-transparent">
    {chunks}
  </span>
);

const MobileAppPaywallModal: React.FC<Props> = ({ open, onClose }) => {
  const dsT = useTranslations("ds");
  const commonT = useTranslations("common");
  const title = dsT.rich("paywall.title", {
    break: renderPaywallTitleBreak,
    highlight: renderPaywallTitleHighlight,
  });
  const subTitle = dsT("paywall.subTitle");
  const purchasing = dsT.rich("paywall.purchasing", {
    highlight: renderPurchasingHighlight,
  });

  useBlockingOverlayRegistration(open);
  return (
    <ModalV2
      open={open}
      onClose={onClose}
      zIndex={MODAL_Z_INDEX.SUBSCRIPTION}
      overlayClassName="bg-surface-general-primary!"
      containerClassName="rounded-none max-h-full max-w-full w-full bg-surface-general-primary! md:bg-transparent! overflow-y-scroll xl:overflow-y-hidden size-full"
      className="size-full p-0! xl:overflow-y-hidden"
      isPreventClickOutside
      dialogContentProps={{
        style: {
          pointerEvents: "auto",
        },
      }}
    >
      <IconsOutlinedClosedIcon
        width={24}
        height={24}
        className="end-medium-3 top-medium-3 text-text-general-tertiary hover:text-text-general-secondary rtl:left-medium-3 absolute z-10 block cursor-pointer rtl:right-auto"
        onClick={onClose}
      />
      <div
        id={GTM_EVENT_ID.View_MobilePaywall}
        className="flex flex-col lg:min-h-screen lg:items-center lg:justify-center lg:overflow-hidden"
      >
        <div className="lg:rounded-half flex w-full max-w-6xl overflow-hidden">
          <div className="bg-surface-general-tertiary p-large-4 hidden w-1/2 lg:block">
            <div className="gap-small-1 flex flex-col">
              <div className="text-bodyM-highlight text-text-general-secondary text-center">
                {dsT("builtOn")}
              </div>
              <div className="flex flex-col items-center">
                <div className="gap-medium-2 flex w-max items-center">
                  {MODELS.map((model, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-bodyS-neutral text-text-general-secondary md:text-footnoteM-highlight">
                        {model.name}
                      </span>
                      {idx < MODELS.length - 1 && (
                        <span className="h-small-0.75 min-w-small-0.75 bg-surface-action-inverse-default inline-block rounded-full" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                height: 260,
              }}
              className="bg-surface-general-tertiary bg-[url('/images/paywall/model-bg.png')] bg-cover bg-bottom bg-blend-lighten"
            />
            <div className="gap-medium-1.5 flex flex-col">
              <div className="mt-medium-2.5 gap-small-1 flex justify-between">
                <div className="text-bodyM-highlight text-text-general-secondary rtl:pr-medium-2 uppercase">
                  {dsT("yourBenefits")}
                </div>
                <div className="gap-x-medium-3 flex">
                  <span className="px-small-0.5 text-bodyM-highlight uppercase">
                    {commonT("free")}
                  </span>
                  <span className="bg-gradient-green text-bodyM-highlight bg-clip-text text-transparent uppercase">
                    {commonT("pro")}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                {productBenefits.map((benefit, idx) => (
                  <div
                    className="gap-small-1 rounded-default py-small-1 flex items-center justify-between"
                    key={idx}
                  >
                    <div className="gap-medium-2 flex">
                      <Image
                        className="rounded-soft h-6"
                        width={24}
                        height={24}
                        src={benefit.icon}
                        alt="logo"
                      />
                      <h3 className="text-bodyS-neutral text-text-general-secondary">
                        {dsT(benefit.feature)}
                      </h3>
                    </div>
                    {/* Check */}
                    <div className="gap-x-medium-3 flex items-center">
                      {benefit.limit ? (
                        <span className="text-footnoteS-neutral text-text-general-secondary">
                          {commonT("limited")}
                        </span>
                      ) : (
                        <SVGIcon
                          className="me-small-0.25 text-text-general-primary"
                          src="/icons/filled/close-gray.svg"
                          width={24}
                          height={24}
                        />
                      )}
                      <div className="px-small-1">
                        <SVGIcon
                          className="text-text-general-primary"
                          src="/images/paywall/premium-check.svg"
                          width={24}
                          height={24}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-surface-general-primary p-small-0 lg:p-large-4 w-full bg-cover lg:w-1/2 lg:bg-[url(/images/paywall/bg-right.jpg)]">
            <div className="bg-surface-general-primary block h-[180px] bg-[url('/images/paywall/model-bg-mobile.png')] bg-cover bg-bottom md:h-[240px] lg:hidden" />
            <div className="gap-small-1 flex flex-col lg:hidden">
              <div className="text-footnoteM-neutral text-text-general-tertiary text-center">
                {dsT("builtOn")}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex w-max items-center">
                  {MODELS.map((model, idx) => (
                    <React.Fragment key={idx}>
                      <span className="text-footnoteM-highlight text-text-general-secondary">
                        {model.name}
                      </span>
                      {idx < MODELS.length - 1 && (
                        <span className="pe-small-0.5 text-footnoteS-neutral">
                          ,
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div className="gap-medium-2 p-medium-2 lg:p-small-0 flex flex-col">
              <h1 className="text-web-h4 lg:text-display-neutral text-center !font-semibold lg:text-left">
                {title}
              </h1>
              <p className="mb-small-1 px-large-5 text-footnoteM-neutral text-text-general-tertiary lg:mb-large-4 lg:px-small-0 lg:text-bodyM-neutral text-center lg:text-left">
                {subTitle}
              </p>
              <div className="lg:pr-large-4">
                <div className="gap-small-1 rounded-rounded border-thin border-black-950 bg-surface-general-highlight p-medium-2 lg:mb-medium-3 lg:gap-medium-2 flex items-center lg:items-start">
                  <div className="size-large-4 min-w-large-4 rounded-rounded bg-surface-general-primary/40 p-small-0.75 lg:size-large-6 lg:min-w-large-6 lg:p-medium-1.5">
                    <SVGIcon
                      className="hidden lg:inline-block"
                      src="/images/paywall/premium-sync.svg"
                      width={24}
                      height={24}
                    />
                    <SVGIcon
                      className="inline-block lg:hidden"
                      src="/images/paywall/premium-sync.svg"
                      width={20}
                      height={20}
                    />
                  </div>
                  <p className="text-footnoteM-neutral lg:text-bodyM-neutral">
                    {purchasing}
                  </p>
                </div>
              </div>
              <QRCodePaywall />
              {/* <ButtonV2
                className="mt-large-6 hidden w-full gap-small-1 !text-bodyM-highlight !font-bold lg:flex"
                style={{ height: 56 }}
              >
                <IconsOutlinedDownloadIcon width={24} height={24} />
                {commonT("downloadApp")}
              </ButtonV2> */}
            </div>
          </div>
        </div>
      </div>
    </ModalV2>
  );
};

export default MobileAppPaywallModal;
