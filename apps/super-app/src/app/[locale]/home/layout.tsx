import type { Metadata } from "next";

import {
  AIToolFooterProductNavContent,
  HeaderWrapper,
} from "@/features/landing/ai-tool/components";
import { getHeaderCategories } from "@/features/landing/ai-tool/sanity/get-header-categories";
import { normalizeAIToolLocale } from "@/features/landing/ai-tool/translations/config";
import { getAIToolTranslation } from "@/features/landing/ai-tool/translations/translattion";
import { FooterV2 } from "@/features/landing/home/components/footer-v2";
import { generateHomeMetadata } from "@/features/landing/home/metadata";
import { GoogleSigninOneTap } from "@/hooks/auth/google-signin-one-tap";
import JsonLdScript from "@/metadata/json-ld-script";
import { homeJsonLdSchema } from "@/metadata/seo";

import "../(landing-page)/(ai-tool)/[group]/styles.css";
import "./home-footer-scope.css";
import "./home-header-scope.css";

interface TLocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export { viewport } from "@/metadata/seo";

export async function generateMetadata({
  params,
}: TLocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return generateHomeMetadata(locale);
}

export default async function Layout({ children, params }: TLocaleLayoutProps) {
  const { locale } = await params;
  const lang = normalizeAIToolLocale(locale);
  const [{ categories, extraCategories }, { t }] = await Promise.all([
    getHeaderCategories(),
    getAIToolTranslation(lang),
  ]);

  return (
    <div
      className="dark home bg-v1-surface-hierarchy-base text-text-general-primary min-h-screen w-full"
      data-theme="dark"
      style={{ colorScheme: "dark" }}
    >
      <JsonLdScript schema={homeJsonLdSchema} />
      <div className="ai-tool-scope home-header-scope w-full">
        <HeaderWrapper categories={categories} variant="home" />
      </div>
      <div className="home-header-spacer" aria-hidden />
      {children}
      <FooterV2
        productNav={
          <div className="home-footer-scope">
            <AIToolFooterProductNavContent
              locale={lang}
              categories={categories}
              extraCategories={extraCategories}
              untitledLabel={t("header.fallback.untitled")}
              productNavAria={t("footer.productNavAria")}
              featureColumnTitle={t("footer.featureColumnTitle")}
            />
          </div>
        }
      />
      <GoogleSigninOneTap />
    </div>
  );
}
