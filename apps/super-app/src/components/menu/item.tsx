import { forwardRef } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import type { TMenuItemProps } from "./types";

const MenuItem = forwardRef<HTMLButtonElement, Omit<TMenuItemProps, "key">>(
  (props, ref) => {
    const { icon, label, customElement, className, onClick } = props;

    if (customElement) {
      return customElement;
    }

    return (
      <button
        ref={ref}
        type="button"
        className={compositeStyles(
          "py-small-1 pl-medium-1.5 pr-small-1 gap-medium-1.5 hover:bg-surface-input-hover rounded-soft inline-flex cursor-pointer items-center",
          className
        )}
        onClick={onClick}
      >
        {icon}
        <p className="text-bodyS-neutral text-text-general-secondary flex-1 text-start">
          {label}
        </p>
      </button>
    );
  }
);

MenuItem.displayName = "MenuItem";

export default MenuItem;
