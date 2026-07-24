import type { ReactNode } from "react";

export interface TConfirmModal {
  className?: string;
  children?: ReactNode;
  open?: boolean;
  width?: number;
  isDisabledSubmit?: boolean;
  title?: string;
  description?: ReactNode;
  showCloseButton?: boolean;
  showProceedButton?: boolean;
  closeText?: string;
  proceedText?: string;
  onClose?: () => void;
  onProceed?: () => void;
}
