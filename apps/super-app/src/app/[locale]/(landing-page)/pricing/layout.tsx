import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  AIToolFAQs,
  FooterWrapper,
  HeaderWrapper,
} from "@/features/landing/ai-tool/components";
import { getHeaderCategories } from "@/features/landing/ai-tool/sanity/get-header-categories";
import { normalizeAIToolLocale } from "@/features/landing/ai-tool/translations/config";
import { getPricing } from "@/features/landing/pricing/sanity";
import { generatePricingMetadata } from "@/features/landing/pricing/utils";
import { routing } from "@/i18n/routing";
import JsonLdScript from "@/metadata/json-ld-script";
import { createPricingPageJsonLd } from "@/metadata/landing-json-ld";

import "./styles.css";

type LayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>;

export const revalidate = 3600; // must be a static literal in Next 16 (was env.SANITY_REVALIDATE_TIME, default 3600)

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeAIToolLocale(locale);
  const doc = await getPricing(lang);

  if (!doc) {
    const { defaultLocale } = routing;
    const fallbackDoc =
      defaultLocale === lang ? null : await getPricing(defaultLocale);
    return generatePricingMetadata(
      fallbackDoc?.seo ?? null,
      defaultLocale === lang ? lang : defaultLocale
    );
  }

  return generatePricingMetadata(doc.seo ?? null, lang);
}

export default async function PricingLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const lang = normalizeAIToolLocale(locale);
  const [doc, { categories, extraCategories }] = await Promise.all([
    getPricing(lang),
    getHeaderCategories(),
  ]);

  if (!doc) {
    const { defaultLocale } = routing;

    if (defaultLocale !== lang) {
      const fallbackDoc = await getPricing(defaultLocale);
      if (fallbackDoc) {
        redirect(`/${defaultLocale}/pricing`);
      }
    }

    notFound();
  }

  const t = await getTranslations({ locale: lang, namespace: "pricing" });
  const jsonLd = createPricingPageJsonLd({
    faq: doc.faq,
    homeLabel: t("breadcrumb.home"),
    locale: lang,
    pageLabel: t("breadcrumb.current"),
    seo: doc.seo,
  });

  return (
    <div className="pricing-scope">
      <JsonLdScript schema={jsonLd} />
      <HeaderWrapper categories={categories} />
      {children}
      <AIToolFAQs faq={doc.faq} />
      <FooterWrapper
        trackingPage="pricing"
        desktopProductNav={{
          categories,
          extraCategories,
          locale: lang,
        }}
      />
    </div>
  );
}
