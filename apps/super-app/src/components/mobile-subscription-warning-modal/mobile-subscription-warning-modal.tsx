import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/button";
import Link from "@/components/link/link";
import { ModalV2 } from "@/components/modal";
import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";

import type { SubscriptionDetailProps } from "./type";

const renderStrong = (chunk: React.ReactNode) => (
  <span className="text-bodyM-highlight">{chunk}</span>
);

const MobileSubscriptionWarningModal = ({
  onNeedHelp,
  onCloseSubscription,
  open,
}: SubscriptionDetailProps) => {
  const dsT = useTranslations("ds");
  return (
    <ModalV2
      open={open}
      onClose={onCloseSubscription}
      width={448}
      className="p-medium-3"
      zIndex={101}
    >
      <div className="flex w-full flex-col text-text-general-primary">
        <h6 className="mb-[24px] text-center text-mobile-h5 md:text-web-h5">
          {dsT("manageSubscription.title")}
        </h6>
        <p className="text-bodyM-neutral text-text-general-secondary">
          {dsT.rich("manageSubscription.description", {
            strong: renderStrong,
          })}
        </p>

        <div className="mt-[32px] grid w-full grid-cols-2 gap-medium-2">
          <Link
            size="large"
            color="default"
            rounded="pillSoft"
            onClick={onNeedHelp}
            href={LINK_NEED_HELP_CONST}
          >
            {dsT("manageSubscription.helpBtn")}
          </Link>

          <Button size="large" rounded="pillSoft" onClick={onCloseSubscription}>
            {dsT("manageSubscription.textBtn")}
          </Button>
        </div>
      </div>
    </ModalV2>
  );
};

export default MobileSubscriptionWarningModal;
