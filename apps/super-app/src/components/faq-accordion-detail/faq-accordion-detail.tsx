import { useTranslations } from "next-intl";
import { Accordion } from "radix-ui";

import { FaqMarkdown } from "@/components/faq-markdown";
import { SVGIcon } from "@/components/svg-icon";
import type { TQuestionCategory } from "@/config/faq/types";
import { Link } from "@/i18n/navigation";
import {
  getFaqCategoryPathSegment,
  getFaqQuestionPathSegment,
} from "@/utils/commons/faq";
import { FAQ_URL } from "@/utils/constants/url";

export default function FAQAccordionDetail({
  data,
}: {
  data: TQuestionCategory;
}) {
  const t = useTranslations("faqPage.accordion");

  return (
    <>
      <Accordion.Root type="single" collapsible className="w-full">
        {data.questions.map((question) => {
          const categorySlug = getFaqCategoryPathSegment(data);
          const questionSlug = getFaqQuestionPathSegment(question);

          return (
            <Accordion.Item
              className="border-neutral-250 border-t"
              value={question.id.toString()}
              key={question.id}
            >
              <Accordion.Header>
                <Accordion.Trigger className="group py-medium-2 text-footnoteM-highlight text-text-general-secondary lg:text-bodyM-medium flex w-full items-center justify-between text-start">
                  {question.question}
                  <SVGIcon
                    src="/icons/triangle-down-2.svg"
                    className="transition-transform group-data-[state=open]:-rotate-180"
                    width={16}
                    height={16}
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="pb-medium-1.5 pe-small-0 ps-medium-1.5 pt-small-0 lg:pe-medium-1.5 lg:ps-medium-1.5 lg:pt-medium-1.5">
                <div className="prose text-footnoteS-neutral lg:text-bodyS-neutral max-w-none">
                  <FaqMarkdown>
                    {question.shortAnswer || question.answer}
                  </FaqMarkdown>
                </div>
                {question.shortAnswer && (
                  <Link
                    href={`${FAQ_URL}/${categorySlug}/${questionSlug}`}
                    className="group text-text-general-secondary hover:text-text-general-quaternary mt-2 flex items-center justify-end"
                  >
                    <span className="text-footnoteS-highlight lg:text-bodyS-highlight">
                      {t("viewMore")}
                    </span>
                    <SVGIcon
                      src="/icons/outlined/caret-right.svg"
                      className="scale-75 lg:scale-100 rtl:rotate-180"
                      width={16}
                      height={16}
                    />
                  </Link>
                )}
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
      <div className="border-neutral-250 border-t" />
    </>
  );
}
