import { useTranslations } from "next-intl";
import React from "react";

import { ButtonV2 } from "@/components/button-v2";

import type { FloatingLoginProps } from "./types";

const FloatingLogin: React.FC<FloatingLoginProps> = ({ onLogin }) => {
  const t = useTranslations("loginPage.loginForm.floatingLogin");
  const commonT = useTranslations("common");
  const handleOnLogin = () => {
    onLogin?.();
  };

  return (
    <div className="gap-medium-2 rounded-default bg-surface-general-secondary px-medium-2 py-small-1 flex flex-col items-center justify-between md:flex-row">
      <div className="gap-small-0.5 flex flex-col">
        <h4 className="text-text-bodyM-highlight text-text-general-primary">
          {t("title")}
        </h4>
        <p className="text-bodyS-neutral text-text-general-tertiary">
          {t("description")}
        </p>
      </div>
      <ButtonV2
        className="w-full min-w-[120px]! md:w-auto"
        onClick={handleOnLogin}
      >
        {commonT("signIn")}
      </ButtonV2>
    </div>
  );
};

export default FloatingLogin;
