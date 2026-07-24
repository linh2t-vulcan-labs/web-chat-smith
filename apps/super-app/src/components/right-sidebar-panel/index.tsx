import { forwardRef } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { Icon } from "../icon";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../sheet";
import type { TSidebarHeaderProps, TSidebarProps } from "./types";

const Sidebar = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & TSidebarProps
>((props, ref) => {
  const {
    open,
    width = 304,
    collapsible = "offcanvas",
    children,
    style,
    side = "left",
    className,
    isDesktop,
    ...restProps
  } = props;
  const state = open ? "expanded" : "collapsed";

  if (isDesktop) {
    return (
      <div
        ref={ref}
        data-state={state}
        data-sidebar="sidebar"
        data-collapsible={state === "collapsed" ? collapsible : ""}
        style={
          {
            ...style,
            "--sidebar-width": `${width}px`,
          } as React.CSSProperties
        }
        className={compositeStyles(
          "group peer hidden md:block",
          "bg-surface-general-glass",
          "h-screen max-h-screen overflow-hidden will-change-auto",
          "transition-all duration-300 ease-in-out"
        )}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={compositeStyles(
            "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[collapsible=icon]:w-[60px]",
            "group-data-[side=right]:rotate-180"
          )}
        />

        <div
          className={compositeStyles(
            "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=icon]:w-[60px] group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] rtl:right-0 rtl:left-auto"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] rtl:right-auto rtl:left-0",

            className
          )}
          {...restProps}
        >
          <div
            data-sidebar="sidebar"
            className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex size-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Sheet open={open}>
      <SheetContent
        className={compositeStyles("flex w-full flex-col", className)}
        side={side}
        {...restProps}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar</SheetTitle>
          <SheetDescription>Displays the mobile sidebar.</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
});

Sidebar.displayName = "Sidebar";

const SidebarHeader = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & TSidebarHeaderProps
>((props, ref) => {
  const { sidebarTitle, onClosed, className, ...restProps } = props;

  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={compositeStyles(
        "gap-medium-2 px-medium-1.5 pb-medium-1.5 pt-small-1 inline-flex w-full",
        className
      )}
      {...restProps}
    >
      <h1 className="text-bodyM-medium text-text-general-secondary flex-1">
        {sidebarTitle}
      </h1>
      <Icon
        name="closed"
        size={24}
        className="text-text-general-secondary hover:text-border-input-hover cursor-pointer"
        onClick={onClosed}
      />
    </div>
  );
});

SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  (props, ref) => {
    const { className, ...restProps } = props;
    return (
      <div
        ref={ref}
        data-sidebar="content"
        className={compositeStyles(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          className
        )}
        {...restProps}
      />
    );
  }
);

SidebarContent.displayName = "SidebarContent";

export { Sidebar, SidebarContent, SidebarHeader };
