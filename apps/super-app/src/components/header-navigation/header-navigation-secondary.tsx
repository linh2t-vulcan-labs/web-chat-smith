"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { TextButton } from "@/components/text-button";
import { Link, useRouter } from "@/i18n/navigation";
import { debounce } from "@/libs/lodash-es";
import { CONVERSATION_URL, FAQ_URL, HOME_URL } from "@/utils/constants/url";

function HeaderNavigationSecondary() {
  const router = useRouter();
  const t = useTranslations("faqPage.header");

  const handleClickBack = debounce(() => {
    router.push(HOME_URL);
  }, 300);

  return (
    <header className="backdrop-blur-webkit bg-surface-general-primary lg:mt-small-0 fixed top-0 z-999 flex h-[60px] w-full flex-col items-end justify-center md:h-[64px]">
      <div className="flex w-full justify-between px-3 lg:px-8">
        <div className="hidden items-center md:flex">
          <Link href={CONVERSATION_URL} className="flex items-center gap-2">
            <Image
              src="/images/logo-v2.png"
              alt="logo"
              width={32}
              height={32}
            />
            <span className="text-title3 text-text-general-primary">
              {t("brandName")}
            </span>
          </Link>

          <span className="mx-medium-1.5 text-[#BCBCBC]">|</span>
          <Link href={FAQ_URL} className="flex items-center">
            <span className="text-text-general-secondary font-light">
              {t("helpCenter")}
            </span>
          </Link>
        </div>
        <div className="flex flex-col justify-center md:hidden">
          <Link
            href={FAQ_URL}
            className="text-bodyL-neutral ps-1 font-semibold"
          >
            {t("faqsMobile")}
          </Link>
        </div>
        <TextButton
          className="rounded-rounded! py-small-0.75! text-text-general-primary! opacity-100"
          color="neutralOutlineBright"
          onClick={handleClickBack}
        >
          {t("backToHome")}
        </TextButton>
      </div>
    </header>
  );
}

export default HeaderNavigationSecondary;
