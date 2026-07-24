import { useTranslations } from "next-intl";
import { Checkbox } from "radix-ui";
import React, { useState } from "react";
import { toast } from "sonner";

import { ButtonV2 } from "@/components/button-v2";
import { LoadingProcessing } from "@/components/loading-icon";
import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import { EConversationMode } from "@/core/models/conversation";
import { useConfirmConsent } from "@/hooks/use-confirm-consent";
import {
  CONSENT_CONFIRM_ACTION,
  CONSENT_CONFIRM_TYPE,
  CONSENT_CONFIRM_VERSION,
} from "@/utils/constants/user";

import type { UploadTermsConsentModalProps } from "./types";

const UploadTermsConsentModal: React.FC<UploadTermsConsentModalProps> = ({
  open,
  conversationMode,
  onSuccess,
  onClose,
}) => {
  const [agree, setAgree] = useState(false);
  const mutateTermsConsent = useConfirmConsent();
  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");

  const handleAcceptUploadConsent = async () => {
    try {
      const actionContext =
        conversationMode === EConversationMode.AI_ART
          ? CONSENT_CONFIRM_ACTION.IMAGE_2_IMAGE_UPLOAD
          : CONSENT_CONFIRM_ACTION.CHAT_UPLOAD;
      await mutateTermsConsent.mutateAsync({
        action_context: actionContext,
        type: CONSENT_CONFIRM_TYPE.UPLOAD_TERMS_CONSENT,
        version: CONSENT_CONFIRM_VERSION,
      });
      onSuccess?.();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch {
      toast.info(null, {
        description: "You’ve already given your consent.",
      });
    }
  };

  const isLoading = mutateTermsConsent.isPending;

  return (
    <ModalV2
      open={open}
      onClose={onClose}
      zIndex={99}
      containerClassName="bg-surface-general-secondary! w-full md:max-w-[449px]"
      className="p-medium-2! md:p-large-4! flex size-full flex-1 flex-col"
      isPreventClickOutside
    >
      <div className="mb-medium-3 gap-small-1 flex items-center justify-between">
        <h4 className="text-bodyM-highlight text-text-general-secondary md:text-app-Title1">
          {conversationT("modal.termsConsent.title")}
        </h4>
        <SVGIcon
          src="/icons/close.svg"
          className="text-icon-general-tertiary hover:cursor-pointer hover:brightness-90"
          width={17}
          height={17}
          onClick={onClose}
        />
      </div>
      <div className="gap-medium-3 flex flex-col">
        <div className="ps-small-0.5 flex flex-col">
          <p className="gap-small-0.5 text-bodyS-neutral text-text-general-secondary flex">
            <span className="dot">&#8226;</span>{" "}
            {conversationT("modal.termsConsent.description1")}
          </p>
          <p className="gap-small-0.5 text-bodyS-neutral text-text-general-secondary flex">
            <span className="dot">&#8226;</span>{" "}
            {conversationT("modal.termsConsent.description2")}
          </p>
          <p className="gap-small-0.5 text-bodyS-neutral text-text-general-secondary flex">
            <span className="dot">&#8226;</span>{" "}
            {conversationT("modal.termsConsent.description3")}
          </p>
        </div>
        <div className="gap-small-1 rounded-rounded border-border-general-secondary bg-surface-general-tertiary p-medium-2 flex items-center border">
          <Checkbox.Root
            id="agreement"
            className="data-[state=unchecked]:border-border-general-primary data-[state=checked]:bg-border-brand-identity flex size-6 min-w-6 appearance-none items-center justify-center rounded-sm border bg-transparent outline-hidden data-[state=checked]:border-transparent"
            onCheckedChange={(checked) => {
              setAgree(Boolean(checked));
            }}
          >
            <Checkbox.Indicator className="rounded-subtle">
              <SVGIcon
                className="text-text-general-inverse dark:text-text-input-focus"
                src="/icons/outlined/check-v2.svg"
                width={14}
                height={14}
              />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label
            htmlFor="agreement"
            className="pt-small-0.25 text-bodyS-neutral text-text-general-tertiary cursor-pointer"
          >
            {conversationT("modal.termsConsent.acceptText")}
          </label>
        </div>
        {/* Loading */}
        {isLoading && <LoadingProcessing isSpinning />}
        {/* Action button */}
        <div className="gap-small-1 flex justify-end">
          <ButtonV2
            className="flex-1"
            color="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {commonT("cta.cancel")}
          </ButtonV2>

          <ButtonV2
            className="disabled:bg-surface-action-default-disabled disabled:text-text-action-secondary-disabled flex-1"
            color="secondary"
            onClick={handleAcceptUploadConsent}
            disabled={!agree || isLoading}
          >
            {commonT("cta.accept")}
          </ButtonV2>
        </div>
      </div>
    </ModalV2>
  );
};

export default UploadTermsConsentModal;
