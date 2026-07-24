import type { ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";

import type { ButtonProps } from "@/components/button-ds";
import type {
  dialogBodyVariants,
  dialogContentVariants,
  dialogFooterVariants,
} from "@/components/dialog/dialog-variants";

export type TAlertDialogSize = NonNullable<
  VariantProps<typeof dialogContentVariants>["size"]
>;
export type TAlertDialogBodySpacing = NonNullable<
  VariantProps<typeof dialogBodyVariants>["spacing"]
>;
export type TAlertDialogFooterJustify = NonNullable<
  VariantProps<typeof dialogFooterVariants>["justify"]
>;
export type TAlertDialogFooterDirection = NonNullable<
  VariantProps<typeof dialogFooterVariants>["direction"]
>;

/** Button variant inherited directly from the design system's Button component */
export type TAlertDialogButtonVariant = ButtonProps["variant"];

export interface TAlertDialogAction {
  label: string | ReactNode;
  onClick: () => void;
  variant?: TAlertDialogButtonVariant;
  disabled?: boolean;
  className?: string;
}

export interface TAlertDialogCancel {
  label: string | ReactNode;
  onClick?: () => void;
  preventAutoClose?: boolean;
  variant?: TAlertDialogButtonVariant;
  disabled?: boolean;
  className?: string;
}

export interface TAlertDialogHeader {
  title?: string;
  showCloseIcon?: boolean;
  closeIcon?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export interface TAlertDialogBody {
  spacing?: TAlertDialogBodySpacing;
  className?: string;
}

export interface TAlertDialogFooterConfig {
  cancel?: TAlertDialogCancel;
  action?: TAlertDialogAction;
  className?: string;
  justify?: TAlertDialogFooterJustify;
  direction?: TAlertDialogFooterDirection;
}

export interface TAlertDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  header?: TAlertDialogHeader;
  body?: TAlertDialogBody;
  footer?: ReactNode | TAlertDialogFooterConfig;
  className?: string;
  overlayClassName?: string;
  zIndex?: number;
  size?: TAlertDialogSize;
  preventCloseOnOutsideClick?: boolean;
}
