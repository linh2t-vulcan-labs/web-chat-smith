import { forwardRef } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { SVGIcon } from "../svg-icon";
import { chipVariants } from "./constant";
import type { TArrowButtonProps } from "./types";

const Chip = forwardRef<HTMLButtonElement, Readonly<TArrowButtonProps>>(
  (props, ref) => {
    const { className, classIconName, onClick, color, size, icon } = props;

    return (
      <button
        ref={ref}
        type="button"
        className={compositeStyles(chipVariants({ color, size }), className)}
        onClick={onClick}
      >
        {typeof icon === "string" ? (
          <SVGIcon
            src={icon}
            className={classIconName}
            width={24}
            height={24}
          />
        ) : (
          icon
        )}
      </button>
    );
  }
);

Chip.displayName = "Chip";

export default Chip;
