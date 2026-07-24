"use client";

import { useLocale } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { useCallback, useMemo, useState } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { LoadingProcessing } from "@/components/loading-icon";
import { SVGIcon } from "@/components/svg-icon";
import { cn } from "@/components/utils/cn";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LIST_LANGUAGE_OPTIONS } from "@/i18n/constant";
import { useRouter } from "@/i18n/navigation";
import { useZIndex } from "@/libs/z-index-manager/hooks/use-z-index";
import { CONVERSATION_URL } from "@/utils/constants/url";

interface Props {
  className?: string;
  dropdownClassName?: string;
}

export default function SelectLanguage({
  className,
  dropdownClassName,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const currentLocale = useLocale();
  const isLargeScreen = useMediaQuery("md");

  const router = useRouter();
  const dir = currentLocale === "ar" ? "rtl" : "ltr";

  // Use z-index manager to ensure dropdown appears above the modal
  // Use baseZIndex higher than MODAL_Z_INDEX.MANAGE_ACCOUNT (1001) to ensure it appears above
  const zIndex = useZIndex({
    baseZIndex: MODAL_Z_INDEX.MANAGE_ACCOUNT + 1,
    enabled: isOpen,
    priority: "normal",
    type: "dropdown",
  });

  const selectedOption = LIST_LANGUAGE_OPTIONS.find(
    (option) => option.value === currentLocale
  );

  const sortedLanguageOption = useMemo(() => {
    if (!selectedOption) {
      return LIST_LANGUAGE_OPTIONS;
    }

    const filterCurrentLanguage = LIST_LANGUAGE_OPTIONS.filter(
      (option) => option.value !== currentLocale
    );
    return [selectedOption, ...filterCurrentLanguage];
  }, [selectedOption, currentLocale]);

  const handleChangeLanguage = useCallback(
    (value: string) => {
      setIsOpen(false);
      setIsChangingLanguage(true);
      router.push(
        {
          pathname: CONVERSATION_URL,
        },
        {
          locale: value,
        }
      );
      router.refresh();
    },
    [router]
  );

  return (
    <>
      <LoadingProcessing isSpinning={isChangingLanguage} />
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <ButtonV2
            color="outline"
            size={isLargeScreen ? "base" : "xxs"}
            rounded="rounded"
            className={cn(
              "gap-small-1 min-w-[126px] justify-between! text-nowrap md:min-w-max",
              "px-v1-structural-content-tight! typo-v1-action-md-strong py-v1-optical-normal!",
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
            {selectedOption?.label}
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
            {sortedLanguageOption.map((option) => (
              <DropdownMenu.Item
                key={option.value}
                dir={dir}
                onSelect={() => handleChangeLanguage(option.value)}
                className={cn(
                  "item-menu gap-small-0.75 rounded-v1-medium py-small-1 cursor-pointer justify-between",
                  "pl-medium-1.5 pr-small-0.75 typo-v1-action-md-light text-v1-text-hierarchy-primary text-nowrap outline-hidden",
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
                    className="text-v1-feedback-success-icon"
                    width={16}
                    height={16}
                  />
                )}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  );
}
