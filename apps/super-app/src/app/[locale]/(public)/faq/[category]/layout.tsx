import { getTranslations } from "next-intl/server";

import { FaqBreadcrumb } from "@/components/breadcrumb";
import { SVGIcon } from "@/components/svg-icon";
import { getFaqDataByLocale } from "@/config/faq/get-faq-data";

interface TLayoutParams {
  params: Promise<{
    locale: string;
    category: string;
  }>;
}

export default async function Layout(
  props: TLayoutParams & { children: React.ReactNode }
) {
  const params = await props.params;

  const { children } = props;

  const t = await getTranslations({
    locale: params.locale,
    namespace: "faqPage.breadcrumb",
  });
  const allFaqData = await getFaqDataByLocale(params.locale);

  return (
    <>
      <div className="mb-small-1 py-[15px]">
        <FaqBreadcrumb
          allFaqsLabel={t("allFaqs")}
          faqData={allFaqData}
          separator={
            <SVGIcon
              src="/icons/chevron-right.svg"
              className="text-text-general-primary"
              width={12}
              height={12}
            />
          }
          containerClasses="flex items-center gap-small-1"
          listClasses="text-text-general-tertiary whitespace-nowrap text-footnoteM-highlight lg:text-bodyS-highlight font-normal!"
          activeClasses="text-text-general-secondary! text-bodyS-highlight whitespace-nowrap truncate line-clamp-1 font-medium!"
          capitalizeLinks
        />
      </div>
      {children}
    </>
  );
}
