import { useTranslations } from "next-intl";
import { DropdownMenu, HoverCard } from "radix-ui";
import { forwardRef } from "react";

import { ModelCard } from "@/components/model-card";

import type { TSelectionListProps } from "./types";

const SelectionCustomResponseList = forwardRef<
  HTMLDivElement,
  TSelectionListProps
>(({ models, selectedModel, onModelSelect }, ref) => {
  const customResponseT = useTranslations("conversationPage.customResponse");

  const handleModelSelect = (tone: string, closeDropdown?: () => void) => {
    onModelSelect(tone);
    // Close dropdown manually
    closeDropdown?.();
  };

  return (
    <DropdownMenu.Content
      onCloseAutoFocus={(e) => e.preventDefault()}
      side="top"
      align="end"
      asChild
    >
      <div
        ref={ref}
        className="rounded-default border-border-input-default bg-surface-general-primary z-1199 w-[275px] overflow-hidden border"
      >
        <p className="bg-surface-general-primary px-small-1 pb-small-0.25 pt-small-1 text-footnoteS-highlight text-text-general-quaternary sticky top-0">
          {customResponseT("title")}
        </p>
        <ul className="gap-small-1 px-small-1 flex max-h-[350px] flex-col overflow-y-auto">
          <li className="border-border-general-primary not-last:border-b">
            <div className="gap-small-0.25 flex flex-col">
              {models
                .toSorted((a, b) => +a.id - +b.id)
                .map((prompt, index) => {
                  const isSelected = prompt.type === selectedModel;
                  const lastItem = index === models.length - 1;
                  return (
                    <HoverCard.Root
                      key={prompt.id}
                      openDelay={300}
                      defaultOpen={false}
                    >
                      <DropdownMenu.Item
                        className="outline-hidden focus:outline-hidden focus-visible:outline-hidden"
                        onSelect={() => handleModelSelect(prompt.type)}
                      >
                        <HoverCard.Trigger
                          asChild
                          className="outline-hidden focus:outline-hidden focus-visible:outline-hidden"
                        >
                          <div className="w-full outline-hidden focus:outline-hidden">
                            <ModelCard
                              className={`${lastItem ? "last:mb-small-1" : ""} bg-surface-general-primary`}
                              logo={prompt.icon}
                              title={prompt.title ?? ""}
                              description={prompt.description}
                              isSelected={isSelected}
                            />
                          </div>
                        </HoverCard.Trigger>
                      </DropdownMenu.Item>
                      <HoverCard.Portal>
                        <HoverCard.Content
                          side="left"
                          sideOffset={10}
                          style={{
                            padding: "8px 12px",
                            pointerEvents: "none",
                            zIndex: 10,
                          }}
                          className="bg-surface-general-primary dark:bg-surface-input-default text-text-general-primary w-[275px] rounded-md px-5 py-3 text-xs"
                        >
                          <strong>{customResponseT("preview")} </strong>
                          <span className="font-light italic">
                            {prompt.preview}
                          </span>
                          <HoverCard.Arrow
                            width={20}
                            height={10}
                            className="fill-surface-general-primary dark:fill-surface-input-default"
                          />
                        </HoverCard.Content>
                      </HoverCard.Portal>
                    </HoverCard.Root>
                  );
                })}
            </div>
          </li>
        </ul>
      </div>
    </DropdownMenu.Content>
  );
});

SelectionCustomResponseList.displayName = "SelectionCustomResponseList";

export default SelectionCustomResponseList;
