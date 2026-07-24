import { forwardRef } from "react";

import { SvgIcon } from "@/components/svg-icon-ds";
import { compositeStyles } from "@/utils/commons/styles";

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
    width = 74,
    collapsible = "offcanvas",
    children,
    style,
    side = "left",
    className,
    isDesktop,
    onSheetOpenChange,
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
          "bg-v1-surface-hierarchy-base",
          "h-screen max-h-screen overflow-hidden will-change-auto",
          "transition-all duration-300 ease-in-out"
        )}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={compositeStyles(
            "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[collapsible=icon]:w-18.5",
            "group-data-[side=right]:rotate-180"
          )}
        />

        <div
          className={compositeStyles(
            "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=icon]:w-18.5 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] rtl:right-0 rtl:left-auto"
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
    <Sheet onOpenChange={onSheetOpenChange} open={open}>
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
        "gap-v1-4 px-v1-3 pb-v1-3 pt-v1-2 inline-flex w-full",
        className
      )}
      {...restProps}
    >
      <h1 className="flex-1">{sidebarTitle}</h1>
      <SvgIcon name="x" size={24} className="" onClick={onClosed} />
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
          "gap-v1-2 flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden",
          className
        )}
        {...restProps}
      />
    );
  }
);

SidebarContent.displayName = "SidebarContent";

export { Sidebar };
