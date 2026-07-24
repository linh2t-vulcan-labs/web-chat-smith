import { forwardRef } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { buttonAnimVariants } from "./consts";
import type { TButtonAnimProps } from "./types";

import styles from "./styles.module.scss";

const ButtonAnimationV2 = forwardRef<HTMLButtonElement, TButtonAnimProps>(
  (
    {
      className,
      size,
      variant: _variant = "teal",
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={compositeStyles(
        buttonAnimVariants({
          className,
          size,
        }),
        styles["button-animation-teal"]
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
);

ButtonAnimationV2.displayName = "ButtonAnimationV2";

export default ButtonAnimationV2;
