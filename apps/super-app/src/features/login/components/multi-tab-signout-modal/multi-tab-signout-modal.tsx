import { useTranslations } from "next-intl";
import React from "react";

import { ButtonV2 } from "@/components/button-v2";
import { ModalV2 } from "@/components/modal";

import type { MultiTabSignoutModalProps } from "./types";

const MultiTabSignoutModal: React.FC<MultiTabSignoutModalProps> = ({
  open,
  onClose,
}) => {
  const commonT = useTranslations("common");
  return (
    <ModalV2
      open={open}
      onClose={onClose}
      zIndex={99}
      containerClassName="bg-surface-general-secondary md:max-w-[400px]"
      className="flex size-full flex-1 flex-col"
      isPreventClickOutside
      centered
    >
      <div className="flex items-center justify-between gap-small-1">
        <p className="text-bodyS-neutral text-text-general-tertiary">
          {commonT("sessionEnd")}
        </p>
      </div>
      <div className="mt-large-4 flex justify-center gap-small-1">
        <ButtonV2 className="min-w-40" color="outline" onClick={onClose}>
          {commonT("close")}
        </ButtonV2>
      </div>
    </ModalV2>
  );
};

export default MultiTabSignoutModal;
