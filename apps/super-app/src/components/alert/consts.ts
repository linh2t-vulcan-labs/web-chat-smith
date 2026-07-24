import { tv } from "tailwind-variants";

import type { TAlertIcon } from "./type";

export const alertVariants = tv({
  base: "p-medium-2 gap-medium-1.5 text-text-general-primary flex rounded-xl",
  defaultVariants: {
    type: "success",
  },
  variants: {
    type: {
      error: "bg-surface-system-error",
      info: "bg-surface-system-success",
      success: "bg-surface-system-success",
      warning: "bg-surface-system-error",
    },
  },
});

export const iconVariants: Record<TAlertIcon, string> = {
  error: "/icons/error-circle.svg",
  info: "/icons/info.svg",
  success: "/icons/success-circle.svg",
  warning: "/icons/warning.svg",
};
