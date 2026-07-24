"use client";

import { VisuallyHidden } from "radix-ui";
import type { ReactNode } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { useMediaQuery } from "@/hooks/use-media-query";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetPortal,
  SheetTitle,
} from "../sheet";

interface TTaskModalProps {
  title: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  width?: number;
}

function TaskModal({
  title,
  children,
  open,
  onClose,
  width: _width = 1028,
}: TTaskModalProps) {
  const isMedium = useMediaQuery("md");

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetPortal>
        <SheetContent
          className="rounded-t-default md:rounded-default flex h-full max-h-[calc(100vh-48px)] flex-col md:h-auto md:w-[1000px] md:max-w-[calc(100vw-40px)]"
          side={isMedium ? "center" : "bottom"}
        >
          <div className="px-medium-2 pt-medium-2 md:pt-medium-3 md:px-large-4 md:pb-small-0.75 pb-small-1 flex items-center justify-between">
            <VisuallyHidden.Root asChild>
              <SheetDescription />
            </VisuallyHidden.Root>

            <SheetTitle className="text-text-general-secondary text-title1">
              {title}
            </SheetTitle>
            <SheetClose asChild>
              <SVGIcon
                src="/icons/close.svg"
                className="text-icon-general-tertiary hover:text-icon-general-secondary/70 transition-colors duration-300 ease-out hover:cursor-pointer"
                width={24}
                height={24}
              />
            </SheetClose>
          </div>
          <div className="h-full flex-1 overflow-y-auto">{children}</div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}

export default TaskModal;
