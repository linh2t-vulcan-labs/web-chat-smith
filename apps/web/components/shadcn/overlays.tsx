"use client";

import { IconBell } from "@cs/icons/bell";
import { IconSettings } from "@cs/icons/settings";
import { IconTrashbin } from "@cs/icons/trashbin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@cs/ui/components/shadcn/alert";
import { Button } from "@cs/ui/components/shadcn/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@cs/ui/components/shadcn/command";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@cs/ui/components/shadcn/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cs/ui/components/shadcn/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@cs/ui/components/shadcn/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@cs/ui/components/shadcn/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@cs/ui/components/shadcn/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@cs/ui/components/shadcn/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@cs/ui/components/shadcn/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cs/ui/components/shadcn/tooltip";
import {
  CreditCardIcon,
  FileTextIcon,
  HelpCircleIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { ShadcnGrid, ShadcnPanel, ShadcnSection } from "./shared/section";

const MenuItems = () => (
  <>
    <DropdownMenuGroup>
      <DropdownMenuLabel>Workspace</DropdownMenuLabel>
      <DropdownMenuItem>
        <FileTextIcon />
        New file
        <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <IconSettings />
        Settings
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>PDF</DropdownMenuItem>
        <DropdownMenuItem>Markdown</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem checked>Show sidebar</DropdownMenuCheckboxItem>
    <DropdownMenuRadioGroup value="team">
      <DropdownMenuRadioItem value="team">Team</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="personal">Personal</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">
      <IconTrashbin />
      Delete
    </DropdownMenuItem>
  </>
);

export const ShadcnOverlays = () => (
  <ShadcnSection
    title="Overlays"
    description="Dialogs, menus, popovers, command palette, sheet, drawer, hover card, tooltip, and context menu."
  >
    <TooltipProvider>
      <ShadcnGrid>
        <ShadcnPanel title="Dialog and alert dialog">
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger
                render={<Button variant="outline">Open dialog</Button>}
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite member</DialogTitle>
                  <DialogDescription>
                    Modal content should stay centered and responsive.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-muted/40 rounded-lg border p-3 text-sm">
                  Use this surface to inspect focus trapping and close button
                  placement.
                </div>
                <DialogFooter showCloseButton>
                  <Button>Send invite</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="destructive">Delete</Button>}
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <IconTrashbin />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This checks destructive layout, media, footer actions, and
                    long copy wrapping.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </ShadcnPanel>

        <ShadcnPanel title="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <MoreHorizontalIcon />
                  Actions
                </Button>
              }
            />
            <DropdownMenuContent className="w-56">
              <MenuItems />
            </DropdownMenuContent>
          </DropdownMenu>
        </ShadcnPanel>

        <ShadcnPanel title="Context menu">
          <ContextMenu>
            <ContextMenuTrigger
              render={
                <div className="text-muted-foreground flex h-32 cursor-context-menu items-center justify-center rounded-lg border border-dashed text-sm">
                  Right click or long press this area
                </div>
              }
            />
            <ContextMenuContent>
              <ContextMenuGroup>
                <ContextMenuLabel>Canvas</ContextMenuLabel>
                <ContextMenuItem>
                  Rename
                  <ContextMenuShortcut>↵</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>Drafts</ContextMenuItem>
                    <ContextMenuItem>Published</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuCheckboxItem checked>
                Snap to grid
              </ContextMenuCheckboxItem>
              <ContextMenuRadioGroup value="medium">
                <ContextMenuRadioItem value="small">Small</ContextMenuRadioItem>
                <ContextMenuRadioItem value="medium">
                  Medium
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenu>
        </ShadcnPanel>

        <ShadcnPanel title="Popover and hover card">
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline">
                    <HelpCircleIcon />
                    Details
                  </Button>
                }
              />
              <PopoverContent className="w-72">
                <PopoverHeader>
                  <PopoverTitle>Popover title</PopoverTitle>
                  <PopoverDescription>
                    Positioning should remain stable near viewport edges.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>

            <HoverCard>
              <HoverCardTrigger
                render={<Button variant="ghost">Hover profile</Button>}
              />
              <HoverCardContent className="w-72">
                <div className="space-y-1">
                  <div className="font-medium">ChatSmith UI</div>
                  <p className="text-muted-foreground text-sm">
                    Hover content checks pointer and keyboard behavior.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </ShadcnPanel>

        <ShadcnPanel title="Sheet and drawer">
          <div className="flex flex-wrap gap-2">
            <Sheet>
              <SheetTrigger
                render={<Button variant="outline">Open sheet</Button>}
              />
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet panel</SheetTitle>
                  <SheetDescription>
                    Inspect side placement, scroll, and safe close affordance.
                  </SheetDescription>
                </SheetHeader>
                <SheetFooter>
                  <Button>Save</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Drawer>
              <DrawerTrigger
                render={<Button variant="outline">Open drawer</Button>}
              />
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Drawer panel</DrawerTitle>
                  <DrawerDescription>
                    Mobile-style drawer should stay readable on desktop too.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Continue</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </ShadcnPanel>

        <ShadcnPanel title="Command and tooltip">
          <Command className="border">
            <CommandInput placeholder="Search commands" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Actions">
                <CommandItem>
                  <IconBell />
                  Notifications
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <CreditCardIcon />
                  Billing
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </CommandList>
          </Command>
          <div className="mt-3">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Show tooltip"
                  >
                    <HelpCircleIcon />
                  </Button>
                }
              />
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </div>
          <CommandDialog open={false}>
            <Command>
              <CommandInput placeholder="Dialog command palette" />
              <CommandList>
                <CommandGroup heading="Hidden mounted check">
                  <CommandItem>Command dialog item</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </CommandDialog>
        </ShadcnPanel>
      </ShadcnGrid>
    </TooltipProvider>
  </ShadcnSection>
);
