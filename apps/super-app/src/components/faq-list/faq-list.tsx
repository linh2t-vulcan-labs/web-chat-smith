import { IconsOutlinedMoveUpIcon } from "@cs/icons/icons-outlined-move-up";
import React from "react";

import type { TQuestionCategory } from "@/config/faq/types";
import { Link } from "@/i18n/navigation";
import { getFaqCategoryPathSegment } from "@/utils/commons/faq";
import { FAQ_URL } from "@/utils/constants/url";

import { EmptyFAQ } from "../empty-faq";
import type { TQuestionListProps } from "./types";

function renderFaqBlock(questionCategory: TQuestionCategory) {
  const categorySlug = getFaqCategoryPathSegment(questionCategory);

  return (
    <Link
      className="group gap-medium-2.5 px-medium-1.5 py-medium-1.5 flex h-full flex-col justify-between"
      href={`${FAQ_URL}/${categorySlug}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-app-Title1 text-text-general-primary min-w-0 flex-1 text-start wrap-break-word capitalize">
          {questionCategory.category}
        </p>
        {/* Note: pending design follow-up */}
        <span className="border-icon-general-primary group-hover-[state=open]:bg-icon-general-primary flex size-[27px] shrink-0 items-center justify-center rounded-full border group-data-[state=open]:text-white">
          <IconsOutlinedMoveUpIcon
            className="text-icon-general-primary group-hover-[state=open]:rotate-90 group-hover-[state=open]:text-text-general-inverse rtl:group-hover-[state=open]:-rotate-180 transition-transform rtl:-rotate-90"
            width={10}
            height={10}
          />
        </span>
      </div>
      <p className="w-6/7 text-start text-[10px] text-[#818181]">
        {questionCategory.description}
      </p>
    </Link>
  );
}

export default function FaqList({ data }: TQuestionListProps) {
  if (!data.length) {
    return <EmptyFAQ />;
  }

  const firstRowData = data.slice(0, 4);
  const remainingRowData = data.slice(4);

  return (
    <div className="faq-category-list flex flex-col gap-[21px]">
      <div className="gap-medium-2 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {firstRowData.map((qCate) => (
          <div
            className="rounded-rounded border-border-general-primary hover:border-text-general-tertiary hover:bg-surface-general-bright-overlay h-[147px] border"
            key={qCate.id}
          >
            {renderFaqBlock(qCate)}
          </div>
        ))}
      </div>
      <div className="gap-medium-2 mx-auto grid w-full grid-cols-2 md:grid-cols-2 lg:w-[calc(876px-207px)] lg:grid-cols-3">
        {remainingRowData.map((qCate) => (
          <div
            className="rounded-rounded border-border-general-primary hover:border-text-general-tertiary hover:bg-surface-general-bright-overlay h-[147px] border"
            key={qCate.id}
          >
            {renderFaqBlock(qCate)}
          </div>
        ))}
      </div>
    </div>
  );
}
