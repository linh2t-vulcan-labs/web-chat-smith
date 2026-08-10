"use client";

import { IconChevronRight } from "@cs/icons/chevron-right";
import { IconHome } from "@cs/icons/home";
import { IconSearch } from "@cs/icons/search";
import { IconSettings } from "@cs/icons/settings";
import { IconUser } from "@cs/icons/user";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cs/ui/components/shadcn/accordion";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@cs/ui/components/shadcn/breadcrumb";
import { Button } from "@cs/ui/components/shadcn/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@cs/ui/components/shadcn/collapsible";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@cs/ui/components/shadcn/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@cs/ui/components/shadcn/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@cs/ui/components/shadcn/pagination";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@cs/ui/components/shadcn/sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cs/ui/components/shadcn/tabs";
import { TooltipProvider } from "@cs/ui/components/shadcn/tooltip";
import { FileTextIcon, MoreHorizontalIcon, PanelLeftIcon } from "lucide-react";
import * as React from "react";

import { ShadcnGrid, ShadcnPanel, ShadcnSection } from "./shared/section";

const ShadcnSidebarPreviewContent = () => {
  const { state } = useSidebar();

  return (
    <SidebarInset className="min-w-0 bg-transparent p-2 md:m-0! md:rounded-none! md:shadow-none!">
      <div className="bg-background flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">Preview Workspace</div>
          <p className="text-muted-foreground text-xs">
            Sidebar state: <span className="font-medium">{state}</span>
          </p>
        </div>
        <SidebarTrigger aria-label="Toggle example sidebar" />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {[
          ["Drafts", "12"],
          ["Reviews", "4"],
          ["Published", "28"],
        ].map(([label, value]) => (
          <div key={label} className="bg-muted/20 rounded-lg border px-3 py-2">
            <div className="text-muted-foreground text-xs">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg border">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="text-sm font-medium">Recent activity</div>
          <Button size="xs" variant="ghost">
            View all
          </Button>
        </div>
        <div className="divide-y">
          {["Navigation QA", "Form controls", "Overlay states"].map((item) => (
            <div key={item} className="flex items-center gap-2 px-3 py-2">
              <FileTextIcon
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 truncate text-sm">{item}</div>
              <span className="text-muted-foreground text-xs">Today</span>
            </div>
          ))}
        </div>
      </div>
    </SidebarInset>
  );
};

const ShadcnSidebarShell = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="bg-muted/30 relative isolate h-[24rem] overflow-hidden rounded-xl border p-2">
      <TooltipProvider delay={300}>
        <SidebarProvider
          open={open}
          onOpenChange={setOpen}
          className="h-full min-h-0! overflow-hidden rounded-lg bg-transparent [&_[data-slot=sidebar-container]]:transition-[width] [&_[data-slot=sidebar-container]]:duration-150 [&_[data-slot=sidebar-container]]:ease-out [&_[data-slot=sidebar-container]]:will-change-[width] [&_[data-slot=sidebar-gap]]:transition-[width] [&_[data-slot=sidebar-gap]]:duration-150 [&_[data-slot=sidebar-gap]]:ease-out [&_[data-slot=sidebar-gap]]:will-change-[width] [&_[data-slot=sidebar-inset]]:transition-none [&_[data-slot=sidebar-menu-button]]:transition-colors"
          style={
            {
              "--sidebar-width": "14rem",
              "--sidebar-width-icon": "3rem",
            } as React.CSSProperties
          }
        >
          <Sidebar
            variant="inset"
            collapsible="icon"
            className="absolute! inset-y-0! h-full! max-h-full!"
          >
            <SidebarHeader className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="h-8 gap-2 p-0 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0!"
                    tooltip="QA"
                  >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
                      <IconHome className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 text-start">
                      <div className="truncate text-sm font-medium">
                        ChatSmith QA
                      </div>
                      <div className="text-sidebar-foreground/70 truncate text-xs">
                        Component sandbox
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup className="p-2">
                <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive
                        className="h-8 gap-2 p-2"
                        tooltip="Home"
                      >
                        <IconHome aria-hidden="true" />
                        <span>Home</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>3</SidebarMenuBadge>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className="h-8 gap-2 p-2"
                        tooltip="Search"
                      >
                        <IconSearch aria-hidden="true" />
                        <span>Search</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        aria-label="More search actions"
                        showOnHover
                      >
                        <MoreHorizontalIcon aria-hidden="true" />
                      </SidebarMenuAction>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#sidebar-shell-example">
                            <span>Saved Search</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#sidebar-shell-example">
                            <span>Recent Queries</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className="h-8 gap-2 p-2"
                        tooltip="Settings"
                      >
                        <IconSettings aria-hidden="true" />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="h-8 gap-2 p-2"
                    tooltip="Profile"
                  >
                    <IconUser aria-hidden="true" />
                    <span>An Khoa</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="h-8 gap-2 p-2"
                    onClick={() => setOpen((current) => !current)}
                    tooltip={open ? "Collapse" : "Expand"}
                  >
                    <PanelLeftIcon aria-hidden="true" />
                    <span>{open ? "Collapse" : "Expand"} Sidebar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <ShadcnSidebarPreviewContent />
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
};

export const ShadcnNavigation = () => (
  <ShadcnSection
    title="Navigation"
    description="Navigation, disclosure, and app-shell components with responsive and RTL-sensitive alignment."
  >
    <ShadcnGrid className="xl:grid-cols-2">
      <ShadcnPanel title="Breadcrumb, pagination, tabs">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#navigation-examples">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Examples</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#navigation-examples-page-1" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#navigation-examples-page-1" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#navigation-examples-page-2">
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#navigation-examples-page-2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <Tabs defaultValue="preview" className="mt-4">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent
            value="preview"
            className="text-muted-foreground text-sm"
          >
            Preview panel content.
          </TabsContent>
          <TabsContent value="code" className="text-muted-foreground text-sm">
            Code panel content.
          </TabsContent>
        </Tabs>
      </ShadcnPanel>

      <ShadcnPanel title="Accordion and collapsible">
        <Accordion defaultValue={["one"]}>
          <AccordionItem value="one">
            <AccordionTrigger>Responsive behavior</AccordionTrigger>
            <AccordionContent>
              This copy wraps across breakpoints and should keep trigger icons
              aligned.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="two">
            <AccordionTrigger>RTL behavior</AccordionTrigger>
            <AccordionContent>
              Direction examples below flip inline spacing and chevrons.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Collapsible className="mt-4 rounded-lg border p-3">
          <CollapsibleTrigger render={<Button variant="ghost" />}>
            <IconChevronRight />
            Toggle details
          </CollapsibleTrigger>
          <CollapsibleContent className="text-muted-foreground pt-2 text-sm">
            Collapsible content should animate without shifting neighboring
            panels.
          </CollapsibleContent>
        </Collapsible>
      </ShadcnPanel>

      <ShadcnPanel title="Menubar">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New tab <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>New window</MenubarItem>
              <MenubarSeparator />
              <MenubarCheckboxItem checked>Show sidebar</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value="comfortable">
                <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
                <MenubarRadioItem value="comfortable">
                  Comfortable
                </MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </ShadcnPanel>

      <ShadcnPanel title="Navigation menu">
        <NavigationMenu id="navigation-menu-example">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-72 gap-1 p-2">
                  <a
                    href="#navigation-menu-example"
                    className="hover:bg-muted focus:bg-muted focus-visible:ring-ring/50 flex items-center gap-2 rounded-md p-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4"
                  >
                    <IconHome />
                    Dashboard
                  </a>
                  <a
                    href="#navigation-menu-example"
                    className="hover:bg-muted focus:bg-muted focus-visible:ring-ring/50 flex items-center gap-2 rounded-md p-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4"
                  >
                    <IconSettings />
                    Settings
                  </a>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#navigation-menu-example">
                Docs
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </ShadcnPanel>

      <ShadcnPanel
        id="sidebar-shell-example"
        title="Sidebar shell"
        className="md:col-span-2 xl:col-span-2"
      >
        <ShadcnSidebarShell />
      </ShadcnPanel>
    </ShadcnGrid>
  </ShadcnSection>
);
