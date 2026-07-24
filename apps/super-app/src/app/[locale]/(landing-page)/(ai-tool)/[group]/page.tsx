import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AIToolGroupPageContent } from "@/features/landing/ai-tool/components";
import {
  getAiGroupConfig,
  getAiGroupTools,
} from "@/features/landing/ai-tool/sanity";
import { pickAiGroupLocaleContent } from "@/features/landing/ai-tool/sanity/helpers/pick-ai-group-locale-content";
import { getAIToolTranslation } from "@/features/landing/ai-tool/translations/translattion";
import {
  AI_TOOL_GROUP_SEGMENTS,
  formatAiToolGroupToDisplayName,
  generateAiGroupMetadata,
  isAiToolGroupSegment,
  normalizeAiToolRouteLang,
} from "@/features/landing/ai-tool/utils";
import { routing } from "@/i18n/routing";
import JsonLdScript from "@/metadata/json-ld-script";
import { createAiToolGroupPageJsonLd } from "@/metadata/landing-json-ld";

interface PageProps {
  params: Promise<{ locale: string; group: string }>;
}

export function generateStaticParams() {
  return AI_TOOL_GROUP_SEGMENTS.map((group) => ({ group }));
}

function hasFallbackLocaleRedirect(
  config: Awaited<ReturnType<typeof getAiGroupConfig>>,
  lang: string
) {
  const { defaultLocale } = routing;
  const defaultLang = normalizeAiToolRouteLang(defaultLocale);

  if (defaultLang === lang || !config) {
    return false;
  }

  const fallbackContent = pickAiGroupLocaleContent(config, defaultLang);
  return Boolean(
    fallbackContent?.title?.trim() || fallbackContent?.description?.trim()
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, group } = await params;
  if (!isAiToolGroupSegment(group)) {
    return {};
  }

  const lang = normalizeAiToolRouteLang(locale);
  const config = await getAiGroupConfig(group);
  const content = config ? pickAiGroupLocaleContent(config, lang) : undefined;

  if (!config) {
    const { defaultLocale } = routing;
    const defaultLang = normalizeAiToolRouteLang(defaultLocale);
    return generateAiGroupMetadata(
      null,
      defaultLang === lang ? lang : defaultLang,
      group,
      content
    );
  }

  return generateAiGroupMetadata(config.seo ?? null, lang, group, content);
}

export default async function AiToolGroupLandingPage({ params }: PageProps) {
  const { locale, group } = await params;
  if (!isAiToolGroupSegment(group)) {
    notFound();
  }

  const lang = normalizeAiToolRouteLang(locale);
  const [config, tools] = await Promise.all([
    getAiGroupConfig(group),
    getAiGroupTools(lang, group),
  ]);

  if (!config && tools.length === 0) {
    notFound();
  }

  const content = config ? pickAiGroupLocaleContent(config, lang) : undefined;

  if (
    !content?.title?.trim() &&
    !content?.description?.trim() &&
    hasFallbackLocaleRedirect(config, lang)
  ) {
    redirect(`/${routing.defaultLocale}/${group}`);
  }

  const fallbackTitle = formatAiToolGroupToDisplayName(group);
  const title = content?.title?.trim() || fallbackTitle;
  const description = content?.description?.trim() || undefined;

  const { t } = await getAIToolTranslation(lang);
  const groupBreadcrumbLabel = t(`groupPage.groups.${group}`) || fallbackTitle;
  const homeLabel = t("banner.breadcrumb.home");

  const jsonLd = createAiToolGroupPageJsonLd({
    description,
    group,
    groupLabel: groupBreadcrumbLabel,
    homeLabel,
    locale: lang,
    title,
  });

  return (
    <>
      <JsonLdScript schema={jsonLd} />
      <AIToolGroupPageContent
        homeHref="/"
        locale={lang}
        groupBreadcrumbLabel={groupBreadcrumbLabel}
        title={title}
        description={description}
        tools={tools}
      />
    </>
  );
}
