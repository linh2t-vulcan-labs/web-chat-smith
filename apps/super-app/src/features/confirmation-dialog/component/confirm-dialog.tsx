import { Dialog } from "radix-ui";
import React from "react";

import { ButtonV2 } from "@/components/button-v2";
import { SVGIcon } from "@/components/svg-icon";

import type { ConfirmDialogProps } from "../types/dialog";

const CONFIRM_DIALOG_Z_INDEX = 100;

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  alertDialog,
  onOK,
  onClose,
}) => {
  const avoidDefaultDomBehavior = (e: Event) => {
    if (!alertDialog) {
      e.preventDefault();
    }
  };
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="bg-surface-general-modal2 fixed inset-0"
          style={{ zIndex: CONFIRM_DIALOG_Z_INDEX }}
        />
        <Dialog.DialogContent
          aria-describedby={undefined}
          onPointerDownOutside={avoidDefaultDomBehavior}
          onInteractOutside={avoidDefaultDomBehavior}
          className="rounded-default bg-surface-general-tertiary p-medium-2 absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-hidden"
          style={{
            width: "426px",
            zIndex: CONFIRM_DIALOG_Z_INDEX,
          }}
          // Prevent propagation to avoid triggering any underlying drag and drop handlers
          onDragOver={(e) => e.stopPropagation()}
          onDrop={(e) => e.stopPropagation()}
        >
          <Dialog.Close asChild>
            <ButtonV2
              color="text"
              className="end-medium-2 top-medium-2.5 absolute inline-flex appearance-none items-center justify-center p-0! focus:outline-hidden"
              startIcon={
                <SVGIcon
                  src="/icons/outlined/closed.svg"
                  width={16}
                  height={16}
                  className="text-text-general-tertiary"
                />
              }
            />
          </Dialog.Close>
          {title && (
            <Dialog.Title className="text-bodyL-highlight text-text-general-secondary">
              {title}
            </Dialog.Title>
          )}
          <Dialog.Description asChild>
            <div>
              {message && (
                <div className="pt-small-1 text-bodyS-neutral text-text-general-tertiary">
                  {message}
                </div>
              )}
              <div className="mt-large-4">
                {alertDialog ? (
                  <div className="flex justify-center">
                    <ButtonV2
                      color="primary"
                      className="px-medium-2.5"
                      onClick={onClose}
                      style={{ width: "120px" }}
                    >
                      OK
                    </ButtonV2>
                  </div>
                ) : (
                  <div className="gap-small-1 flex justify-end">
                    <ButtonV2
                      color="outline"
                      className="px-medium-2.5"
                      onClick={onClose}
                    >
                      {cancelText}
                    </ButtonV2>
                    <ButtonV2
                      color="dangerV2"
                      className="px-medium-2.5 text-text-general-inverse dark:text-text-general-primary"
                      onClick={onOK}
                    >
                      {confirmText || "OK"}
                    </ButtonV2>
                  </div>
                )}
              </div>
            </div>
          </Dialog.Description>
        </Dialog.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
