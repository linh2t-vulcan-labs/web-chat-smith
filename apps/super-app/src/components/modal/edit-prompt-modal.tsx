import { useTranslations } from "next-intl";
import { Dialog, VisuallyHidden } from "radix-ui";

import { compositeStyles } from "@/utils/commons/styles";

import { Button } from "../button";
import type { TEditPromptModal } from "./types";

export default function EditPromptModal({
  className: _className = "",
  children,
  open = false,
  width,
  isDisabledSubmit = false,
  onClose,
  onSubmit,
}: TEditPromptModal) {
  const gapsModal = "max-h-[calc(100vh-80px)] max-w-[calc(100vw-40px)]";
  const centeredModal =
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
  const styledModal = "bg-surface-general-tertiary rounded-default";

  const commonT = useTranslations("common");

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-surface-general-modal2 fixed inset-0 z-99" />
        <Dialog.Content aria-describedby={undefined}>
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Title</Dialog.Title>
          </VisuallyHidden.Root>
          <div
            className={compositeStyles(
              "z-99",
              gapsModal,
              centeredModal,
              styledModal,
              "flex flex-col"
            )}
            style={{ width: `${width || 586}px` }}
          >
            <div className="border-border-general-primary p-medium-3 flex-1 overflow-y-auto border-b">
              {children}
            </div>
            <div className="gap-medium-2 rounded-default bg-surface-general-tertiary p-medium-3 flex">
              <Button color="line" size="large" onClick={onClose}>
                {commonT("cta.cancel")}
              </Button>
              <Button
                size="large"
                onClick={onSubmit}
                disabled={isDisabledSubmit}
              >
                {commonT("cta.apply")}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
