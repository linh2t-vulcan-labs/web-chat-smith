"use client";

import { SVGIcon } from "@/components/svg-icon";

import type { TToastMessageProps, TToastMessageVariant } from "./types";

const variantClassNameMap = {
  error: "bg-toast-error",
  info: "bg-surface-general-primary border border-border-general-secondary",
  success:
    "border-border-general-primary border rounded-rounded bg-surface-general-primary",
  warning: "bg-surface-general-primary border border-border-general-secondary",
} as const;

const variantIconMap: Partial<Record<TToastMessageVariant, string>> = {
  success: "/icons/flash.svg",
};

export default function ToastMessage(props: TToastMessageProps) {
  const { title, description, variant = "success" } = props;

  return (
    <div
      className={`gap-medium-2 rounded-rounded px-medium-2 py-medium-1.5 flex w-full overflow-hidden ${variantClassNameMap[variant]}`}
    >
      <div className="relative inline-flex items-center">
        <div className="rounded-circle bg-surface-general-bright-overlay p-small-0.5">
          <SVGIcon src={variantIconMap[variant] ?? ""} width={24} height={24} />
        </div>
      </div>
      <div className="gap-small-1 inline-flex flex-1 flex-col">
        <div>
          <h1 className="text-bodyM-medium text-text-general-secondary">
            {title}
          </h1>
          {description ? (
            <p className="text-footnoteM-neutral text-text-general-tertiary">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
