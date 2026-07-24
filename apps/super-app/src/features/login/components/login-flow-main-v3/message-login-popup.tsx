"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { ModalV2 } from "@/components/modal";
import { useRouter } from "@/i18n/navigation";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { clearAuthStorage } from "@/utils/commons/helpers";

import type { TMessageLoginPopup } from "./types";

export default function MessageLoginPopup({ open }: TMessageLoginPopup) {
  const [_open, setOpen] = useState(open);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const router = useRouter();
  const t = useTranslations("MessageLoginPopup");
  const title = t("Login Error");
  const expireLabel = t("Expired Label");
  const buttonLabel = t("Button");

  const handleClosePopup = () => {
    router.replace("/login", { scroll: false });
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    sendTrackingEvent({
      name: EventKeys.RefreshTokenFailed,
    });
    clearAuthStorage();
  }, [sendTrackingEvent]);

  return (
    <ModalV2
      open={_open}
      isPreventClickOutside
      zIndex={100}
      containerClassName="w-full md:w-fit px-medium-2 py-large-8 md:p-large-10 bg-surface-general-secondary!"
      className="space-y-medium-3 flex flex-col items-center justify-center p-0!"
    >
      <Image
        src="/images/login/error.png"
        width={150}
        height={180}
        alt="error"
      />
      <div className="gap-small-0.75 text-text-general-secondary flex flex-col text-center">
        <h3 className="text-memoji">{title}</h3>
        <p className="text-bodyS-neutral">{expireLabel}</p>
      </div>
      <div className="mx-auto">
        <Button color="primary" onClick={handleClosePopup}>
          {buttonLabel}
        </Button>
      </div>
    </ModalV2>
  );
}
