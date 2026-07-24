"use client";

import { useTranslations } from "next-intl";

import { WEB_FEATURE_CONFIG_KEYS } from "@/config/web-features";
import { useFeatureSetting } from "@/hooks/feature-setting/use-feature-setting";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { safeJsonParse } from "@/utils/commons/helpers";
import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";
import {
  FAQ_URL,
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

import HelpCenterItem from "./help-center-item";
import type { THelpCenterItemProps } from "./types";

export default function HelpCenterTabSection() {
  const mainLayoutT = useTranslations("mainLayout");
  const commonT = useTranslations("common");
  const user = useGlobalState((state) => state.user);
  const userId = user.id;
  const featureSocialLinkSetting = useFeatureSetting(
    WEB_FEATURE_CONFIG_KEYS.SOCIALS_LINK
  );
  const featureFAQSetting = useFeatureSetting(
    WEB_FEATURE_CONFIG_KEYS.FEATURE_FAQ
  );

  const { sendTrackingEvent } = useSendTrackingEvent();

  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const raw = getValueSyncRemoteConfig(REMOTE_CONFIG_KEY.SOCIAL_LINKS);
  const socialLinks = safeJsonParse<{ discord: string }>(raw);

  const items: THelpCenterItemProps[] = [
    {
      description: mainLayoutT("helpCenter.faq.description"),
      enabled: featureFAQSetting.isEnabled,
      icon: "/icons/outlined/faqs.svg",
      link: FAQ_URL,
      title: mainLayoutT("helpCenter.faq.title"),
    },
    {
      description: mainLayoutT("helpCenter.community.description"),
      enabled: featureSocialLinkSetting.isEnabled,
      icon: "/icons/outlined/community.svg",
      link: socialLinks?.discord,
      title: commonT("community"),
    },
    {
      description: mainLayoutT("helpCenter.contactSupport.description"),
      enabled: true,
      icon: "/icons/outlined/contact-support.svg",
      link: LINK_NEED_HELP_CONST,
      title: mainLayoutT("helpCenter.contactSupport.title"),
    },
    {
      description: mainLayoutT("helpCenter.termsOfUse.description"),
      enabled: true,
      icon: "/icons/outlined/terms-of-use.svg",
      link: TERMS_OF_USE_URL,
      title: commonT("termsOfUse"),
    },
    {
      description: mainLayoutT("helpCenter.privacyPolicy.description"),
      enabled: true,
      icon: "/icons/outlined/privacy-policy.svg",
      link: PRIVACY_POLICY_URL,
      onClick: () => {
        sendTrackingEvent({
          name: EventKeys.MainPrivacy,
          payload: {
            vulcan_user_id: userId,
          },
        });
      },
      title: commonT("privacyPolicy"),
    },
    {
      description: mainLayoutT("helpCenter.refundPolicy.description"),
      enabled: true,
      icon: "/icons/outlined/refund-policy.svg",
      link: REFUND_POLICY_URL,
      title: commonT("refundPolicy"),
    },
  ];

  return (
    <div className="gap-medium-2 md:gap-v1-structural-content-relaxed grid w-full grid-cols-2">
      {items.map((item) => (
        <HelpCenterItem key={item.title} {...item} />
      ))}
    </div>
  );
}
