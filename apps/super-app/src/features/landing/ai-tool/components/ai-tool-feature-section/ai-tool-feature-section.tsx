import Image from "next/image";

import { buildSanityImageUrlWithPreset } from "@/libs/sanity/image-url";

import { getAIToolTranslation } from "../../translations/translattion";
import type { AIToolSectionComponentProps } from "../../types/types";

import styles from "./styles.module.css";

const AI_TOOL_FEATURE_ICON_DISPLAY = 64;
const AI_TOOL_FEATURE_ICON_WIDTH = 128;
const AI_TOOL_FEATURE_ICON_HEIGHT = 128;
const AI_TOOL_FEATURE_ICON_SIZES = `${AI_TOOL_FEATURE_ICON_DISPLAY}px`;

/**
 * Design (Figma):
 * - Mobile: horizontal scroll list — https://www.figma.com/design/GAU3SmmcNwSCyv7Mlx8rF7/Landing-Page--Trang-V%C5%A9---Copy-?node-id=12-9554&t=ADIInWM0600r161Q-4
 * - Desktop (lg+): up to 3 columns grid, same max width as header — https://www.figma.com/design/GAU3SmmcNwSCyv7Mlx8rF7/Landing-Page--Trang-V%C5%A9---Copy-?node-id=1-8256&t=ADIInWM0600r161Q-4
 */

interface FallbackItem {
  title: string;
  description: string;
}

export type AIToolFeatureSectionProps = AIToolSectionComponentProps;

interface RenderItem {
  key: string;
  title: string;
  description: string;
  imageUrl: string | null;
}

export default async function AIToolFeatureSection({
  data,
}: AIToolFeatureSectionProps) {
  const { t } = await getAIToolTranslation();

  const prefix = data?.richText?.prefix ?? t("feature.title.prefix");
  const highlight = data?.richText?.main ?? t("feature.title.highlight");
  const suffix = data?.richText?.suffix ?? t("feature.title.suffix");
  const subtitle = data?.subTitle ?? t("feature.subtitle");

  const fallbackItems = (
    t.raw<FallbackItem[]>("feature.fallbackItems") ?? []
  ).map((it, idx) => ({
    _key: `feature-fallback-${idx + 1}`,
    _type: "item" as const,
    description: it.description,
    image: undefined,
    title: it.title,
  }));

  const sourceItems = data?.items?.filter(Boolean) ?? [];
  const items = sourceItems.length ? sourceItems : fallbackItems;

  const resolvedItems: RenderItem[] = await Promise.all(
    items.map(async (it, idx) => {
      const imageUrl = await buildSanityImageUrlWithPreset(
        it?.image,
        "aiToolFeatureIcon"
      );

      return {
        description: it?.description ?? "",
        imageUrl,
        key: it?._key || `feature-item-${idx + 1}`,
        title: it?.title ?? "",
      };
    })
  );

  const sectionAria = data?.name || t("feature.aria.section");
  const listAria = t("feature.aria.list");

  return (
    <section className={styles.section} aria-label={sectionAria}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titlePrefix}>{prefix}</span>{" "}
            <span className={styles.titleHighlight}>{highlight}</span>{" "}
            <span className={styles.titleSuffix}>{suffix}</span>
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>
      </div>

      <div className={styles.cardsViewport}>
        <ul className={styles.cards} aria-label={listAria}>
          {resolvedItems.map((it) => (
            <li key={it.key} className={styles.card}>
              <div className={styles.iconWrap} aria-hidden>
                {it.imageUrl ? (
                  <Image
                    className={styles.icon}
                    src={it.imageUrl}
                    alt=""
                    width={AI_TOOL_FEATURE_ICON_WIDTH}
                    height={AI_TOOL_FEATURE_ICON_HEIGHT}
                    sizes={AI_TOOL_FEATURE_ICON_SIZES}
                  />
                ) : (
                  <div className={styles.iconFallback} aria-hidden />
                )}
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{it.title}</h3>
                <p className={styles.cardBody}>{it.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
