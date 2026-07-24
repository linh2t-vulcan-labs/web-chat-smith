import { useTranslations } from "next-intl";
import React from "react";

import { BoldText } from "@/components/bold-text";
import type { TQuestionAccordion, TQuestionCategory } from "@/config/faq/types";
import { Link } from "@/i18n/navigation";
import {
  getFaqCategoryPathSegment,
  getFaqQuestionPathSegment,
} from "@/utils/commons/faq";
import { FAQ_URL } from "@/utils/constants/url";

import { EmptyFAQ } from "../empty-faq";
import type { TQuestionListProps } from "./types";

interface TQuestionAccordionWithCatId extends TQuestionAccordion {
  catId: number;
  catIdx: number;
  category: string;
  categoryPathSegment: string;
}

export default function QuestionListV2({
  data,
  searchTerm,
  useMaxHeight = true,
  onClickQuestion,
}: TQuestionListProps & {
  onClickQuestion?: () => void;
  useMaxHeight?: boolean;
}) {
  const t = useTranslations("faqPage.search");
  if (!data.length) {
    return <EmptyFAQ keyword={searchTerm} />;
  }

  function flattenQuestion(
    _data: TQuestionCategory[]
  ): TQuestionAccordionWithCatId[] {
    const searchQuestion: TQuestionAccordionWithCatId[] = [];
    for (const [idx, curr] of _data.entries()) {
      const formattedQuestions: TQuestionAccordionWithCatId[] =
        curr.questions.map((q) => ({
          ...q,
          catId: curr.id,
          catIdx: idx,
          category: curr.category,
          categoryPathSegment: getFaqCategoryPathSegment(curr),
        }));
      searchQuestion.push(...formattedQuestions);
    }
    return searchQuestion;
  }

  const questionListClassname = `flex${useMaxHeight ? " max-h-[472px]" : ""} flex-col gap-small-1 overflow-y-auto`;

  return (
    <>
      <p className="mb-medium-3 text-footnoteM-neutral text-text-general-quaternary lg:text-bodyM-neutral">
        {t("resultsFor")}{" "}
        {searchTerm ? (
          <span className="text-text-general-secondary font-semibold">
            {searchTerm}
          </span>
        ) : null}
      </p>
      <div className={questionListClassname}>
        {flattenQuestion(data).map((quest, idx) => {
          const questionSlug = getFaqQuestionPathSegment(quest);

          return (
            <div
              key={idx}
              className="gap-medium-1.5 rounded-soft border-border-general-secondary px-small-1 py-small-1 text-text-general-secondary hover:border-text-general-tertiary lg:px-medium-3 lg:py-medium-2 flex border hover:cursor-pointer"
            >
              <Link
                href={`${FAQ_URL}/${quest.categoryPathSegment}/${questionSlug}`}
                onClick={onClickQuestion}
                className="text-footnoteM-neutral lg:text-bodyM-neutral"
              >
                <BoldText
                  text={quest.question}
                  boldText={searchTerm}
                  boldTextClassName="text-vul-primary! text-footnoteM-neutral lg:text-bodyM-neutral"
                />
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
