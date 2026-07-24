import type { Metadata, Route } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { FAQAccordionDetail } from "@/components/faq-accordion-detail";
import { getFaqDataByLocale } from "@/config/faq/get-faq-data";
import { createFaqCategoryPageJsonLd } from "@/features/faq/faq-json-ld";
import { generateFaqMetadata } from "@/features/faq/metadata";
import { normalizeAppLocale } from "@/i18n/locale";
import JsonLdScript from "@/metadata/json-ld-script";
import { findFAQCategoryBySlug } from "@/utils/commons/faq";
import {
  capitalizeFirstLetter,
  getNameFromSlug,
} from "@/utils/commons/helpers";
import { FAQ_URL } from "@/utils/constants/url";

interface TPageParams {
  params: Promise<{
    locale: string;
    category: string;
  }>;
}

export async function generateMetadata(props: TPageParams): Promise<Metadata> {
  const params = await props.params;
  const lang = normalizeAppLocale(params.locale);
  const faqList = await getFaqDataByLocale(lang);
  const faqData = findFAQCategoryBySlug(params.category, faqList);
  const t = await getTranslations({
    locale: lang,
    namespace: "faqPage.metadata",
  });
  const titleSlug = getNameFromSlug(params.category);
  const title = `${t("categoryTitlePrefix")} ${capitalizeFirstLetter(faqData?.category ?? titleSlug)}`;

  return generateFaqMetadata({
    categorySlug: faqData?.slug ?? params.category,
    description: faqData?.description,
    locale: lang,
    title,
  });
}

export default async function Page(props: TPageParams) {
  const params = await props.params;
  const lang = normalizeAppLocale(params.locale);
  const faqList = await getFaqDataByLocale(lang);
  const slug = params.category;
  const faqData = findFAQCategoryBySlug(slug, faqList);

  if (!faqData) {
    redirect(FAQ_URL);
  }

  if (faqData.slug && faqData.slug !== slug) {
    redirect(`${FAQ_URL}/${faqData.slug}` as Route);
  }

  const [tFaqPage, tPricing] = await Promise.all([
    getTranslations({ locale: lang, namespace: "faqPage.breadcrumb" }),
    getTranslations({ locale: lang, namespace: "pricing" }),
  ]);

  const categorySlug = faqData.slug ?? slug;
  const faqCategoryPageJsonLd = createFaqCategoryPageJsonLd({
    allFaqsLabel: tFaqPage("allFaqs"),
    categoryData: faqData,
    categorySlug,
    homeLabel: tPricing("breadcrumb.home"),
    locale: lang,
  });

  return (
    <>
      <JsonLdScript schema={faqCategoryPageJsonLd} />
      <div className="gap-medium-2 lg:gap-medium-3 flex flex-col">
        <div className="py-large-3 gap-medium-2.5 flex items-center">
          <h3 className="text-bodyL-highlight text-text-general-secondary lg:text-app-title-0">
            {faqData.category}
          </h3>
        </div>
        <div />
      </div>
      <FAQAccordionDetail data={faqData} />
    </>
  );
}
