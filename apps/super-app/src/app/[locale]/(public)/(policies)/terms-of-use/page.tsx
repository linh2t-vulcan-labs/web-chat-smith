import { env } from "@cs/env";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { cache } from "react";

import { generatePolicyMetadata } from "@/features/policies/metadata";
import { createPolicyPageJsonLd } from "@/features/policies/policy-json-ld";
import { getPolicyPageLocales } from "@/features/policies/sanity/get-policy-page-locales";
import { POLICY_PAGE_LABEL_KEYS } from "@/features/policies/types";
import { normalizeAppLocale } from "@/i18n/locale";
import { GroupedPortableText } from "@/libs/sanity/components";
import type { SanityBlock } from "@/libs/sanity/components/types";
import { POLICY_BY_SLUG_QUERY } from "@/libs/sanity/query";
import { safeSanityFetch } from "@/libs/sanity/safe-fetch";
import type { Policies } from "@/libs/sanity/sanity.types";
import JsonLdScript from "@/metadata/json-ld-script";
import seo from "@/metadata/seo";
import { TERMS_OF_USE_URL } from "@/utils/constants/url";

export const revalidate = 3600; // must be a static literal in Next 16 (was env.SANITY_REVALIDATE_TIME, default 3600)

const POLICY_SLUG = "terms-of-use" as const;

const getTermsOfUse = cache((lang: string) =>
  safeSanityFetch<Policies>(
    POLICY_BY_SLUG_QUERY,
    { lang, slug: POLICY_SLUG },
    {
      next: {
        revalidate: env.SANITY_REVALIDATE_TIME,
        tags: ["policies"],
      },
    }
  )
);

interface TPolicyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  props: TPolicyPageProps
): Promise<Metadata> {
  const params = await props.params;
  const lang = normalizeAppLocale(params.locale);
  const [hrefLangLocales, { data: policy }] = await Promise.all([
    getPolicyPageLocales(POLICY_SLUG),
    getTermsOfUse(lang),
  ]);

  return generatePolicyMetadata(
    policy,
    lang,
    TERMS_OF_USE_URL,
    {
      description: seo.description ?? "",
      title: "Chat Smith - Terms of Use",
    },
    { hrefLangLocales }
  );
}

export default async function TermOfUsePage(props: TPolicyPageProps) {
  const params = await props.params;
  const lang = normalizeAppLocale(params.locale);
  const { data: policy, error } = await getTermsOfUse(lang);

  if (error || !policy) {
    console.error("Failed to load terms of use:", error);
    notFound();
  }

  const [tCommon, tPricing] = await Promise.all([
    getTranslations({ locale: lang, namespace: "common" }),
    getTranslations({ locale: lang, namespace: "pricing" }),
  ]);

  const title = policy.seo?.title?.trim() || "Chat Smith - Terms of Use";
  const description = policy.seo?.brief?.trim() || seo.description || "";
  const policyPageJsonLd = createPolicyPageJsonLd({
    description,
    homeLabel: tPricing("breadcrumb.home"),
    locale: lang,
    pageLabel: tCommon(POLICY_PAGE_LABEL_KEYS[POLICY_SLUG]),
    pathname: TERMS_OF_USE_URL,
    title,
  });

  return (
    <>
      <JsonLdScript schema={policyPageJsonLd} />
      <GroupedPortableText value={(policy.content ?? []) as SanityBlock[]} />
    </>
  );
}
