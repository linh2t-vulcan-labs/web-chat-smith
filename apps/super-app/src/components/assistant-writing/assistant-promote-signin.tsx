import { useTranslations } from "next-intl";
import React from "react";

import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { ASSISTANT_WRITING_URL } from "@/utils/constants/url";

const AssistantPromoteSignin = () => {
  const { showLoginModal } = useFeatureGating();

  const assistantWritingT = useTranslations("assistantWriting");
  const commonT = useTranslations("common");

  return (
    <div className="mb-small-1 mt-medium-2 inline-flex gap-small-0.5 text-footnoteM-neutral text-text-general-tertiary">
      {assistantWritingT("promoteSignIn")}
      <button
        type="button"
        className="text-footnoteM-link text-text-general-cta underline"
        onClick={() =>
          showLoginModal("assistant-writing", ASSISTANT_WRITING_URL)
        }
      >
        {commonT("signIn")}
      </button>
    </div>
  );
};

export default AssistantPromoteSignin;
