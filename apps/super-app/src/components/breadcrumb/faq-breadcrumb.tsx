"use client";

import { useMemo } from "react";

import type { TQuestionCategory } from "@/config/faq/types";
import { usePathname } from "@/i18n/navigation";
import { findFAQCategoryBySlug, findQuestionBySlug } from "@/utils/commons/faq";
import { FAQ_URL } from "@/utils/constants/url";

import Breadcrumb from "./breadcrumb";
import type { TBreadCrumbProps } from "./types";

export type TFaqBreadcrumbProps = Omit<TBreadCrumbProps, "segmentLabelMap"> & {
  allFaqsLabel: string;
  faqData: TQuestionCategory[];
};

export default function FaqBreadcrumb({
  allFaqsLabel,
  faqData,
  ...breadcrumbProps
}: Readonly<TFaqBreadcrumbProps>) {
  const pathname = usePathname();

  const segmentLabelMap = useMemo(() => {
    const pathNames = pathname.split("/").filter(Boolean);
    const faqIdx = pathNames.indexOf(FAQ_URL.split("/").pop() || "");
    const map: Record<string, string> = {};

    if (faqIdx === -1) {
      return map;
    }

    map.faq = allFaqsLabel;
    const categorySeg = pathNames[faqIdx + 1];
    if (!categorySeg) {
      return map;
    }

    const cat = findFAQCategoryBySlug(categorySeg, faqData);
    if (!cat) {
      return map;
    }

    map[categorySeg] = cat.category;
    const questionSeg = pathNames[faqIdx + 2];
    if (!questionSeg) {
      return map;
    }

    const q = findQuestionBySlug(questionSeg, cat.questions);
    if (q) {
      map[questionSeg] = q.question;
    }

    return map;
  }, [allFaqsLabel, faqData, pathname]);

  return <Breadcrumb {...breadcrumbProps} segmentLabelMap={segmentLabelMap} />;
}
