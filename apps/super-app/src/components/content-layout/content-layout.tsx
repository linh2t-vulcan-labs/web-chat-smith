"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";

import { Chip } from "@/components/chip";
import { compositeStyles } from "@/utils/commons/styles";

import type { TContentLayoutProps } from "./types";

export default function ContentLayout(
  props: Readonly<PropsWithChildren<TContentLayoutProps>>
) {
  const { children, rightFeature, className, rightClassName, leftClassName } =
    props;
  const isExistRightSidebar = !!rightFeature;
  const [isOpenSidebarFeature, setIsOpenSidebarFeature] =
    useState(isExistRightSidebar);

  const handleToggleSidebar = () => {
    setIsOpenSidebarFeature((prev) => !prev);
  };

  return (
    <div
      className={compositeStyles(
        "content-layout mx-auto flex size-full max-h-screen overflow-x-hidden overflow-y-auto",
        className
      )}
    >
      <div
        className={compositeStyles(
          "transition-all duration-300 ease-in-out",
          {
            "h-full w-[calc(100%-325px)]":
              isExistRightSidebar && isOpenSidebarFeature,
            "h-full w-[calc(100%-32px)]":
              isExistRightSidebar && !isOpenSidebarFeature,
            "size-full": !isExistRightSidebar,
          },
          leftClassName
        )}
      >
        {children}
      </div>
      {isExistRightSidebar && (
        <div
          className={compositeStyles(
            "border-surface-general-tertiary relative z-999 size-full border-l-2 border-solid transition-all duration-300 ease-in-out rtl:border-r-2 rtl:border-l-0",
            rightClassName,
            isOpenSidebarFeature ? "md:max-w-[325px]" : "md:max-w-[32px]"
          )}
        >
          <Chip
            className={compositeStyles(
              "bg-border-system-neutral dark:bg-surface-action-neutral-default absolute top-[82px] -left-5 z-1000 transition-none duration-300 rtl:-right-5 rtl:left-auto",
              isOpenSidebarFeature
                ? "rotate-180 rtl:rotate-0"
                : "rotate-0 rtl:rotate-180"
            )}
            classIconName="text-text-general-tertiary dark:text-text-general-primary"
            icon="/icons/filled/arrow.svg"
            onClick={handleToggleSidebar}
          />
          <div
            className={compositeStyles(
              "size-full",
              isOpenSidebarFeature ? "overflow-y-auto" : "overflow-hidden"
            )}
          >
            {" "}
            {rightFeature}
          </div>
        </div>
      )}
    </div>
  );
}
