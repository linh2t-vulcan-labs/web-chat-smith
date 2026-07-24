"use client";

import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { CONVERSATION_URL } from "@/utils/constants/url";

import { Button } from "../button";
import type { TDownloadAppButtonProps } from "./types";

export default function DownloadAppButton({
  text,
  ...restProps
}: TDownloadAppButtonProps) {
  const router = useRouter();
  const t = useTranslations("DownloadAppButton");

  const handleClickButton = () => {
    router.push(CONVERSATION_URL);
  };

  return (
    <Button
      id={TRACKING_ELEMENT_ID.LANDING_PAGE.START_CHATTING}
      color="primary"
      onClick={handleClickButton}
      {...restProps}
    >
      {t(text)}
    </Button>
  );
}
