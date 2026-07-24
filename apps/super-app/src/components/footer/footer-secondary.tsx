import { env } from "@cs/env";
import { getLocale, getTranslations } from "next-intl/server";
import React from "react";

import { Link } from "@/i18n/navigation";
import { FOOTER_LINKS_QUERY } from "@/libs/sanity/query";
import { safeSanityFetchWithFallback } from "@/libs/sanity/safe-fetch";
import type { TSanityFooter } from "@/libs/sanity/types";
import { getCurrentYear } from "@/utils/commons/date-time";

const renderCopyrightLineBreak = () => <br />;

function normalizeFooterLinks(footerLinks: TSanityFooter["footerLinks"]) {
  return footerLinks
    .map((link) => ({
      ...link,
      href: link.href?.trim(),
      label: link.label?.trim(),
    }))
    .filter((link) => Boolean(link.href));
}

async function FooterSecondary() {
  const lang = await getLocale();
  const t = await getTranslations("landingPage");
  const footerCopyright = t.rich("footer.copyright", {
    break: renderCopyrightLineBreak,
    year: getCurrentYear(),
  });

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

  const sanityFooterLinks = normalizeFooterLinks(footerData?.footerLinks || []);

  return (
    <footer className="bg-surface-action-default-hover px-large-4 py-medium-2 lg:py-medium-3">
      <div className="mx-auto w-full">
        <nav className="gap-small-1 flex flex-col sm:flex-row sm:justify-between">
          <p className="text-footnoteM-neutral text-text-general-quaternary lg:text-bodyS-neutral lg:text-text-general-secondary">
            {footerCopyright}
          </p>
          <ul className="flex h-[16px] text-nowrap lg:h-[20px]">
            {sanityFooterLinks.map(({ label, href }, index) => (
              <li className="text-bodyXS" key={href}>
                <Link
                  className="text-bodyXS text-text-general-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={href}
                >
                  {label || href}
                </Link>
                {index < sanityFooterLinks.length - 1 && (
                  <span className="mx-small-1 text-[#BCBCBC]">|</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default FooterSecondary;
