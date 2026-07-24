import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import {
  FooterWrapper,
  HeaderWrapper,
} from "@/features/landing/ai-tool/components";
import { getHeaderCategories } from "@/features/landing/ai-tool/sanity/get-header-categories";
import {
  isAiToolGroupSegment,
  normalizeAiToolRouteLang,
} from "@/features/landing/ai-tool/utils";

import "./styles.css";

type LayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string; group: string }>;
}>;

export const revalidate = 3600; // must be a static literal in Next 16 (was envServer.SANITY_REVALIDATE_TIME, default 3600)

export default async function AiToolGroupLayout({
  children,
  params,
}: LayoutProps) {
  const { locale, group } = await params;
  if (!isAiToolGroupSegment(group)) {
    notFound();
  }

  const lang = normalizeAiToolRouteLang(locale);
  const { categories, extraCategories } = await getHeaderCategories();

  return (
    <div className="ai-tool-scope">
      <HeaderWrapper categories={categories} />
      {children}
      <FooterWrapper
        desktopProductNav={{
          categories,
          extraCategories,
          locale: lang,
        }}
      />
    </div>
  );
}
