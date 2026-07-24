import { useTranslations } from "next-intl";

export default function EmptyConversation() {
  const t = useTranslations("conversationPage");

  return (
    <div className="mb-large-4 flex flex-col items-center gap-6">
      <p className="text-center text-app-Title1 text-text-general-secondary md:text-app-title-0">
        {t("home.welcomeQuestion")}
      </p>
    </div>
  );
}
