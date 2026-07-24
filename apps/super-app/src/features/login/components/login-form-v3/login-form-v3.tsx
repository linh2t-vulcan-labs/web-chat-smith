import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EAUTH_PROVIDER } from "@/utils/commons/enums";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

import { OAuthProviderV3 } from "../oauth-provider-v3";

const renderBreak = () => <br />;

const renderEmphasize = (chunks: ReactNode) => (
  <span className="text-text-action-primary-default">{chunks}</span>
);

const renderDescriptionHighlight = (chunks: ReactNode) => (
  <strong className="font-bold">{chunks}</strong>
);

const renderAgreementHighlight = (chunks: ReactNode) => (
  <span className="text-text-action-primary-default">{chunks}</span>
);

const renderTermsLink = (chunks: ReactNode) => (
  <Link
    href={TERMS_OF_USE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="text-footnoteM-neutral! text-text-action-primary-default underline"
  >
    {chunks}
  </Link>
);

const renderPrivacyLink = (chunks: ReactNode) => (
  <Link
    href={PRIVACY_POLICY_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="text-footnoteM-neutral! text-text-action-primary-default underline"
  >
    {chunks}
  </Link>
);

const renderRefundLink = (chunks: ReactNode) => (
  <Link
    href={REFUND_POLICY_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="text-footnoteM-neutral! text-text-action-primary-default underline"
  >
    {chunks}
  </Link>
);

export default function LoginFormV3() {
  const t = useTranslations("loginPage.loginForm.page");
  const isLarge = useMediaQuery("lg");

  const welcomeLabel = t.rich("welcome", {
    break: renderBreak,
    emphasize: renderEmphasize,
  });
  const description = t.rich("description", {
    highlight: renderDescriptionHighlight,
  });
  const agreement = t.rich("agreement", {
    break: renderBreak,
    highlight: renderAgreementHighlight,
    privacy: renderPrivacyLink,
    refund: renderRefundLink,
    terms: renderTermsLink,
  });

  return (
    <div className="gap-medium-2 flex h-full flex-col">
      <div className="space-y-small-1 flex w-full flex-col items-center">
        <h1 className="text-web-h4 text-text-general-inverse dark:text-text-general-primary md:text-text-general-secondary md:text-web-h4 w-full text-center md:text-start">
          {welcomeLabel}
        </h1>
        <p className="text-bodyS-neutral text-text-general-secondary hidden w-full md:block">
          {description}
        </p>
      </div>
      {/* GU-1573 */}
      <div className="space-y-small-1 flex w-full flex-1 flex-col">
        <OAuthProviderV3
          href="/"
          imageURL="/images/login/social/google.svg"
          imageLightURL="/images/login/social/google-light.svg"
          provider={EAUTH_PROVIDER.GOOGLE}
          mode={isLarge ? undefined : "mobile"}
        />
        <OAuthProviderV3
          href="/"
          imageURL="/images/login/social/apple.svg"
          imageLightURL="/images/login/social/apple-light.svg"
          provider={EAUTH_PROVIDER.APPLE}
          mode={isLarge ? undefined : "mobile"}
        />
        {/* <OAuthProviderV3
          href="/"
          imageURL="/images/login/social/facebook.svg"
          name="Continue with Facebook"
          provider={EAUTH_PROVIDER.FACEBOOK}
          mode={!isLarge ? "mobile" : undefined}
        /> */}
      </div>
      <div className="mt-medium-1.5 text-footnoteM-neutral text-text-general-tertiary w-full text-center lg:text-start">
        {agreement}
      </div>
    </div>
  );
}
