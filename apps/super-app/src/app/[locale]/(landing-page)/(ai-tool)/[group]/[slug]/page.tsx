import { notFound, redirect } from "next/navigation";

import {
  AISectionResourceBlog,
  AIToolBanner,
  AIToolFAQs,
  AIToolImagePageSections,
} from "@/features/landing/ai-tool/components";
import {
  getAiToolPage,
  getAiToolStaticParams,
} from "@/features/landing/ai-tool/sanity";
import { getAIToolTranslation } from "@/features/landing/ai-tool/translations/translattion";
import {
  buildAiToolGroupPath,
  formatAiToolGroupToDisplayName,
  formatAiToolSlugToDisplayName,
  isAiToolGroupSegment,
  normalizeAiToolRouteLang,
} from "@/features/landing/ai-tool/utils";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string; group: string; slug: string }>;
}

export function generateStaticParams() {
  return getAiToolStaticParams();
}

export default async function AiToolGroupPage({ params }: PageProps) {
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

  const { t } = await getAIToolTranslation(lang);
  const groupBreadcrumbLabel =
    t(`groupPage.groups.${group}`) || formatAiToolGroupToDisplayName(group);

  return (
    <main>
      <AIToolBanner
        homeHref={`/${locale}/home`}
        locale={lang}
        group={group}
        slug={slug}
        isAllowArtStyleChosen={group === "image"}
        banner={doc.banner ?? null}
        title={doc.title ?? formatAiToolSlugToDisplayName(slug)}
        groupBreadcrumb={{
          href: buildAiToolGroupPath(group),
          label: groupBreadcrumbLabel,
        }}
      />
      <AIToolImagePageSections
        sections={doc.sections}
        group={group}
        slug={slug}
        language={lang}
        linkAiTool={doc.linkAiTool}
        redirectLink={doc.banner?.redirectLink?.trim() || undefined}
      />
      <AIToolFAQs faq={doc.faq} />
      <AISectionResourceBlog
        locale={locale}
        blogs={doc.blogs}
        blogTags={doc.blogTagIds}
      />
    </main>
  );
}
