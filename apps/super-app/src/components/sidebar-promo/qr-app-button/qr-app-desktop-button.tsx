"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/button-ds";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { LIST_LANGUAGE_SUPPORTED } from "@/i18n/constant";
import { compositeStyles } from "@/utils/commons/styles";

import { useClickQrAppButton } from "./hooks/use-click-qr-app-button";
import QRApp from "./qr-app-content";

export default function QrAppDesktopButton() {
  const [open, setOpen] = useState(false);
  const { handleClickQrAppButton, handleActionQrAppButton } =
    useClickQrAppButton();
  const locale = useLocale();
  const dropdownContentWidth =
    locale === LIST_LANGUAGE_SUPPORTED.JA ? "w-[340px]" : "w-[327px]";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="s"
          className={cn(
            "text-v1-icons-hierarchy-primary hover:border-v1-border-interactive-hover box-border w-max rounded-xl border border-transparent bg-transparent transition-all duration-200",
            { "border-v1-border-structural-default": open }
          )}
          iconOnly
          prefixIcon={<SvgIcon name="phone" size={20} />}
          onClick={() => {
            handleClickQrAppButton();
          }}
        />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={36}
        alignOffset={0}
        className={compositeStyles(
          "rounded-v1-xl p-v1-structural-content-relaxed bg-v1-surface-hierarchy-raised border-v1-border-structural-subtle gap-v1-structural-content-relaxed flex flex-col items-center border-4",
          dropdownContentWidth
        )}
      >
        <QRApp onLinkAction={handleActionQrAppButton} />
      </PopoverContent>
    </Popover>
  );
}
