"use client";

import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { getAppQRUrl } from "@/utils/commons/request";

import type { TQrAppContentProps } from "./types";

const renderBreak = () => <br className="block" />;

export default function QrAppContent(props: TQrAppContentProps) {
  const { onLinkAction } = props;

  const [, copyToClipboard] = useCopyToClipboard();

  const t = useTranslations("mainLayout.sidebar.qr");
  const commonT = useTranslations("common");

  const openLink = t("openLink");
  const copyLink = t("copyLink");

  const qrValue = getAppQRUrl();

  const handleCopyLink = () => {
    copyToClipboard(qrValue);
    onLinkAction?.("copyLink");
    toast.success(null, {
      closeButton: false,
      description: commonT("toast.copy.successfully"),
    });
  };

  const handleOpenLink = () => {
    onLinkAction?.("openLink");
    globalThis.window.open(qrValue, "_blank");
  };

  return (
    <>
      <div className="gap-v1-structural-content-relaxed p-v1-structural-content-relaxed flex w-full max-w-53 flex-col items-center">
        <h1 className="typo-v1-body-secondary text-v1-text-hierarchy-primary text-center">
          {t.rich("description", {
            break: renderBreak,
          })}
        </h1>
        <QRCodeCanvas
          value={qrValue}
          size={143.51}
          marginSize={2}
          bgColor="#D9D9D9"
          className="rounded-v1-standard"
        />
      </div>
      <div className="gap-v1-structural-content-tight flex w-full items-center justify-between">
        <Button
          variant="secondary"
          size="l"
          className="flex-1 text-nowrap"
          prefixIcon={<SvgIcon name="open" size={24} />}
          onClick={handleOpenLink}
        >
          {openLink}
        </Button>
        <Button
          variant="secondary"
          size="l"
          className="flex-1 text-nowrap"
          prefixIcon={<SvgIcon name="copy" size={24} />}
          onClick={handleCopyLink}
        >
          {copyLink}
        </Button>
      </div>
    </>
  );
}
