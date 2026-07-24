"use client";

import { useTranslations } from "next-intl";

export default function MessageAnswersSkipped() {
  const conversationT = useTranslations("conversationPage");
  return (
    <p className="text-body-medium text-text-secondary-default">
      {conversationT("messageAnswersSkipped")}
    </p>
  );
}
