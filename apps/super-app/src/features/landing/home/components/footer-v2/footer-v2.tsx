import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { Link } from "@/i18n/navigation";
import { getCurrentYear } from "@/utils/commons/date-time";
import { HOME_URL } from "@/utils/constants/url";

import { LazyInView } from "../lazy-in-view";
import { OverlaySectionTop } from "../overlay-section";
import SectionBackground from "../what-you-get/section-background";
import { socialLinks } from "./consts";
import { FooterCtaButton } from "./footer-cta-button";
import FooterLink from "./footer-link";
import { FooterMobileStores } from "./footer-mobile-stores";

const FOOTER_BG_URL = `/images/landing-page-v2/background/footer-background.png`;
/** footer-background.png — 3840×1587; scale width only, height from aspect-ratio box. */
const FOOTER_BG_ASPECT = "3840 / 1587";

const FOOTER_BG_STYLE: React.CSSProperties = {
  aspectRatio: FOOTER_BG_ASPECT,
  backgroundBlendMode: "normal",
  backgroundPosition: "center top",
  backgroundRepeat: "no-repeat",
  backgroundSize: "100%",
  bottom: "auto",
  inset: "unset",
  left: 0,
  right: 0,
  top: 0,
  width: "100%",
};

interface FooterV2Props {
  /** Optional strip before footer body (e.g. Sanity product link columns on `/home`). */
  productNav?: React.ReactNode;
}

const renderFooterBreakMobile = () => <br className="md:hidden" />;
const renderFooterBreak = () => <br />;

function FooterV2({ productNav }: FooterV2Props) {
  const t = useTranslations("landingPage");
  const title = t.rich("footer.title", {
    breakMobile: renderFooterBreakMobile,
  });
  const footerCopyRight = t.rich("footer.copyright", {
    break: renderFooterBreak,
    year: getCurrentYear(),
  });

  return (
    <footer
      className="dark relative w-full bg-neutral-950"
      data-theme="dark"
      style={{
        colorScheme: "dark",
      }}
    >
      <SectionBackground
        backgroundImageUrl={FOOTER_BG_URL}
        backgroundImageMobileUrl={FOOTER_BG_URL}
        threshold={0.2}
        style={FOOTER_BG_STYLE}
      />
      <OverlaySectionTop />
      {/* Footer Top */}
      <div className="gap-medium-1.5 px-medium-2 pb-large-10 pt-large-5 md:py-large-10 relative z-10 flex flex-col items-center justify-center">
        <h5 className="text-mobile-h3 md:text-Heading-h3 text-center font-normal text-white/75">
          {title}
        </h5>
        <p className="mb-medium-1.5 text-bodyM text-center text-white/80">
          {t("footer.subtitle")}
        </p>
        <div>
          <FooterCtaButton />
        </div>
      </div>
      {productNav ? <div className="relative z-10">{productNav}</div> : null}
      {/* Footer Body */}
      <div className="py-small-0.5 md:py-small-0 relative z-10 backdrop-blur-lg">
        <div className="gap-large-6 px-medium-2 py-large-4 container mx-auto grid max-w-[1200px] md:grid-cols-3">
          <div className="gap-medium-2 flex flex-col">
            <Link href={HOME_URL} className="flex items-center">
              <div className="flex items-center gap-x-2">
                <Image
                  src="/images/logo-v2.png"
                  alt="logo"
                  width={28}
                  height={28}
                />
                <span className="text-text-general-primary font-normal md:text-[20px] md:leading-[32px]">
                  Chat Smith
                </span>
              </div>
            </Link>
            <FooterMobileStores />
          </div>

          <div className="gap-medium-2 md:gap-medium-3 flex flex-col">
            <h6 className="text-Heading-h6 font-light text-white/80">
              {t("footer.about.title")}
            </h6>
            <p className="text-Body-s text-white/80">
              {t("footer.about.description")}
            </p>
          </div>
          <div className="gap-medium-2 md:gap-medium-3 flex flex-col">
            <h6 className="text-Heading-h6 font-light text-white/80">
              {t("footer.follow.title")}
            </h6>
            <ul className="gap-small-1 flex">
              {socialLinks.map(({ id, logo, href }) => (
                <li key={id} className="size-8">
                  <Link
                    className="rounded-default p-small-0.5 inline-block border border-white/20"
                    href={href}
                    id={id}
                  >
                    <Image width={24} height={24} src={logo} alt="Logo" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Footer Bottom */}
      <div className="bg-black-800 py-medium-1.5 relative z-10 backdrop-blur-lg">
        <div className="px-medium-2 mx-auto w-full max-w-[1200px]">
          <nav className="gap-medium-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-Body-s text-white/80">{footerCopyRight}</p>
            <LazyInView rootMargin="0px">
              <FooterLink />
            </LazyInView>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default FooterV2;
