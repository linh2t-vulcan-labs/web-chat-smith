import type { Route } from "next";
import Link from "next/link";

import ArrowRightIcon from "@/public/icons/landing-page/arrow-right.svg?react";

import type { AiToolGroupSegment } from "../../constants/groups";
import type { AIToolLocale } from "../../translations/config";
import { getAIToolTranslation } from "../../translations/translattion";
import type { AiToolBannerDocument } from "../../types/types";
import {
  getDefaultBannerArtOptions,
  getInitialBannerArtStyle,
  resolveAiToolBannerContentStyle,
  resolveAiToolBannerPlaceholder,
  serializeAiToolBannerPromptSnippets,
} from "../../utils";
import { AIToolBannerInteractiveCard } from "./ai-tool-banner-interactive-card";

import styles from "./styles.module.css";

interface AIToolBannerHeadingProps {
  useCmsHero: boolean;
  heading?: AiToolBannerDocument["heading"];
  titleMuted: string;
  titleImage: string;
  titleGenerator: string;
}

function AIToolBannerHeading({
  useCmsHero,
  heading,
  titleMuted,
  titleImage,
  titleGenerator,
}: AIToolBannerHeadingProps) {
  if (useCmsHero) {
    return (
      <>
        {heading?.prefix ? (
          <span className={styles.titleMuted}>{heading.prefix.trim()} </span>
        ) : null}
        {heading?.main || heading?.suffix ? (
          <span className={styles.titleAccent}>
            {heading?.main ? (
              <span className={styles.titleAccentWord}>{heading.main}</span>
            ) : null}
            {heading?.main && heading?.suffix ? " " : null}
            {heading?.suffix ? (
              <span className={styles.titleAccentWordBreak}>
                {heading.suffix}
              </span>
            ) : null}
          </span>
        ) : null}
      </>
    );
  }

  return (
    <>
      <span className={styles.titleMuted}>{titleMuted} </span>
      <span className={styles.titleAccent}>
        <span className={styles.titleAccentWord}>{titleImage}</span>{" "}
        <span className={styles.titleAccentWordBreak}>{titleGenerator}</span>
      </span>
    </>
  );
}

export interface AIToolBannerProps {
  homeHref?: string;
  /** Optional override for the prompt placeholder; defaults to translation. */
  promptPlaceholder?: string;
  /**
   * Sanity `aiTool.banner`. When this prop is provided (including `null`), hero heading and subtitle
   * use `heading` / `description` instead of i18n. When omitted, hero copy falls back to translations.
   */
  banner?: AiToolBannerDocument | null;
  /** Route locale — used to pick `aiSnippetSet` fields on `banner.promptSnippets`. */
  locale?: AIToolLocale;
  /** Sanity `aiTool.title` — last breadcrumb segment when non-empty after trim; otherwise i18n default. */
  title?: string;
  /** Middle breadcrumb segment linking to the group landing page. */
  groupBreadcrumb?: {
    href: string;
    label: string;
  };
  /** URL group segment — drives generate redirect query params. */
  group: AiToolGroupSegment;
  /** URL slug — used for model-group `?model=` mapping. */
  slug: string;
  /** When true, shows art style chooser (image landing pages). */
  isAllowArtStyleChosen?: boolean;
}

