"use client";

import * as React from "react";

import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import { DialogContent as BaseDialogContent } from "../ui/dialog";

function SuiteDialog({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseDialogContent>) {
  return (
    <BaseDialogContent
      data-testid={DATA_TEST_ID.suite.custom.suiteDialog}
      className={cn(
        "bg-v1-modal-background-primary",
        "outline-v1-border-structural-subtle ring-0 outline-4 outline-solid",
        "rounded-v1-2xl!",
        "p-v1-structural-component-micro",
        "w-full sm:max-w-fit",
        "**:data-[slot='dialog-close']:text-v1-action-icon-secondary",
        className
      )}
      {...props}
    >
      {children}
    </BaseDialogContent>
  );
}

export { SuiteDialog };
export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
