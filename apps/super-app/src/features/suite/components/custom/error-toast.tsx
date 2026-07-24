"use client";

import { toast } from "sonner";

import XIcon from "@/features/suite/assets/icons/x-icon.svg";
import { cn } from "@/features/suite/utils/classnames";

import ErrorIcon from "../../assets/icons/error-icon.svg";

interface ErrorToastContentProps {
  title: string;
  description?: string;
  toastId: string | number;
}

function ErrorToastContent({
  title,
  description,
  toastId,
}: ErrorToastContentProps) {
  return (
    <div className="suite-root">
      <div
        className={cn(
          "flex flex-row items-center",
          "gap-v1-structural-content-tight",
          "p-v1-structural-content-tight",
          "bg-v1-surface-hierarchy-toast",
          "outline-v1-border-structural-soften outline-1 outline-solid",
          "rounded-v1-large",
          "w-full"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center",
            "bg-v1-surface-status-error-muted",
            "rounded-v1-pill",
            "p-v1-structural-content-micro",
            "size-8 overflow-hidden"
          )}
        >
          <ErrorIcon className="text-v1-icons-hierarchy-primary size-4" />
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            "gap-v1-optical-subtle"
          )}
        >
          <p
            className={cn(
              "typo-v1-title-md-normal",
              "text-v1-text-hierarchy-primary"
            )}
          >
            {title}
          </p>

          {description && (
            <p
              className={cn(
                "typo-v1-caption-smsecondary-helper",
                "text-v1-text-hierarchy-secondary"
              )}
            >
              {description}
            </p>
          )}
        </div>

        <button
          aria-label="Dismiss"
          className={cn(
            "flex shrink-0 items-center justify-center",
            "rounded-v1-pill",
            "p-v1-structural-content-micro"
          )}
          onClick={() => toast.dismiss(toastId)}
          type="button"
        >
          <XIcon className="text-v1-icons-hierarchy-secondary size-4" />
        </button>
      </div>
    </div>
  );
}

export function toastConnectionLost() {
  return errorToast("Connection lost", "Please check your internet connection");
}

export function toastGenerationFailed() {
  return errorToast("Generation failed", "Please try again");
}

export function toastSendingFailed() {
  return errorToast("Sending failed", "Please try again later");
}

export function toastSomethingWentWrong() {
  return errorToast("Something went wrong", "Please try again later");
}

export function toastEditTitleFailed() {
  return errorToast("Updating failed", "Please try again later");
}

export function errorToast(title: string, description?: string) {
  return toast.custom(
    (t) => (
      <ErrorToastContent description={description} title={title} toastId={t} />
    ),
    {
      classNames: {
        toast:
          "bg-transparent! p-0! border-0! shadow-none! gap-0! rounded-none!",
      },
    }
  );
}
