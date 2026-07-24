"use client";

import { toast } from "sonner";

import { ToastMessage } from "@/components/toast-message";

interface TShowToastSuccessOptions {
  title?: string;
  duration?: number;
}

export function showToastSuccess(
  description: string,
  options?: TShowToastSuccessOptions
) {
  const title = options?.title ?? "Success";
  const duration = options?.duration ?? 3000;

  toast.custom(
    () => (
      <ToastMessage variant="success" title={title} description={description} />
    ),
    {
      className:
        "p-0! gap-0! items-stretch! bg-transparent! border-0! shadow-none! min-w-0! md:min-w-[358px]! md:max-w-[358px]",
      duration,
    }
  );
}
