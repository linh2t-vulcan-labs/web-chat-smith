import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { FeedbackLoginSection } from "@/features/login/components/feadback-login-section";
import { LoginAiModel } from "@/features/login/components/login-ai-model";

const renderEmptyBreak = () => null;

const renderHighlight = (chunks: React.ReactNode) => (
  <span className="font-bold">{chunks}</span>
);

const renderBrand = (chunks: React.ReactNode) => <span>{chunks}</span>;

export default function LoginHero() {
  const commonTranslate = useTranslations("common");
  const heroTranslate = useTranslations("loginPage.hero");
  const loginPageTranslate = useTranslations("loginPage");
  return (
    <div className="gap-medium-3 pb-large-6 pt-large-8 flex flex-col items-center">
      {/* Header */}
      <LoginAiModel />
      {/* Body */}
      <div className="gap-medium-3 flex flex-col">
        <div className="gap-small-0.5 flex flex-col items-center justify-center">
          <Image
            src="/images/login/login-logo.png"
            alt="logo"
            width={52}
            height={52}
          />
          <span className="text-app-Title2 text-text-general-inverse dark:text-text-general-secondary">
            Chat Smith
          </span>
        </div>
        <div className="gap-small-1 flex flex-col">
          <div className="gap-small-1 flex justify-center">
            <div className="gap-small-1 rounded-soft bg-feature-card-item px-medium-1.5 py-small-0.75 flex items-center">
              <SVGIcon
                src="/images/login/assistants/art.svg"
                width={14}
                height={14}
              />
              <span className="text-bodyS-neutral text-white/75">
                {commonTranslate("imageCreation")}
              </span>
            </div>
            <div className="gap-small-1 rounded-soft bg-feature-card-item px-medium-1.5 py-small-0.75 flex items-center">
              <SVGIcon
                src="/images/login/assistants/deep_search.svg"
                width={14}
                height={14}
              />
              <span className="text-bodyS-neutral text-white/75">
                {commonTranslate("deepResearch")}
              </span>
            </div>
            <div className="gap-small-1 rounded-soft bg-feature-card-item px-medium-1.5 py-small-0.75 flex items-center">
              <SVGIcon
                src="/images/login/assistants/writing.svg"
                width={14}
                height={14}
              />
              <span className="text-bodyS-neutral text-white/75">
                {heroTranslate("writeBetter")}
              </span>
            </div>
          </div>
          <div className="gap-small-1 flex justify-center">
            <div className="gap-small-1 rounded-soft bg-feature-card-item px-medium-1.5 py-small-0.75 flex items-center">
              <SVGIcon
                src="/images/login/assistants/chat.svg"
                width={14}
                height={14}
              />
              <span className="text-bodyS-neutral text-white/75">
                {heroTranslate("askSearch")}
              </span>
            </div>
            <div className="gap-small-1 rounded-soft bg-feature-card-item px-medium-1.5 py-small-0.75 flex items-center">
              <SVGIcon
                src="/images/login/assistants/creator.svg"
                width={14}
                height={14}
              />
              <span className="text-bodyS-neutral text-white/75">
                {heroTranslate("masterDocument")}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="mt-small-1 gap-medium-1.5 flex flex-col">
        <div className="text-bodyS-neutral text-text-general-brand-identity text-center">
          {loginPageTranslate.rich("trustedByHighlight", {
            brand: renderBrand,
            break: renderEmptyBreak,
            count: "43M+",
            highlight: renderHighlight,
          })}
        </div>
        {/* Testimonial */}
        <div className="ps-large-4">
          <FeedbackLoginSection />
        </div>
      </div>
    </div>
  );
}