export default async function AIToolBanner({
  homeHref = "#",
  promptPlaceholder,
  banner,
  locale: localeProp,
  title: pageTitle,
  groupBreadcrumb,
  group: _group,
  slug: _slug,
  isAllowArtStyleChosen = false,
}: AIToolBannerProps) {
  const initialArtOptions = getDefaultBannerArtOptions();
  const initialSelectedArtStyle = getInitialBannerArtStyle(initialArtOptions);
  const { t, locale } = await getAIToolTranslation(localeProp);

  const sectionLabel = t("banner.aria.section");
  const breadcrumbLabel = t("banner.aria.breadcrumb");
  const generateAriaLabel = t("banner.aria.generate");
  const breadcrumbHome = t("banner.breadcrumb.home");
  const breadcrumbCurrent = pageTitle?.trim() || t("banner.breadcrumb.current");
  const titleMuted = t("banner.title.muted");
  const titleImage = t("banner.title.image");
  const titleGenerator = t("banner.title.generator");
  const subtitle = t("banner.subtitle");
  const generateLabel = t("banner.cta.generate");
  const contentStyle = resolveAiToolBannerContentStyle(banner?.contentStyle);
  const placeholder = resolveAiToolBannerPlaceholder({
    banner,
    contentStyle,
    fallbacks: {
      default: t("banner.promptPlaceholder"),
      qaCards: t("banner.promptPlaceholderQa"),
      qaSimple: t("banner.promptPlaceholderQaSimple"),
      translate: t("banner.promptPlaceholderTranslate"),
    },
    propPlaceholder: promptPlaceholder,
  });
  let actionLabel: string;
  if (contentStyle === "translate") {
    actionLabel = t("banner.cta.translate");
  } else if (contentStyle === "qa-cards" || contentStyle === "qa-simple") {
    actionLabel = t("banner.cta.getAnswer");
  } else {
    actionLabel = generateLabel;
  }
  const tryTheseLabel = t("banner.tryThese.label");
  const tryTheseOptionalHint = t("banner.tryThese.optional");
  const uploadFileLabels = {
    chooseFiles: t("banner.uploadFile.chooseFiles"),
    chooseFilesAriaLabel: t("banner.uploadFile.aria.chooseFiles"),
    instructionPrefix: t("banner.uploadFile.instructionPrefix"),
    instructionSuffix: t("banner.uploadFile.instructionSuffix"),
    supportedTypes: t("banner.uploadFile.supportedTypes"),
    title: t("banner.uploadFile.title"),
  };
  const useCmsHero = banner !== undefined;
  const heading = banner?.heading;
  const redirectLink = banner?.redirectLink?.trim() || undefined;
  const allowSelectModel = banner?.allowSelectModel ?? true;
  const promptSnippets = serializeAiToolBannerPromptSnippets(banner, locale);

  return (
    <section className={styles.banner} aria-label={sectionLabel}>
      <div className={styles.wrap}>
        {/* Shared (Mobile + Desktop): Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label={breadcrumbLabel}>
          <Link className={styles.crumb} href={homeHref as Route}>
            {breadcrumbHome}
          </Link>
          <ArrowRightIcon className={styles.crumbSepIcon} aria-hidden />
          {groupBreadcrumb ? (
            <>
              <Link
                className={styles.crumb}
                href={groupBreadcrumb.href as Route}
              >
                {groupBreadcrumb.label}
              </Link>
              <ArrowRightIcon className={styles.crumbSepIcon} aria-hidden />
            </>
          ) : null}
          <span className={styles.crumbCurrent}>{breadcrumbCurrent}</span>
        </nav>

        <div className={styles.heroCopy}>
          <h1 className={styles.title}>
            <AIToolBannerHeading
              heading={heading}
              titleGenerator={titleGenerator}
              titleImage={titleImage}
              titleMuted={titleMuted}
              useCmsHero={useCmsHero}
            />
          </h1>

          {(() => {
            if (useCmsHero) {
              return banner?.description ? (
                <p className={styles.subtitle}>{banner.description}</p>
              ) : null;
            }
            return <p className={styles.subtitle}>{subtitle}</p>;
          })()}
        </div>

        <AIToolBannerInteractiveCard
          redirectLink={redirectLink}
          contentStyle={contentStyle}
          allowSelectModel={allowSelectModel}
          isAllowArtStyleChosen={isAllowArtStyleChosen}
          initialArtOptions={initialArtOptions}
          initialSelectedArtStyle={initialSelectedArtStyle}
          generateAriaLabel={generateAriaLabel}
          placeholder={placeholder}
          generateLabel={generateLabel}
          actionLabel={actionLabel}
          tryTheseLabel={tryTheseLabel}
          tryTheseOptionalHint={tryTheseOptionalHint}
          promptSnippets={promptSnippets}
          uploadFileLabels={uploadFileLabels}
        />
      </div>
    </section>
  );
}
