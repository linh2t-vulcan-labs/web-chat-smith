"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import type { ChangeEvent, KeyboardEvent } from "react";
import React, { useEffect, useRef, useState } from "react";

import { SVGIcon } from "@/components/svg-icon";
import type { TQuestionCategory } from "@/config/faq/types";
import { useHandleClickOutside } from "@/hooks/ui/use-handle-click-outside";
import { usePathname, useRouter } from "@/i18n/navigation";
import { debounce } from "@/libs/lodash-es";
import { FAQ_SEARCH_URL, FAQ_URL } from "@/utils/constants/url";

import { QuestionListV2 } from "../question-list-v2";

interface TFaqSearchProps {
  data: TQuestionCategory[];
}

const searchFAQ = (list: TQuestionCategory[], keyword: string) => {
  const lowerCaseTerm = keyword.toLowerCase();
  const filterList = list
    .map((category) => {
      const matchedQuestions = category.questions.filter((questionObj) =>
        questionObj.question.toLowerCase().includes(lowerCaseTerm)
      );

      if (matchedQuestions.length > 0) {
        return {
          ...category,
          questions: matchedQuestions,
        };
      }

      return null;
    })
    .filter(Boolean) as TQuestionCategory[];

  return filterList;
};

export default function FaqSearch({ data }: Readonly<TFaqSearchProps>) {
  const router = useRouter();
  const t = useTranslations("faqPage.search");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFaqSearchPage = pathname === FAQ_SEARCH_URL;
  const searchKwParams = searchParams.get("keyword");
  const [searchTerm, setSearchTerm] = useState(
    isFaqSearchPage && searchKwParams ? searchKwParams : ""
  );
  const [searchResults, setSearchResults] = useState<TQuestionCategory[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const activeSearchRef = useRef(false);

  const {
    wrapperRef: menuTriggerRef,
    setIsVisible: setIsVisibleMenuThread,
    isVisible: isVisibleMenuThread,
  } = useHandleClickOutside<HTMLDivElement>(() => {
    setSearchTerm("");
  });

  const backToHelpCenter = debounce(() => {
    router.push(FAQ_URL);
  }, 1000);

  const handleSearchTerm = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchTerm(value);
    setIsVisibleMenuThread(true);
    if (isFaqSearchPage && activeSearchRef.current === true && value === "") {
      backToHelpCenter();
    }
  };

  useEffect(() => {
    if (isFaqSearchPage) {
      if (searchKwParams) {
        // oxlint-disable-next-line react/react-compiler -- effect re-syncs search term from the URL query param when it changes; idempotent derivation, false positive
        setSearchTerm(searchKwParams);
      }
    } else if (!isFaqSearchPage && !searchKwParams) {
      setSearchTerm("");
    }
  }, [searchKwParams, isFaqSearchPage]);

  const onQuestionClick = () => {
    setSearchTerm("");
    setIsVisibleMenuThread(false);
  };

  const onClearSearch = () => {
    setSearchTerm("");
    if (isFaqSearchPage) {
      router.replace(FAQ_URL);
    }
  };

  const onInputKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const paramKeyword = searchTerm;
      setIsVisibleMenuThread(false);
      router.push(`${FAQ_SEARCH_URL}?keyword=${paramKeyword}`);
    }
  };

  useEffect(() => {
    if (!debouncedSearchTerm) {
      return;
    }

    const lowerCaseTerm = debouncedSearchTerm.toLowerCase();
    const results = searchFAQ(data, lowerCaseTerm);
    if (activeSearchRef.current === false) {
      activeSearchRef.current = true;
    }
    // oxlint-disable-next-line react/react-compiler -- effect derives search results from the debounced term + data; async debounce means this can't be computed during render
    setSearchResults(results);
  }, [debouncedSearchTerm, data]);

  return (
    <div className="bg-surface-general-primary pt-[68px] lg:pt-[64px]">
      <div className="mt-medium-2 px-medium-2 pb-medium-2 lg:pb-large-4 mx-auto flex max-w-[908px] flex-col">
        <div className="mb-medium-3 hidden flex-col items-center gap-6 lg:flex">
          <p className="text-app-display-medium text-text-general-secondary text-center">
            {t("heroTitle")}
          </p>
        </div>
        <div className="relative">
          <div className="items-ends relative flex size-full flex-row">
            <div className="start-medium-1.5 absolute flex size-[24px] h-full items-center">
              <SVGIcon
                src="/icons/search.svg"
                className="text-text-general-secondary"
                width={24}
                height={24}
              />
            </div>
            {/* GU-1573 */}
            <input
              placeholder={t("inputPlaceholder")}
              className="git rounded-default border-text-general-primary/20 bg-surface-input-default text-bodyM-neutral text-text-input-focus hover:bg-surface-input-hover focus:bg-surface-input-hover disabled:text-text-input-disabled placeholder:text-icon-general-secondary w-full resize-none border p-3 ps-[44px] text-sm transition duration-300 ease-out outline-none lg:text-base"
              value={searchTerm}
              onChange={handleSearchTerm}
              onKeyDown={onInputKeydown}
            />
            {searchTerm.length > 0 && (
              <div className="end-medium-1.5 absolute flex size-[12px] h-full items-center">
                <SVGIcon
                  src="/icons/outlined/closed-v2.svg"
                  className="cursor-pointer text-[#9E9E9E]"
                  onClick={onClearSearch}
                  width={16}
                  height={16}
                />
              </div>
            )}
          </div>

          {debouncedSearchTerm && isVisibleMenuThread ? (
            <div
              className="rounded-rounded bg-surface-general-tertiary px-medium-2 py-medium-2 absolute start-0 top-[calc(100%+11px)] w-full"
              ref={menuTriggerRef}
            >
              <QuestionListV2
                data={searchResults}
                searchTerm={searchTerm}
                useMaxHeight={true}
                onClickQuestion={onQuestionClick}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
