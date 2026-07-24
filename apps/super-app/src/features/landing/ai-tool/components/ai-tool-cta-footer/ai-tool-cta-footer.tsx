import Image from "next/image";

import { getAIToolTranslation } from "../../translations/translattion";
import { AIToolCTAFooterSignupLink } from "./ai-tool-cta-footer-signup-link";

import styles from "./styles.module.css";

/**
 * Design (Figma):
 * - Desktop: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=1-8353&t=hPvoIG7ekrXEI6WN-4
 * - Mobile: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=12-9607&t=hPvoIG7ekrXEI6WN-4
 */

const SIGN_UP_HREF = "/login";

export interface AIToolCTAFooterProps {
  trackingPage?: "ai-tool" | "pricing";
}

export default async function AIToolCTAFooter({
  trackingPage,
}: AIToolCTAFooterProps) {
  const { t } = await getAIToolTranslation();

  const prefix = t("ctaFooter.title.prefix");
  const highlight = t("ctaFooter.title.highlight");
  const suffix = t("ctaFooter.title.suffix");
  const subtitle = t("ctaFooter.subtitle");
  const ctaLabel = t("ctaFooter.cta.signUp");
  const sectionAria = t("ctaFooter.aria.section");

  return (
    <section className={styles.section} aria-label={sectionAria}>
      <div className={styles.bgDecor} aria-hidden>
        <Image
          src="/images/ai-tool/bg-cta-footer.png"
          alt=""
          fill
          className={styles.bgDecorImage}
          sizes="100vw"
        />
      </div>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titlePrefix}>{prefix}</span>{" "}
            <span className={styles.titleHighlight}>{highlight}</span>
            {suffix ? (
              <>
                {" "}
                <span className={styles.titleSuffix}>{suffix}</span>
              </>
            ) : null}
          </h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>

        <AIToolCTAFooterSignupLink
          href={SIGN_UP_HREF}
          className={styles.cta}
          ariaLabel={ctaLabel}
          label={ctaLabel}
          ctaLabelClassName={styles.ctaLabel}
          ctaIconClassName={styles.ctaIcon}
          trackingPage={trackingPage}
        />
      </div>
    </section>
  );
}
