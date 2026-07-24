import { FooterSecondary } from "@/components/footer";
import { HeaderNavigationSecondary } from "@/components/header-navigation";
import { AIToolFooterProductNav } from "@/features/landing/ai-tool/components";
import { getHeaderCategories } from "@/features/landing/ai-tool/sanity/get-header-categories";
import { normalizeAIToolLocale } from "@/features/landing/ai-tool/translations/config";

import "./policies-footer-scope.css";

interface TPoliciesLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PoliciesLayout({
  children,
  params,
}: TPoliciesLayoutProps) {
  const { locale } = await params;
  const lang = normalizeAIToolLocale(locale);
  const { categories, extraCategories } = await getHeaderCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNavigationSecondary />
      <div className="flex flex-1 flex-col bg-white text-[black]">
        <main className="relative w-full pt-[72px]">
          <div className="px-medium-2 py-medium-3 mx-auto w-full max-w-[1200px]">
            {children}
          </div>
        </main>
        <div className="ai-tool-scope policies-footer-scope">
          <AIToolFooterProductNav
            locale={lang}
            categories={categories}
            extraCategories={extraCategories}
          />
        </div>
      </div>
      <FooterSecondary />
    </div>
  );
}
