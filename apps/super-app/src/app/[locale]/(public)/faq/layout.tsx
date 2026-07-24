import { FaqSearch } from "@/components/faq-search";
import { FooterSecondary } from "@/components/footer";
import { HeaderNavigationSecondary } from "@/components/header-navigation";
import { getFaqDataByLocale } from "@/config/faq/get-faq-data";

interface TLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function Layout(props: TLayoutProps) {
  const params = await props.params;

  const { children } = props;

  const faqData = await getFaqDataByLocale(params.locale);

  return (
    <>
      <HeaderNavigationSecondary />
      <FaqSearch data={faqData} />
      <div className="bg-surface-general-primary">
        <div className="px-large-4 pb-large-10 pt-medium-1.5 lg:px-medium-2 lg:pt-small-1 mx-auto min-h-[calc(100vh-218px)] max-w-[907px] lg:min-h-[calc(100vh-302px)]">
          {children}
        </div>
      </div>
      <FooterSecondary />
    </>
  );
}
