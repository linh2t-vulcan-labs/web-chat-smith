import type { VariantProps } from "tailwind-variants";

import type { alertVariants } from "./consts";

export type TAlertVariants = VariantProps<typeof alertVariants>;
export type TAlertIcon = "info" | "success" | "warning" | "error";

export type TAlertProps = TAlertVariants & {
  className?: string;
  children: React.ReactNode;
  title?: string;
  isShowIcon?: boolean;
  onClose?: () => void;
  action?: {
    label: string | React.ReactNode;
    onClick: () => void;
  };
};
