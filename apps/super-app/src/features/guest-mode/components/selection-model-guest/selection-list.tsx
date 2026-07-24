import { useTranslations } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { forwardRef, useEffect, useRef } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { ModelCard } from "@/components/model-card";
import type { TSelectionListProps } from "@/components/selection-model/types";
import type { AIModelItem } from "@/core/models/model";
import useScrollspy from "@/hooks/use-scroll-spy";
import { compositeStyles } from "@/utils/commons/styles";

import { EAIValueModel } from "../../models";
import Tabs from "./tabs";

const DEFAULT_SEEN_MODELS: AIModelItem[] = [];

const SelectionList = forwardRef<HTMLDivElement, TSelectionListProps>(
  (
    {
      models,
      seenModels = DEFAULT_SEEN_MODELS,
      selectedModel,
      isPremiumUser = false,
      isGuestUser = false,
      onModelSelect,
      onSignIn,
    },
    ref
  ) => {
    const listModel = useRef<HTMLLIElement[]>([]);
    const listModelContainerRef = useRef<HTMLUListElement>(null);
    // oxlint-disable-next-line react/react-compiler -- ref .current read during render to feed the scrollspy hook's positional tracking; intentional pattern for this hook's API
    const [currentActiveIndex] = useScrollspy(listModel.current, {
      // oxlint-disable-next-line react/react-compiler -- ref .current read during render to feed the scrollspy hook's positional tracking; intentional pattern for this hook's API
      root: listModelContainerRef.current,
      offset: 0,
    });

    const t = useTranslations("loginPage.loginForm.guestPanel");
    const commonTranslate = useTranslations("common");
    const signInLabel = commonTranslate("signIn");
    const signInTitle = t("title");
    const unlockAllFeaturesLabel = t("description");

    const handleClickTab = (providerName: string) => {
      const itemRef = listModel.current.find((el) => el.id === providerName);

      if (!itemRef) {
        return;
      }

      itemRef.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    };

    // Scroll to the selected model when the component mounts
    useEffect(() => {
      const itemRef = listModel.current.find(
        (el) => el.id === selectedModel.provider
      );

      if (itemRef) {
        itemRef.scrollIntoView({
          behavior: "instant",
          block: "start",
          inline: "nearest",
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <DropdownMenu.Content side="top" align="end" asChild>
        <div
          ref={ref}
          className="rounded-default border-border-input-default bg-surface-general-primary z-1199 w-[330px] overflow-hidden border"
        >
          {/* Tab Model */}
          <Tabs
            activeIndex={currentActiveIndex}
            models={models}
            seenModels={seenModels}
            onChange={handleClickTab}
          />

          {/* List Model */}
          <ul
            ref={listModelContainerRef}
            className={compositeStyles(
              "gap-small-1 px-small-1 flex flex-col overflow-y-auto",
              {
                "max-h-[168px]": isGuestUser,
                "max-h-[284px]": !isGuestUser,
              }
            )}
          >
            {models.map((provider, index) => (
              <li
                ref={(el) => {
                  if (el) {
                    listModel.current[index] = el;
                  }
                }}
                key={provider.id}
                id={provider.value}
                className="border-border-general-primary not-last-of-type:border-b"
              >
                <p className="bg-surface-general-primary px-small-1 pb-small-0.25 pt-small-1 text-footnoteS-highlight text-text-general-quaternary sticky top-0">
                  {provider.title}
                </p>

                <div className="gap-small-0.25 flex flex-col">
                  {provider.models.map((model) => {
                    const isPremium =
                      !model.availableRoles.includes("free") && !isPremiumUser;
                    const isLocked =
                      !model.availableRoles.includes("guest") && isGuestUser;
                    const isSelected = model.value === selectedModel.value;
                    const hasSeenModel = seenModels.some(
                      (seenModel) =>
                        seenModel.value === model.value &&
                        seenModel.badge?.text === model.badge?.text
                    );
                    // GU-2250: hide GPT 4o Mini model on UI
                    if (
                      !model.isActive ||
                      model.value === EAIValueModel.GPT4o_Mini
                    ) {
                      return null;
                    }

                    return (
                      <DropdownMenu.Item
                        key={model.id}
                        onSelect={() => onModelSelect(model)}
                        asChild
                      >
                        <ModelCard
                          className="last:mb-small-1"
                          logo={model.logo}
                          title={model.title}
                          description={model.description}
                          isSelected={isSelected}
                          isPremium={isPremium}
                          isLocked={isLocked}
                          {...(model.badge && {
                            badge: hasSeenModel ? "" : model.badge.text,
                          })}
                        />
                      </DropdownMenu.Item>
                    );
                  })}
                </div>
              </li>
            ))}
            {/* This div is used to ensure the dropdown has enough height for scrolling */}
            {/* It can be removed if the list is always long enough */}
            <div
              className={compositeStyles({
                "min-h-20": isGuestUser,
                "min-h-48": !isGuestUser,
              })}
            />
          </ul>

          {/* Sign in Button */}
          {isGuestUser && (
            <div className="gap-small-1 border-border-input-default p-small-1 flex flex-col border-t">
              <div className="gap-small-0.5 px-small-1 pt-small-1 flex flex-col">
                <p className="text-bodyS-highlight text-text-general-brand-identity">
                  {signInTitle}
                </p>
                <p className="text-footnoteM-neutral text-text-general-tertiary">
                  {unlockAllFeaturesLabel}
                </p>
              </div>
              <DropdownMenu.Item asChild>
                <ButtonV2 onClick={() => onSignIn && onSignIn()}>
                  {signInLabel}
                </ButtonV2>
              </DropdownMenu.Item>
            </div>
          )}
        </div>
      </DropdownMenu.Content>
    );
  }
);

SelectionList.displayName = "SelectionList";

export default SelectionList;
