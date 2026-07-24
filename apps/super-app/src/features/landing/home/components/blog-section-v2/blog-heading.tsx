import { useTranslations } from "next-intl";
import React from "react";

export const BlogHeading = () => {
  const t = useTranslations("landingPage");

  return (
    <div className="gap-medium-1.5 px-medium-2 flex flex-col items-center">
      <h2 className="text-app-title-0 md:text-Heading-h2 text-center font-normal! text-white/75">
        {t("blog.title")}
      </h2>
    </div>
  );
};
