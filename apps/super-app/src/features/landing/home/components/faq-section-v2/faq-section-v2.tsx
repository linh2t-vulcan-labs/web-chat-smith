import { useTranslations } from "next-intl";
import { Accordion } from "radix-ui";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { LANDING_SECTION } from "@/config/landing-page";
import type { TSanityHomePage } from "@/libs/sanity";

import { SanityBlockContent } from "../sanity-block-content";

const FaqSectionV2 = ({ data }: { data: TSanityHomePage }) => {
  const t = useTranslations("landingPage");
  const { faq: faqData } = data;
  return (
    <div
      id={LANDING_SECTION.FAQ}
      className="mx-auto px-medium-2 pb-[81px] pt-medium-3 md:pt-large-4 lg:max-w-[800px]"
    >
      <h5 className="mb-medium-2 text-center text-Heading-h3 text-white/75 md:mb-large-4">
        {t("faq.title")}
      </h5>
      <Accordion.Root
        type="single"
        collapsible
        className="flex w-full flex-col gap-medium-1.5"
      >
        {faqData?.map((faq, idx) => (
          <Accordion.Item
            className="rounded-default px-medium-3"
            style={{ background: "rgba(255, 255, 255, 0.04)" }}
            value={idx.toString()}
            key={idx.toString()}
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between py-medium-2.5 text-start md:py-medium-3">
                <div className="text-bodyM text-text-general-secondary group-hover:text-text-highlight">
                  {faq.question}
                </div>
                <SVGIcon
                  src="/icons/triangle-down.svg"
                  className="text-icon-general-tertiary"
                  width={18}
                  height={18}
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pb-medium-2">
              <div className="prose max-w-none">
                <SanityBlockContent value={faq.answer} />
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
};

export default FaqSectionV2;
