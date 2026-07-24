import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LoginFlowMainV3 } from "@/features/login/components/login-flow-main-v3";
import { normalizeAppLocale } from "@/i18n/locale";
import { generateLocalizedPageMetadata } from "@/metadata/seo";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

interface TLoginPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TLoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeAppLocale(locale);
  const t = await getTranslations({
    locale: lang,
    namespace: "loginPage.metadata",
  });

  return generateLocalizedPageMetadata(locale, LOGIN_PAGE_URL, {
    description: t("description"),
    keywords: t("keywords"),
    title: t("title"),
  });
}

export default function Login() {
  return (
    <div className="flex size-full max-h-full max-w-full flex-row overflow-hidden">
      <div className="flex size-full max-h-full w-full flex-col items-center overflow-x-hidden overflow-y-auto transition-all md:max-h-none">
        <LoginFlowMainV3 />
      </div>
    </div>
  );
}
