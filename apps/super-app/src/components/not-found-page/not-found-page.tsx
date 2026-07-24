import { useTranslations } from "next-intl";

import ButtonGoToHome from "@/components/not-found-page/button-go-to-home";

export default function NotFoundPageContent() {
  const notFoundPageTranslate = useTranslations("common.notFound");

  return (
    <main className="bg-notfound-mobile-page md:bg-notfound-page relative h-screen max-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat">
      <section className="gap-small-1 relative z-99 m-auto flex h-screen max-h-screen w-full max-w-[256px] -translate-y-[5%] flex-col items-center justify-center space-y-4 px-4 md:max-w-[368px] md:translate-y-0 md:space-y-8 md:px-0">
        <div className="gap-small-1 flex flex-col text-center">
          <div className="text-text-general-brand-identity flex flex-col">
            <p className="text-bodyXL-Highlight">
              {notFoundPageTranslate("title")}
            </p>
            <h1 className="text-mobile-h1 md:text-web-h1">
              {notFoundPageTranslate("code")}
            </h1>
          </div>
          <p className="text-bodyM-neutral md:text-bodyL-neutral">
            {notFoundPageTranslate("description")}
          </p>
        </div>
        <ButtonGoToHome label={notFoundPageTranslate("cta")} />
      </section>
    </main>
  );
}
