"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";
import { IconCheck } from "@cs/icons/check";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "#components/shadcn/dropdown-menu";
import { cn } from "#lib/utils";

const Menubar = ({ className, ...props }: MenubarPrimitive.Props) => (
  <MenubarPrimitive
    data-slot="menubar"
    className={cn(
      "flex h-8 items-center gap-0.5 rounded-lg border p-0.75",
      className
    )}
    {...props}
  />
);

const MenubarMenu = ({
  ...props
}: React.ComponentProps<typeof DropdownMenu>) => (
  <DropdownMenu data-slot="menubar-menu" {...props} />
);

const MenubarGroup = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuGroup>) => (
  <DropdownMenuGroup data-slot="menubar-group" {...props} />
);

const MenubarPortal = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuPortal>) => (
  <DropdownMenuPortal data-slot="menubar-portal" {...props} />
);

const MenubarTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) => (
  <DropdownMenuTrigger
    data-slot="menubar-trigger"
    className={cn(
      "hover:bg-muted aria-expanded:bg-muted flex items-center rounded-sm px-1.5 py-0.5 text-sm font-medium outline-hidden select-none",
      className
    )}
    {...props}
  />
);

const MenubarContent = ({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) => (
  <DropdownMenuContent
    data-slot="menubar-content"
    align={align}
    alignOffset={alignOffset}
    sideOffset={sideOffset}
    className={cn(
      "bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-start-2 data-[side=inline-start]:slide-in-from-end-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 min-w-36 rounded-lg p-1 shadow-md ring-1 duration-100",
      className
    )}
    {...props}
  />
);

const MenubarItem = ({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) => (
  <DropdownMenuItem
    data-slot="menubar-item"
    data-inset={inset}
    data-variant={variant}
    className={cn(
      "group/menubar-item focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:*:[svg]:text-destructive! gap-1.5 rounded-md px-1.5 py-1 text-sm data-disabled:opacity-50 data-inset:ps-7 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  />
);

const MenubarCheckboxItem = ({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) => (
  <MenuPrimitive.CheckboxItem
    data-slot="menubar-checkbox-item"
    data-inset={inset}
    className={cn(
      "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 ps-7 pe-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:ps-7 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="pointer-events-none absolute inset-s-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
      <MenuPrimitive.CheckboxItemIndicator>
        <IconCheck />
      </MenuPrimitive.CheckboxItemIndicator>
    </span>
    {children}
  </MenuPrimitive.CheckboxItem>
);

const MenubarRadioGroup = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioGroup>) => (
  <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />
);

const MenubarRadioItem = ({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) => (
  <MenuPrimitive.RadioItem
    data-slot="menubar-radio-item"
    data-inset={inset}
    className={cn(
      "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex cursor-default items-center gap-1.5 rounded-md py-1 ps-7 pe-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:ps-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  >
    <span className="pointer-events-none absolute inset-s-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
      <MenuPrimitive.RadioItemIndicator>
        <IconCheck />
      </MenuPrimitive.RadioItemIndicator>
    </span>
    {children}
  </MenuPrimitive.RadioItem>
);

const MenubarLabel = ({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel> & {
  inset?: boolean;
}) => (
  <DropdownMenuLabel
    data-slot="menubar-label"
    data-inset={inset}
    className={cn("px-1.5 py-1 text-sm font-medium data-inset:ps-7", className)}
    {...props}
  />
);

const MenubarSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) => (
  <DropdownMenuSeparator
    data-slot="menubar-separator"
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
);

const MenubarShortcut = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>) => (
  <DropdownMenuShortcut
    data-slot="menubar-shortcut"
    className={cn(
      "text-muted-foreground group-focus/menubar-item:text-accent-foreground ms-auto text-xs tracking-widest",
      className
    )}
    {...props}
  />
);

const MenubarSub = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuSub>) => (
  <DropdownMenuSub data-slot="menubar-sub" {...props} />
);

const MenubarSubTrigger = ({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & {
  inset?: boolean;
}) => (
  <DropdownMenuSubTrigger
    data-slot="menubar-sub-trigger"
    data-inset={inset}
    className={cn(
      "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm data-inset:ps-7 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  />
);

const MenubarSubContent = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) => (
  <DropdownMenuSubContent
    data-slot="menubar-sub-content"
    className={cn(
      "bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 min-w-32 rounded-lg p-1 shadow-lg ring-1 duration-100",
      className
    )}
    {...props}
  />
);

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
