import type { ConfirmationOptionType } from "./confirmation";

export interface ConfirmDialogProps extends ConfirmationOptionType {
  open: boolean;
  onOK: () => void;
  onClose: () => void;
}
