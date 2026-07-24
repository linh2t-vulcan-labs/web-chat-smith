"use client";

import { useTheme } from "@wrksz/themes/client";
import { useLocale, useTranslations } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { useCallback, useMemo, useState } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { SVGIcon } from "@/components/svg-icon";
import { cn } from "@/components/utils/cn";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useZIndex } from "@/libs/z-index-manager/hooks/use-z-index";
import { useGlobalState } from "@/store/global/hooks";

const THEME_VALUES = ["light", "dark", "system"] as const;

type ThemeValue = (typeof THEME_VALUES)[number];

interface Props {
  className?: string;
  dropdownClassName?: string;
}

export default function SelectTheme({ className, dropdownClassName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useClientMounted();
  const themeT = useTranslations("mainLayout.theme");
  const currentLocale = useLocale();
  const isLargeScreen = useMediaQuery("md");
  const userId = useGlobalState((state) => state.user.id);

  const { sendTrackingEvent } = useSendTrackingEvent();

  const dir = currentLocale === "ar" ? "rtl" : "ltr";

  const zIndex = useZIndex({
    baseZIndex: MODAL_Z_INDEX.MANAGE_ACCOUNT + 1,
    enabled: isOpen,
    priority: "normal",
    type: "dropdown",
  });

  const themeOptions = useMemo(
    () =>
      THEME_VALUES.map((value) => ({
        label: themeT(value),
        value,
      })),
    [themeT]
  );

  const currentTheme = mounted ? (theme as ThemeValue | undefined) : undefined;

  const selectedOption = themeOptions.find(
    (option) => option.value === currentTheme
  );

  const sortedThemeOptions = useMemo(() => {
    if (!selectedOption) {
      return themeOptions;
    }

    const filterCurrentTheme = themeOptions.filter(
      (option) => option.value !== currentTheme
    );
    return [selectedOption, ...filterCurrentTheme];
  }, [selectedOption, currentTheme, themeOptions]);

  const handleChangeTheme = useCallback(
    (value: ThemeValue) => {
      sendTrackingEvent({
        name: EventKeys.ChangeTheme,
        payload: {
          value,
          vulcan_user_id: userId,
        },
      });
      setIsOpen(false);
      setTheme(value);
    },
    [setTheme, sendTrackingEvent, userId]
  );

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <ButtonV2
          color="outline"
          size={isLargeScreen ? "base" : "xxs"}
          rounded="rounded"
          className={cn(
            "gap-small-1 min-w-[126px] justify-between! text-nowrap md:min-w-max",
            "px-v1-structural-content-tight! py-v1-optical-normal!",
            { "text-bodyS-highlight!": !className },
            className
          )}
          endIcon={
            <SVGIcon
              src="/icons/outlined/arrow-line.svg"
              className="text-v1-action-icon-tertiary"
              width={16}
              height={16}
            />
          }
        >
          {selectedOption?.label ?? "\u00A0"}
        </ButtonV2>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="end"
          style={{ zIndex }}
          className={cn(
            "mt-small-1 gap-small-1 rounded-default border-v1-border-structural-soften bg-v1-surface-hierarchy-raised p-small-1 flex max-h-[344px] w-fit min-w-[143px] flex-col border",
            "overflow-auto",
            dropdownClassName
          )}
        >
          {sortedThemeOptions.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              dir={dir}
              onSelect={() => handleChangeTheme(option.value)}
              className={cn(
                "item-menu gap-small-0.75 rounded-v1-medium py-small-1 cursor-pointer justify-between",
                "pl-medium-1.5 pr-small-0.75 text-bodyS-neutral text-nowrap outline-hidden",
                "hover:bg-surface-input-hover flex w-full min-w-[182px]",
                {
                  "bg-v1-surface-overlay-interactive-selected":
                    selectedOption?.value === option.value,
                }
              )}
            >
              {option.label}
              {selectedOption?.value === option.value && (
                <SVGIcon
                  src="/icons/checked.svg"
                  className="text-icon-action-primary-default"
                  width={16}
                  height={16}
                />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
