import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/components/link";
import { OAuthProviderV2 } from "@/components/oauth-provider-v2";
import { EAUTH_PROVIDER } from "@/utils/commons/enums";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

interface LoginFormProps {
  welcomeLabel?: string | ReactNode;
  description?: string | ReactNode;
  onClickSignIn?: (provider: EAUTH_PROVIDER) => void;
  showLastBreak?: boolean;
}

const renderBreak = () => <br />;

const createRenderBreakDesktop = (showLastBreak: boolean) => {
  const RenderBreakDesktop = () =>
    showLastBreak ? <br className="hidden md:block" /> : null;
  RenderBreakDesktop.displayName = "RenderBreakDesktop";
  return RenderBreakDesktop;
};

const renderTermsLink = (chunks: ReactNode) => (
  <Link
    href={TERMS_OF_USE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="!text-footnoteM-neutral underline"
  >
    {chunks}
  </Link>
);

const renderPrivacyLink = (chunks: ReactNode) => (
  <Link
    href={PRIVACY_POLICY_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="!text-footnoteM-neutral underline"
  >
    {chunks}
  </Link>
);

const renderRefundLink = (chunks: ReactNode) => (
  <Link
    href={REFUND_POLICY_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="!text-footnoteM-neutral underline"
  >
    {chunks}
  </Link>
);

export default function LoginFormV2({
  welcomeLabel: welcomeLabelProps,
  description: descriptionProps,
  onClickSignIn,
  showLastBreak = true,
}: LoginFormProps) {
  const t = useTranslations("loginPage.loginForm.guestModal");
  const welcomeLabel = t("title");
  const description = descriptionProps || t("description");
  const agreement = t.rich("agreement", {
    break: renderBreak,
    breakDesktop: createRenderBreakDesktop(showLastBreak),
    privacy: renderPrivacyLink,
    refund: renderRefundLink,
    terms: renderTermsLink,
  });

  return (
    <>
      <div className="space-y-small-1 flex w-full flex-col items-center">
        {/* GU-1573 */}
        {welcomeLabelProps || (
          <h1 className="text-app-Title1 text-text-general-secondary md:text-app-Title1 text-center">
            {welcomeLabel}
          </h1>
        )}
        {descriptionProps || (
          <p className="text-bodyS-neutral text-text-general-tertiary">
            {description}
          </p>
        )}
      </div>
      {/* GU-1573 */}
      <div className="space-y-medium-1.5 flex w-full flex-col">
        <OAuthProviderV2
          href="/"
          imageURL="/icons/google.svg"
          provider={EAUTH_PROVIDER.GOOGLE}
          onClick={onClickSignIn}
        />
        <OAuthProviderV2
          href="/"
          imageURL="/icons/apple.svg"
          provider={EAUTH_PROVIDER.APPLE}
          onClick={onClickSignIn}
        />
        {/* <OAuthProviderV2
          href="/"
          imageURL="/icons/fb.svg"
          name="Continue with Facebook"
          provider={EAUTH_PROVIDER.FACEBOOK}
          onClick={onClickSignIn}
        /> */}
      </div>
      <div className="text-footnoteM-neutral text-text-general-tertiary w-full text-center">
        {agreement}
      </div>
    </>
  );
}
