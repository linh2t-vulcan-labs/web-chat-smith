import { env } from "@cs/env";
import { useTranslations } from "next-intl";
import { getLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { TSanityFooter } from "@/libs/sanity";
import { safeSanityFetchWithFallback } from "@/libs/sanity";
import { FOOTER_LINKS_QUERY } from "@/libs/sanity/query";

interface FooterLinkItem {
  label?: string;
  name?: string;
  href?: string;
  id?: string;
}

type SafeFooterLinkItem = FooterLinkItem & { href: string };

interface FooterLinkProps {
  footerLinks?: FooterLinkItem[];
}

const EMPTY_FOOTER_LINKS: FooterLinkItem[] = [];

function normalizeFooterLinks(
  footerLinks: FooterLinkItem[]
): SafeFooterLinkItem[] {
  return footerLinks
    .map((link) => ({
      ...link,
      href: link.href?.trim(),
    }))
    .filter((link): link is SafeFooterLinkItem => Boolean(link.href));
}

const getDisplayText = (
  link: FooterLinkItem,
  t: ReturnType<typeof useTranslations>
) => {
  const href = link.href ?? "";

  if (href.includes("privacy-policy")) {
    return t("privacyPolicy");
  }
  if (href.includes("terms-of-use")) {
    return t("termsOfUse");
  }
  if (href.includes("refund-policy")) {
    return t("refundPolicy");
  }
  if (href.startsWith("mailto:")) {
    return t("contactUs");
  }

  return link.label || link.name || "";
};

function FooterLinkClient({
  footerLinks = EMPTY_FOOTER_LINKS,
}: Readonly<FooterLinkProps>) {
  const t = useTranslations("common");
  const safeFooterLinks = normalizeFooterLinks(footerLinks);

  return (
    <ul className="gap-x-medium-1.25 flex flex-nowrap">
      {safeFooterLinks.map((link, index) => {
        const displayText = getDisplayText(link, t);
        const key = link.id || link.href || String(index);

        return (
          <li key={key} className="flex items-center">
            <Link
              className="text-bodyXS font-light text-white/80 underline"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {displayText}
            </Link>
            {index < safeFooterLinks.length - 1 && (
              <span className="ms-medium-1.25 text-icon-general-tertiary rtl:mr-medium-1.25">
                |
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default async function FooterLink() {
  const lang = await getLocale();
  const footerData = await safeSanityFetchWithFallback<TSanityFooter>(
    FOOTER_LINKS_QUERY,
    {
      _id: "",
      _type: "footer",
      footerLinks: [],
    } as TSanityFooter,
    { lang },
    { next: { revalidate: env.SANITY_REVALIDATE_TIME, tags: ["footer"] } }
  );

  const footerLinks = footerData?.footerLinks || [];

  return <FooterLinkClient footerLinks={footerLinks} />;
}
