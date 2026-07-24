"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LoadingProcessing } from "@/components/loading-icon";
import { QuestionListV2 } from "@/components/question-list-v2";
import type { TQuestionCategory } from "@/config/faq/types";

interface TFaqSearchPageClientProps {
  faqData: TQuestionCategory[];
}

function searchFAQ(
  list: TQuestionCategory[],
  keyword: string
): TQuestionCategory[] {
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
}

export default function FaqSearchPageClient({
  faqData,
}: TFaqSearchPageClientProps) {
  const searchParams = useSearchParams();
  const [processedData, setProcessedData] = useState(false);
  const [data, setData] = useState<TQuestionCategory[]>([]);
  const searchKwParams = searchParams.get("keyword");

  useEffect(() => {
    const results = searchFAQ(faqData, searchKwParams || "");
    // oxlint-disable-next-line react/react-compiler -- effect recomputes filtered FAQ results whenever the URL keyword param changes; setting both flags synchronously is the intended sync-with-search-params pattern, not state derivable at render time
    setProcessedData(true);
    setData(results);
  }, [faqData, searchKwParams]);

  return (
    <div className="flex flex-col">
      {!processedData && <LoadingProcessing isSpinning />}
      {processedData && (
        <QuestionListV2
          data={data}
          useMaxHeight={false}
          searchTerm={searchKwParams || ""}
        />
      )}
    </div>
  );
}
