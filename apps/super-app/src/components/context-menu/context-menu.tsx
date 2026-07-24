"use client";

import { Popover } from "radix-ui";
import { forwardRef } from "react";

import { useZIndex } from "@/libs/z-index-manager/hooks/use-z-index";
import { compositeStyles } from "@/utils/commons/styles";

import ContextMenuItem from "./context-menu-item";
import type { TContextMenuProps } from "./types";

const ContextMenu = forwardRef<HTMLDivElement, TContextMenuProps>(
  (props, ref) => {
    const {
      open,
      items,
      children,
      portalContainer,
      position,
      onOpenChange,
      selectedOption,
      onSelect,
    } = props;

    const isExistContent = items.length > 0;

    // Get z-index from manager for context menus
    const zIndex = useZIndex({
      enabled: open && isExistContent,
      priority: "normal",
      type: "context-menu",
    });

    return (
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>{children}</Popover.Trigger>
        <Popover.Portal container={portalContainer}>
          {isExistContent && (
            <Popover.Content
              ref={ref}
              side="top"
              align="start"
              style={{
                bottom: position?.bottom,
                left: position?.left,
                position: "fixed",
                zIndex,
              }}
              avoidCollisions={false}
              sideOffset={0}
              alignOffset={0}
              onOpenAutoFocus={(e) => e.preventDefault()}
              role="menu"
              className={compositeStyles(
                "rounded-default thickness-thin border-border-input-default bg-surface-general-secondary p-small-1 min-w-max focus:outline-hidden"
              )}
            >
              {items.map((item, index) => (
                <ContextMenuItem
                  key={index}
                  item={item}
                  tabIndex={-1}
                  isHighlighted={selectedOption?.id === item.id}
                  onClick={onSelect}
                />
              ))}
            </Popover.Content>
          )}
        </Popover.Portal>
      </Popover.Root>
    );
  }
);

ContextMenu.displayName = "ContextMenu";
export default ContextMenu;
