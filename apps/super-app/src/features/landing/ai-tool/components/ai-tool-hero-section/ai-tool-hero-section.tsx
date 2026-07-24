import Image from "next/image";

import { buildSanityImageUrlWithPreset } from "@/libs/sanity/image-url";

import { getAIToolTranslation } from "../../translations/translattion";
import type {
  AIToolSectionWithCtaProps,
  AiToolSectionResolved,
} from "../../types/types";
import { buildAiToolBannerConversationPathname } from "../../utils";
import {
  AIToolFeaturePageGenerateCtaIcon,
  AIToolFeaturePageGenerateLink,
} from "../ai-tool-feature-page-generate-link/ai-tool-feature-page-generate-link";

import styles from "./styles.module.css";

/**
 * Design (Figma):
 * - Mobile: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=12-9546&t=hPvoIG7ekrXEI6WN-4
 * - Desktop: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=1-8250&t=hPvoIG7ekrXEI6WN-4
 */

interface FallbackItem {
  title: string;
  description: string;
}

export type AIToolSectionProps = AIToolSectionWithCtaProps;

interface RenderItem {
  key: string;
  title: string;
  description: string;
  imageUrl: string | null;
}

/** 3:2 — intrinsic size for Next/Image; layout width comes from CSS (viewport-based). */
const HERO_IMAGE_WIDTH = 1200;
const HERO_IMAGE_HEIGHT = 800;
const HERO_IMAGE_SIZES = "(min-width: 1024px) 570px, min(100vw - 32px, 1180px)";

type HeroTranslate = Awaited<ReturnType<typeof getAIToolTranslation>>["t"];

function resolveHeroSectionText(
  data: AiToolSectionResolved | null | undefined,
  t: HeroTranslate
) {
  return {
    highlight: data?.richText?.main ?? t("hero.title.highlight"),
    prefix: data?.richText?.prefix ?? t("hero.title.prefix"),
    sectionAria: data?.name || t("hero.aria.section"),
    subtitle: data?.subTitle ?? t("hero.subtitle"),
    suffix: data?.richText?.suffix ?? t("hero.title.suffix"),
  };
}

function resolveHeroItems(
  data: AiToolSectionResolved | null | undefined,
  t: HeroTranslate
) {
  const fallbackItems = (t.raw<FallbackItem[]>("hero.fallbackItems") ?? []).map(
    (it, idx) => ({
      _key: `hero-fallback-${idx + 1}`,
      _type: "item" as const,
      description: it.description,
      image: undefined,
      title: it.title,
    })
  );

  const sourceItems = data?.items?.filter(Boolean) ?? [];
  return sourceItems.length ? sourceItems : fallbackItems;
}

export default async function AIToolHeroSection({ data }: AIToolSectionProps) {
  const { t } = await getAIToolTranslation();
  const conversationHref = buildAiToolBannerConversationPathname();

  const { prefix, highlight, suffix, subtitle, sectionAria } =
    resolveHeroSectionText(data, t);

  const items = resolveHeroItems(data, t);

  const resolvedItems: RenderItem[] = await Promise.all(
    items.map(async (it, idx) => {
      const imageUrl = await buildSanityImageUrlWithPreset(
        it?.image,
        "aiToolHeroItem"
      );

      return {
        description: it?.description ?? "",
        imageUrl,
        key: it?._key || `hero-item-${idx + 1}`,
        title: it?.title ?? "",
      };
    })
  );

  const listAria = t("hero.aria.list");
  const ctaLabel = t("hero.cta.generate");

  return (
    <section className={styles.section} aria-label={sectionAria}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titlePrefix}>{prefix}</span>{" "}
            <span className={styles.titleHighlight}>{highlight}</span>
            {highlight && suffix ? " " : null}
            <span className={styles.titleSuffix}>{suffix}</span>
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>

        <ul className={styles.list} aria-label={listAria}>
          {resolvedItems.map((it, idx) => (
            <li
              key={it.key}
              className={`${styles.item} ${idx % 2 === 1 ? styles.itemReversed : ""}`}
            >
              <div className={styles.media}>
                {it.imageUrl ? (
                  <Image
                    className={styles.image}
                    src={it.imageUrl}
                    alt=""
                    width={HERO_IMAGE_WIDTH}
                    height={HERO_IMAGE_HEIGHT}
                    sizes={HERO_IMAGE_SIZES}
                    priority={idx === 0}
                  />
                ) : (
                  <div className={styles.imageFallback} aria-hidden />
                )}
              </div>

              <div className={styles.content}>
                <h3 className={styles.itemTitle}>{it.title}</h3>
                <p className={styles.itemDescription}>{it.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.ctaRow}>
          <AIToolFeaturePageGenerateLink
            className={styles.cta}
            href={conversationHref}
            section="hero"
            ariaLabel={ctaLabel}
          >
            <span className={styles.ctaLabel}>{ctaLabel}</span>
            <AIToolFeaturePageGenerateCtaIcon className={styles.ctaIcon} />
          </AIToolFeaturePageGenerateLink>
        </div>
      </div>
    </section>
  );
}
