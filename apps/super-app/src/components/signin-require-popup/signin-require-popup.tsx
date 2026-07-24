import { Popover, Tooltip } from "radix-ui";
import React from "react";

import { arrowClassName, contentClassName } from "./consts";
import type {
  TPopoverWrapperProps,
  TSigninRequirePopup,
  TTooltipWrapperProps,
} from "./types";

const TooltipWrapper = React.forwardRef<
  HTMLButtonElement,
  TTooltipWrapperProps
>(
  (
    { content, children, side = "bottom", align = "start", sideOffset = 8 },
    ref
  ) => (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild ref={ref}>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={contentClassName}
            align={align}
            side={side}
            sideOffset={sideOffset}
          >
            {content}
            <Tooltip.Arrow className={arrowClassName} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
);

TooltipWrapper.displayName = "TooltipWrapper";

const PopoverWrapper = React.forwardRef<
  HTMLButtonElement,
  TPopoverWrapperProps
>(
  (
    { content, children, side = "bottom", align = "start", sideOffset = 8 },
    ref
  ) => (
    <Popover.Root>
      <Popover.Trigger asChild ref={ref}>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={contentClassName}
          align={align}
          side={side}
          sideOffset={sideOffset}
        >
          {content}
          <Popover.Arrow className={arrowClassName} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
);

PopoverWrapper.displayName = "PopoverWrapper";

const SigninRequirePopup = React.forwardRef<
  HTMLButtonElement,
  TSigninRequirePopup
>(({ mode, ...restProps }, ref) => {
  if (mode === "tooltip") {
    return <TooltipWrapper {...restProps} ref={ref} />;
  }
  if (mode === "popover") {
    return <PopoverWrapper {...restProps} ref={ref} />;
  }
  return null;
});

SigninRequirePopup.displayName = "SigninRequirePopup";

export default SigninRequirePopup;
