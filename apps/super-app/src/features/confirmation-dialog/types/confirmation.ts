export interface ConfirmationOptionType {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  catchOnCancel?: boolean;
  alertDialog?: boolean;
}

export type ConfirmationServiceType = (
  options: ConfirmationOptionType
) => Promise<boolean>;
