import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getAiToolPage } from "@/features/landing/ai-tool/sanity";
import { getAiToolPageLocales } from "@/features/landing/ai-tool/sanity/get-ai-tool-page-locales";
import {
  formatAiToolGroupToDisplayName,
  generateAiToolMetadata,
  isAiToolGroupSegment,
  normalizeAiToolRouteLang,
} from "@/features/landing/ai-tool/utils";
import { routing } from "@/i18n/routing";
import JsonLdScript from "@/metadata/json-ld-script";
import { createAiToolPageJsonLd } from "@/metadata/landing-json-ld";

type LayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string; group: string; slug: string }>;
}>;

export const revalidate = 3600; // must be a static literal in Next 16 (was env.SANITY_REVALIDATE_TIME, default 3600)

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale, group, slug } = await params;
  if (!isAiToolGroupSegment(group)) {
    notFound();
  }

  const lang = normalizeAiToolRouteLang(locale);
  const hrefLangLocales = await getAiToolPageLocales(group, slug);
  const doc = await getAiToolPage(lang, group, slug);

  if (!doc) {
    const { defaultLocale } = routing;
    const defaultLang = normalizeAiToolRouteLang(defaultLocale);
    const fallbackDoc =
      defaultLang === lang
        ? null
        : await getAiToolPage(defaultLang, group, slug);

    return await generateAiToolMetadata(
      fallbackDoc?.seo ?? null,
      defaultLang === lang ? lang : defaultLang,
      { group, slug },
      { hrefLangLocales }
    );
  }

  return await generateAiToolMetadata(
    doc.seo ?? null,
    lang,
    { group, slug },
    { hrefLangLocales }
  );
}

export default async function AiToolSlugLayout({
  children,
  params,
}: LayoutProps) {
  const { locale, group, slug } = await params;
  if (!isAiToolGroupSegment(group)) {
    notFound();
  }

  const lang = normalizeAiToolRouteLang(locale);
  const doc = await getAiToolPage(lang, group, slug);

  if (!doc) {
    const { defaultLocale } = routing;
    const defaultLang = normalizeAiToolRouteLang(defaultLocale);

    if (defaultLang !== lang) {
      const fallbackDoc = await getAiToolPage(defaultLang, group, slug);
      if (fallbackDoc) {
        redirect(`/${defaultLocale}/${group}/${slug}`);
      }
    }

    notFound();
  }

  const t = await getTranslations({ locale: lang, namespace: "aiTool" });
  const homeLabel = t("banner.breadcrumb.home");
  const groupLabel =
    t(`groupPage.groups.${group}`) || formatAiToolGroupToDisplayName(group);
  const jsonLd = createAiToolPageJsonLd({
    faq: doc.faq,
    group,
    groupLabel,
    homeLabel,
    locale: lang,
    seo: doc.seo,
    slug,
    title: doc.title,
  });

  return (
    <>
      <JsonLdScript schema={jsonLd} />
      {children}
    </>
  );
}
