import { useTranslations } from "next-intl";

export default function EmptyFAQ({ keyword }: { keyword?: string }) {
  const t = useTranslations("faqPage.search");

  return (
    <div className="gap-medium-3 text-text-action-tertiary-default flex w-full flex-col items-start">
      <p className="text-footnoteM-neutral text-text-general-tertiary lg:text-bodyL-neutral line-clamp-1 w-full truncate">
        {t("noResultsFor")}{" "}
        {keyword ? (
          <span className="text-text-general-secondary font-medium">
            {keyword}
          </span>
        ) : null}
      </p>
    </div>
  );
}
