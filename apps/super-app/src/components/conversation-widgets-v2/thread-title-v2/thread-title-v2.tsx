import React, { forwardRef } from "react";

import { TextAnimation } from "@/components/text-animation";
import { compositeStyles } from "@/utils/commons/styles";

import type { TThreadTitleProps } from "./types";

const ThreadTitleV2 = forwardRef<HTMLInputElement, TThreadTitleProps>(
  (props, ref) => {
    const {
      className = "",
      isEdit,
      value,
      onChange,
      onBlur,
      onKeyDown,
    } = props;
    const inputStyles =
      "typo-v1-title-md-light flex-1 text-v1-text-hierarchy-primary focus:outline-solid min-h-5";

    return (
      <div className="gap-v1-2 ps-v1-structural-content-micro line-clamp-1 flex flex-1 items-center">
        {isEdit ? (
          <input
            autoFocus
            type="text"
            className={compositeStyles(
              inputStyles,
              "bg-transparent",
              className
            )}
            ref={ref}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
          />
        ) : (
          <TextAnimation className={compositeStyles(inputStyles, className)}>
            {value}
          </TextAnimation>
        )}
      </div>
    );
  }
);

ThreadTitleV2.displayName = "ThreadTitleV2";

export default ThreadTitleV2;
