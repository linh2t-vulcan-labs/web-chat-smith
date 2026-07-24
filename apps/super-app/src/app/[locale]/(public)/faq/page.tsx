import { getTranslations } from "next-intl/server";

import { FaqList } from "@/components/faq-list";
import { FaqListMobile } from "@/components/faq-list/faq-list-mobile";
import { getFaqDataByLocale } from "@/config/faq/get-faq-data";
import { createFaqIndexPageJsonLd } from "@/features/faq/faq-json-ld";
import { generateFaqMetadata } from "@/features/faq/metadata";
import { normalizeAppLocale } from "@/i18n/locale";
import JsonLdScript from "@/metadata/json-ld-script";
import { APP_NAME } from "@/metadata/seo";

interface TPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata(props: TPageProps) {
  const params = await props.params;
  const lang = normalizeAppLocale(params.locale);
  const t = await getTranslations({ locale: lang, namespace: "mainLayout" });

  return generateFaqMetadata({
    description: t("helpCenter.faq.description"),
    locale: lang,
    title: `${APP_NAME} - ${t("helpCenter.faq.title")}`,
  });
}

export default async function Page(props: TPageProps) {
  const params = await props.params;
  const lang = normalizeAppLocale(params.locale);
  const [faqData, tMainLayout, tFaqPage, tPricing] = await Promise.all([
    getFaqDataByLocale(lang),
    getTranslations({ locale: lang, namespace: "mainLayout" }),
    getTranslations({ locale: lang, namespace: "faqPage.breadcrumb" }),
    getTranslations({ locale: lang, namespace: "pricing" }),
  ]);

  const title = `${APP_NAME} - ${tMainLayout("helpCenter.faq.title")}`;
  const description = tMainLayout("helpCenter.faq.description");
  const faqIndexPageJsonLd = createFaqIndexPageJsonLd({
    allFaqsLabel: tFaqPage("allFaqs"),
    description,
    homeLabel: tPricing("breadcrumb.home"),
    locale: lang,
    title,
  });

  return (
    <>
      <JsonLdScript schema={faqIndexPageJsonLd} />
      <div className="py-small-1 flex flex-col gap-[44px] lg:py-[69px]">
        <div className="hidden md:block">
          <FaqList data={faqData} />
        </div>
        <div className="block md:hidden">
          <FaqListMobile data={faqData} />
        </div>
      </div>
    </>
  );
}
