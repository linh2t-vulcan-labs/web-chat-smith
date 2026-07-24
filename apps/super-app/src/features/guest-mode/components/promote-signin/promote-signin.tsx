import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/button";

import type { PromoteSignInProps } from "./types";

const PromoteSignin: React.FC<PromoteSignInProps> = ({ onSignIn }) => {
  const t = useTranslations("loginPage.loginForm.guestPanel");
  const commonTranslate = useTranslations("common");
  const signInLabel = commonTranslate("signIn");
  const signInTitle = t("title");
  const unlockAllFeaturesLabel = t("description");

  return (
    <div className="space-y-small-1 flex flex-col">
      <div className="space-y-small-0.5 py-small-0.75 flex flex-col">
        <div className="text-bodyS-highlight text-text-general-brand-identity">
          {signInTitle}
        </div>
        <p className="text-footnoteS-neutral text-text-general-secondary">
          {unlockAllFeaturesLabel}
        </p>
      </div>
      <Button
        color="primary"
        className="py-small-0.75 !text-footnoteM-highlight min-w-[120px]! whitespace-nowrap"
        size="small"
        onClick={onSignIn}
      >
        {signInLabel}
      </Button>
    </div>
  );
};

export default PromoteSignin;
