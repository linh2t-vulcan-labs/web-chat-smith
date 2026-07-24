"use client";

import React from "react";
import { Toaster as Sonner } from "sonner";

import { iconVariants } from "../alert/consts";
import { SVGIcon } from "../svg-icon";

type TToasterProps = React.ComponentProps<typeof Sonner>;

export default function Toaster({ ...props }: TToasterProps) {
  return (
    <Sonner
      className="md:max-w-[280px] md:min-w-[240px]"
      position="top-right"
      closeButton={false}
      icons={{
        close: null,
        error: <SVGIcon src={iconVariants.error} width={20} height={20} />,
        info: <SVGIcon src={iconVariants.info} width={20} height={20} />,
        success: <SVGIcon src={iconVariants.success} width={20} height={20} />,
        warning: <SVGIcon src={iconVariants.warning} width={20} height={20} />,
      }}
      toastOptions={{
        classNames: {
          closeButton: "hidden!",
          content: "peer-[.is-exist]:w-[calc(100%-56px)] pr-small-0 gap-0",
          default: "",
          description: "text-footnoteM-neutral text-text-general-tertiary",
          error: "bg-toast-error",
          icon: "size-5! ml-small-1 rounded-full flex justify-center items-center ring-[6px] ring-surface-general-bright-overlay ring-offset-0 mr-small-0",
          info: "bg-surface-system-success",
          success: "bg-toast-success",
          title: "text-bodyM-medium",
          toast: `rounded-rounded text-text-general-primary gap-medium-2.5 px-medium-2 py-medium-2 right-0 flex min-w-[240px] items-center`,
          warning: "bg-surface-system-error!",
        },
        closeButton: false,
        unstyled: true,
      }}
      visibleToasts={1}
      {...props}
    />
  );
}
