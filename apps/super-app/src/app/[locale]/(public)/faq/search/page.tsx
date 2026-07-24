import { getFaqDataByLocale } from "@/config/faq/get-faq-data";

import FaqSearchPageClient from "./search-page-client";

interface TFaqSearchPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function FaqSearchPage(props: TFaqSearchPageProps) {
  const params = await props.params;
  const faqData = await getFaqDataByLocale(params.locale);

  return <FaqSearchPageClient faqData={faqData} />;
}
