import React, { forwardRef } from "react";

import { choiceButtonVariants } from "./consts";
import type { TChoiceButtonProps } from "./types";

const ChoiceButton = forwardRef<HTMLButtonElement, TChoiceButtonProps>(
  (props, ref) => (
    <button
      ref={ref}
      type="button"
      className={choiceButtonVariants({ ...props })}
      disabled={props.disabled}
      {...props}
    >
      {props.children}
    </button>
  )
);

ChoiceButton.displayName = "ChoiceButton";
export default ChoiceButton;
