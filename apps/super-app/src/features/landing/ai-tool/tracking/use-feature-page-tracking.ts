"use client";

import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import type { TFeaturePageSection } from "@/libs/tracking-event/types";

export function useFeaturePageTracking() {
  const { sendTrackingEvent } = useSendTrackingEvent();

  return {
    trackAccessBlog: () => {
      sendTrackingEvent({
        name: EventKeys.FeaturePageAccessBlog,
      });
    },
    trackClickGenerate: (section: TFeaturePageSection) => {
      sendTrackingEvent({
        name: EventKeys.FeaturePageClickGenerate,
        payload: { section },
      });
    },
    trackClickHashtag: () => {
      sendTrackingEvent({
        name: EventKeys.FeaturePageClickHashtag,
      });
    },
    trackClickSignup: () => {
      sendTrackingEvent({
        name: EventKeys.FeatureClickSignup,
        payload: { section: "footer" },
      });
    },
    trackPricingClickSignup: () => {
      sendTrackingEvent(
        { name: EventKeys.PricingPageClickSignup },
        { enabledAppsflyer: false }
      );
    },
    trackPricingPackageSelected: () => {
      sendTrackingEvent(
        { name: EventKeys.PricingPagePackageSelected },
        { enabledAppsflyer: false }
      );
    },
    trackSelectStyle: (section: TFeaturePageSection) => {
      sendTrackingEvent({
        name: EventKeys.FeaturePageSelectStyle,
        payload: { section },
      });
    },
  };
}
