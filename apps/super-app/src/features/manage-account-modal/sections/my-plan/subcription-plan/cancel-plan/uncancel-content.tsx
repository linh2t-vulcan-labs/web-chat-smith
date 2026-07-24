import { useTranslations } from "next-intl";

export default function UnCancelContent() {
  const t = useTranslations("myPlan");
  return (
    <p className="typo-v1-body-default-normal text-v1-text-hierarchy-secondary">
      {t("cancel.uncancelDescription")}
    </p>
  );
}
