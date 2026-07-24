"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { Link } from "@/components/link";
import { getCurrentYear } from "@/utils/commons/date-time";

import { footerLinks } from "./consts";

const renderCopyrightLineBreak = () => <br />;

function Footer() {
  const t = useTranslations("landingPage");
  const footerCopyright = t.rich("footer.copyright", {
    break: renderCopyrightLineBreak,
    year: getCurrentYear(),
  });

  return (
    <footer className="backdrop-blur-xl">
      <div className="mx-auto w-full px-3 sm:px-6 md:max-w-7xl md:px-14">
        <nav className="gap-medium-1.5 py-medium-3 flex flex-col sm:flex-row sm:justify-between">
          <p className="text-bodyS-highlight text-text-general-primary">
            {footerCopyright}
          </p>
          <ul className="flex">
            {footerLinks.map(({ name, href }, index) => (
              <li key={index}>
                <Link
                  className="text-text-action-secondary-default text-sm underline"
                  href={href}
                >
                  {name}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="mx-medium-1.5 text-icon-general-tertiary">
                    |
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
