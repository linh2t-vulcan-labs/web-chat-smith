import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import type { TQuestionCategory } from "@/config/faq/types";
import { Link } from "@/i18n/navigation";
import { getFaqCategoryPathSegment } from "@/utils/commons/faq";
import { FAQ_URL } from "@/utils/constants/url";

export const FaqListMobile = ({ data }: { data: TQuestionCategory[] }) => (
  <div className="faq-mobile">
    {data.map((faq) => {
      const categorySlug = getFaqCategoryPathSegment(faq);
      return (
        <Link
          href={`${FAQ_URL}/${categorySlug}`}
          className="mb-small-1 border-border-action-tertiary-hover block border-b"
          key={faq.id}
        >
          <div className="group pb-medium-2 pt-small-1 flex w-full items-center justify-between text-start">
            <div>
              <h2 className="text-bodyL-highlight font-semibold">
                {faq.category}
              </h2>
              <p className="text-footnoteM-neutral text-text-general-quaternary">
                {faq.description}
              </p>
            </div>
            <span className="group-data-[state=open]:bg-surface-general-primary flex size-6 items-center justify-center rounded-full border border-white/70 bg-transparent group-data-[state=open]:text-white">
              <SVGIcon
                src="/icons/outlined/chevron-up.svg"
                className="text-text-general-primary"
                width={9.15}
                height={9.15}
              />
            </span>
          </div>
        </Link>
      );
    })}
  </div>
);
