"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Dialog, VisuallyHidden } from "radix-ui";

import { OVERLAY_Z_INDEX } from "@/config/z-index";
import { useZIndex } from "@/libs/z-index-manager";
import { compositeStyles } from "@/utils/commons/styles";

import type { TLoadingIcon } from "./types";

const gapsModal = "max-h-[calc(100vh-80px)] max-w-[calc(100vw-40px)]";
const centeredModal =
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
const styledModal =
  "bg-surface-general-tertiary rounded-default flex flex-col justify-center items-center py-medium-2.5 px-medium-3 space-y-medium-1.5 ";

export default function LoadingProcessing(props: TLoadingIcon) {
  const { isSpinning = false, text = "loading" } = props;

  const t = useTranslations("common");
  const zIndex = useZIndex({
    baseZIndex: OVERLAY_Z_INDEX.MODAL_CRITICAL,
    enabled: isSpinning,
    priority: "critical",
    type: "modal",
  });

  return (
    <Dialog.Root open={isSpinning}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="bg-surface-general-modal2 fixed inset-0"
          style={{ zIndex }}
        />
        <Dialog.Content aria-describedby={undefined}>
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Title</Dialog.Title>
          </VisuallyHidden.Root>
          <div
            className={compositeStyles(gapsModal, centeredModal, styledModal)}
            style={{ zIndex }}
          >
            <div className="animate-spin">
              <Image
                src="/images/generating.png"
                alt="loading..."
                width={32}
                height={32}
              />
            </div>
            <p className="text-footnoteM-highlight text-text-action-tertiary-default">
              {t(text)}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
