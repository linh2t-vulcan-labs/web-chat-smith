import { publicEnv } from "@cs/env/server";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { findStudioUsecaseBySlug } from "@/features/suite/config/studio-usecases";
import { SUITE_TOOL } from "@/features/suite/utils/constants/route";
import { routing } from "@/i18n/routing";
import { buildPageAlternates, withPageAlternates } from "@/metadata/alternates";

// Single-source SEO toggle. Default OFF → adds NO metadata (returns `{}`), so routes keep inheriting
// the main app's default metadata exactly as if this SEO never existed, and no i18n key is touched.
// Set to true to attach real SEO (guest indexable, authed noindex). SEO here is purely additive/opt-in.
export const DESIGN_STUDIO_SEO_ENABLED = true;

const SITE_URL = publicEnv.CS_PUBLIC_SITE_URL ?? "https://chatsmith.io";

// i18n namespace holding the SEO strings (locale/<lang>/create_studio.json):
//   seo.base.{title,description,ogImage}
//   seo.usecase.<slug>.{title,description,ogImage}
const SEO_NAMESPACE = "createStudio";

const build = (
  t: Awaited<ReturnType<typeof getTranslations>>,
  keyPrefix: string,
  canonicalPath: string,
  locale: string,
  isGuest: boolean
): Metadata => {
  const title = t(`${keyPrefix}.title`);
  const description = t(`${keyPrefix}.description`);
  const ogImage = t(`${keyPrefix}.ogImage`);
  const alternates = buildPageAlternates({
    hrefLangLocales: routing.locales,
    locale,
    pathname: canonicalPath,
  });
  const canonicalUrl =
    typeof alternates.canonical === "string"
      ? alternates.canonical
      : `${SITE_URL}${canonicalPath}`;

  let metadata: Metadata = {
    title,
    description,
    // Only the guest (public) variant is indexable; authed is always noindex (behind login) and
    // canonicalizes to the public guest URL to consolidate signals.
    robots: { follow: isGuest, index: isGuest },
    openGraph: {
      description,
      title,
      type: "website",
      url: canonicalUrl,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: { card: "summary_large_image", description, title },
  };

  metadata = withPageAlternates(metadata, alternates);
  return metadata;
};

// Shared metadata — attach to both layouts; cascades to every child route (bare home, use-case,
// detail, view-all).
export const getDesignStudioBaseMetadata = async (
  locale: string,
  isGuest: boolean
): Promise<Metadata> => {
  if (!DESIGN_STUDIO_SEO_ENABLED) {
    return {};
  }
  const t = await getTranslations({ locale, namespace: SEO_NAMESPACE });
  return build(t, "seo.base", "/guest/design-studio", locale, isGuest);
};

// Per-use-case metadata — attach to [id]/page. A slug in the config gets its own use-case metadata
// (canonical to the matching guest URL); a uuid/unknown id falls back to the base metadata.
export const getDesignStudioUsecaseMetadata = async (
  locale: string,
  id: string,
  isGuest: boolean
): Promise<Metadata> => {
  if (!DESIGN_STUDIO_SEO_ENABLED) {
    return {};
  }
  const usecase = findStudioUsecaseBySlug(SUITE_TOOL.DESIGN, id);
  const t = await getTranslations({ locale, namespace: SEO_NAMESPACE });
  return usecase
    ? build(
        t,
        `seo.usecase.${usecase.slug}`,
        `/guest/design-studio/${usecase.slug}`,
        locale,
        isGuest
      )
    : build(t, "seo.base", "/guest/design-studio", locale, isGuest);
};
