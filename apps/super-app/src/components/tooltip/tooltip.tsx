import { Tooltip } from "radix-ui";
import React, { useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useZIndex } from "@/libs/z-index-manager/hooks/use-z-index";
import { compositeStyles } from "@/utils/commons/styles";

import type { TTooltipProps } from "./types";

function ToolTip({
  classNames = "",
  children,
  content,
  color = "light",
  side = "top",
  align = "center",
  delayDuration = 200,
  isEnabled = true,
  triggerMode = "hover",
}: TTooltipProps) {
  // Get z-index from manager for tooltips
  const zIndex = useZIndex({
    enabled: isEnabled,
    priority: "normal",
    type: "tooltip",
  });
  const isDesktop = useMediaQuery("md");
  const [open, setOpen] = useState(false);

  const isClickMode =
    triggerMode === "click" || (triggerMode === "auto" && !isDesktop);

  const theme = {
    dark: {
      arrow: "fill-surface-general-tertiary",
      background: "bg-surface-general-tertiary",
      text: "text-text-general-secondary",
    },
    light: {
      arrow: "fill-neutral-150",
      background: "bg-neutral-150",
      text: "text-text-general-secondary dark:text-text-general-inverse",
    },
  };

  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <span
            onClick={
              isClickMode && isEnabled ? () => setOpen((v) => !v) : undefined
            }
            onKeyDown={
              isClickMode && isEnabled
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setOpen((v) => !v);
                    }
                  }
                : undefined
            }
          >
            {children}
          </span>
        </Tooltip.Trigger>

        {isEnabled && (
          <Tooltip.Portal>
            <Tooltip.Content
              side={side}
              align={align}
              className={compositeStyles(
                "animate-fadeIn rounded-soft p-small-0.75 text-footnoteM-highlight shadow-lg",
                theme[color].background,
                theme[color].text,
                classNames
              )}
              style={{ zIndex }}
              sideOffset={5}
            >
              {content}
              <Tooltip.Arrow className={compositeStyles(theme[color].arrow)} />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default ToolTip;
