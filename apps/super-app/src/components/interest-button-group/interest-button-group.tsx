"use client";

import { useEffect, useState } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { TextButton } from "@/components/text-button";
import { INTEREST_BUTTON_OPTIONS } from "@/config/options";
import { shuffle } from "@/libs/lodash-es";

import { UseCaseListModal } from "../usecase-list-modal";
import type { TInterestGroupProps } from "./types";

type TInterestCategories = typeof INTEREST_BUTTON_OPTIONS;

const DEFAULT_INTEREST_VALUES: string[] = [];

const getRandomCategories = (categories: TInterestCategories, count: number) =>
  shuffle([...categories]).slice(0, count);

function InterestButtonGroup({
  isOpenUseCaseListModal = false,
  defaultTab,
  interestValues = DEFAULT_INTEREST_VALUES,
  onSelect,
  onClickCategory,
  onClose,
}: TInterestGroupProps) {
  const CATEGORY_COUNT = 3;
  const [displayCategories, setDisplayCategories] =
    useState<TInterestCategories>([]);

  const getDisplayCategories = (
    interestValues: string[],
    categories: TInterestCategories
  ) => {
    if (!interestValues.length || interestValues.length > 3) {
      return getRandomCategories(categories, CATEGORY_COUNT);
    }

    const selectedCategories: TInterestCategories = [];
    const remainingCategories: TInterestCategories = [];

    for (const category of categories) {
      if (interestValues.includes(category.value)) {
        selectedCategories.push(category);
      } else {
        remainingCategories.push(category);
      }
    }

    const neededRandomCount = 3 - selectedCategories.length;
    const otherCategories = getRandomCategories(
      remainingCategories,
      neededRandomCount
    );
    return [...selectedCategories, ...otherCategories];
  };

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- effect randomizes displayed categories once on mount only (deliberately empty deps); recomputing during render would change the random selection on every render
    setDisplayCategories(
      getDisplayCategories(interestValues, INTEREST_BUTTON_OPTIONS)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="gap-small-1 flex flex-wrap justify-center">
      {displayCategories.map((category) => (
        <TextButton
          key={category.value}
          color="neutralOutlineBright"
          startIcon={<SVGIcon src={category.icon} width={16} height={16} />}
          onClick={() => onClickCategory(category.value)}
        >
          {category.name}
        </TextButton>
      ))}
      <TextButton
        color="neutralOutlineBright"
        endIcon={
          <SVGIcon
            src="/icons/triangle-right.svg"
            className="text-icon-action-tertiary-default"
            width={16}
            height={16}
          />
        }
        onClick={() => {
          onClickCategory("career_development");
        }}
      >
        See all
      </TextButton>
      <UseCaseListModal
        open={isOpenUseCaseListModal}
        defaultTab={defaultTab}
        onSelect={onSelect}
        onClose={onClose}
      />
    </div>
  );
}

export default InterestButtonGroup;
