import { forwardRef } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import type { TWrapperInputProps } from "./types";

const WrapperInputForm = forwardRef<HTMLDivElement, TWrapperInputProps>(
  (props: TWrapperInputProps, ref) => {
    const { children, className } = props;
    return (
      <div
        className={compositeStyles(
          "placeholder:text-bodyM-neutral focus:bg-surface-input-hover border-border-input-default text-bodyM-neutral text-text-input-focus disabled:text-text-input-disabled placeholder:text-text-input-placeholder rounded-default git inline-flex w-full resize-none border p-1 outline-hidden transition duration-300 ease-out",
          className
        )}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
WrapperInputForm.displayName = "WrapperInputForm";

export default WrapperInputForm;
