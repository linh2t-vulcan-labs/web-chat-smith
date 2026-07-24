import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

import { FooterMobileStores } from "@/features/landing/home/components/footer-v2/footer-mobile-stores";
import { getCurrentYear } from "@/utils/commons/date-time";
import {
  HOME_URL,
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

import { getAIToolTranslation } from "../../translations/translattion";
import { buildLocalizedPublicHref } from "../../utils";
import { AI_TOOL_FOOTER_SOCIAL_LINKS } from "./social-links";

import styles from "./styles.module.css";

function renderLineBreak() {
  return <br />;
}

const FOOTER_LEGAL_LINKS = [
  { href: PRIVACY_POLICY_URL, labelKey: "privacyPolicy" as const },
  { href: TERMS_OF_USE_URL, labelKey: "termsOfUse" as const },
  { href: REFUND_POLICY_URL, labelKey: "refundPolicy" as const },
] as const;

export default async function AIToolFooter() {
  const { t, locale } = await getAIToolTranslation();
  const commonT = await getTranslations("common");
  const landingT = await getTranslations("landingPage");
  const year = String(getCurrentYear());

  return (
    <footer className={styles.footer} aria-label={t("footer.aria.section")}>
      <div className={styles.main}>
        <div className={styles.brandBlock}>
          <Link href={HOME_URL} className={styles.brandRow}>
            <Image
              src="/images/logo-v2.png"
              alt={t("footer.logoAlt")}
              width={28}
              height={28}
              priority={false}
            />
            <p className={styles.brandName}>{t("footer.brandName")}</p>
          </Link>
          <div className={styles.stores}>
            <FooterMobileStores />
          </div>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>{t("footer.aboutTitle")}</h3>
          <p className={styles.columnBody}>{t("footer.aboutDescription")}</p>
        </div>

        <div className={styles.column}>
          <div className={styles.followHeader}>
            <h3 className={styles.columnTitle}>{t("footer.followTitle")}</h3>
          </div>
          <div className={styles.socialRow}>
            {AI_TOOL_FOOTER_SOCIAL_LINKS.map((item) => (
              <a
                key={item.id}
                id={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={t(`footer.socialAria.${item.channel}`)}
              >
                <Image
                  className={styles.socialIcon}
                  src={item.logo}
                  alt=""
                  width={24}
                  height={24}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.copyrightBar}>
        <p className={styles.copyrightText}>
          {landingT.rich("footer.copyright", {
            break: renderLineBreak,
            year,
          })}
        </p>
        <nav className={styles.legalNav} aria-label={t("footer.legalNavAria")}>
          {FOOTER_LEGAL_LINKS.map((item, index) => (
            <span key={item.href} className={styles.legalItem}>
              {index > 0 ? (
                <span className={styles.legalSeparator} aria-hidden>
                  |
                </span>
              ) : null}
              <Link
                href={buildLocalizedPublicHref(locale, item.href) as Route}
                className={styles.legalLink}
              >
                {commonT(item.labelKey)}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
