import type { Dialog } from "radix-ui";
import type { CSSProperties, ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";

import type { dialogContentVariants } from "../dialog/dialog-variants";

export type TModalSize = NonNullable<
  VariantProps<typeof dialogContentVariants>["size"]
>;

export interface TModalProps {
  open: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  /** Applied to the DialogContent outer element (max-width, width, etc.) */
  containerClassName?: string;
  /** Applied to the inner content wrapper (padding overrides, etc.) */
  className?: string;
  overlayClassName?: string;
  zIndex?: number;
  size?: TModalSize;
  /** Inline max-width override in pixels (use containerClassName or size instead when possible) */
  width?: number;
  centered?: boolean;
  isPreventClickOutside?: boolean;
}

export interface TEditPromptModal {
  className?: string;
  children?: ReactNode;
  open?: boolean;
  width?: number;
  isDisabledSubmit?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
}

export interface TSubscriptionModal {
  className?: string;
  children?: ReactNode;
  containerClassName?: string;
  overlayClassName?: string;
  open: boolean;
  onClose?: () => void;
  width?: number;
  zIndex?: number;
  centered?: boolean;
  isPreventClickOutside?: boolean;
  // z-index is managed by ModalV2 + z-index manager and cannot be overridden by consumers.
  dialogContentProps?: Omit<Dialog.DialogContentProps, "style"> & {
    style?: Omit<CSSProperties, "zIndex">;
  };
}

export interface TModelV3 {
  children?: ReactNode;
  containerClassName?: string;
  open: boolean;
  onClose?: () => void;
  zIndex?: number;
  isPreventClickOutside?: boolean;
}
