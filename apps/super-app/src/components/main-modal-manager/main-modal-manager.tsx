"use client";

import dynamic from "next/dynamic";
import React from "react";

// import { HelpButton } from "@/components/help-button";

// Lazy load modal components for better performance
const WebReminderModal = dynamic(
  async () => {
    const mod = await import("@/components/web-reminder-modal");
    return mod.WebReminderModal;
  },
  {
    ssr: false,
  }
);

const WhatNewsModal = dynamic(
  async () => {
    const mod = await import("@/components/what-news-modal");
    return mod.WhatNewsModal;
  },
  {
    ssr: false,
  }
);

const PackageSubscriptionModal = dynamic(
  async () => {
    const mod = await import("@/components/package-subscription-modal");
    return mod.PackageSubscriptionModal;
  },
  {
    ssr: false,
  }
);

const PremiumOnboardingModal = dynamic(
  () =>
    import("@/components/premium-onboarding-modal/premium-onboarding-modal"),
  {
    ssr: false,
  }
);
const ExpiredPlanModal = dynamic(
  () => import("@/components/expired-plan-modal/expired-plan-modal"),
  {
    ssr: false,
  }
);
const EnableNotificationModal = dynamic(
  () =>
    import("@/components/enable-notification-modal/enable-notification-modal"),
  {
    ssr: false,
  }
);

const PaymentUnavailableModal = dynamic(
  async () => {
    const mod =
      await import("@/components/dashboard/payment-unavailable-modal");
    return mod.default;
  },
  {
    ssr: false,
  }
);

const MainModalManager = () => (
  <>
    {/* Note: Remove this modal when the payment system is available (According ticket to GU-1123) */}
    <PaymentUnavailableModal />
    {/* HelpButton Desktop */}
    {/* <HelpButton className="fixed right-4 bottom-4 z-10 hidden md:block rtl:right-auto rtl:left-4" /> */}
    <PackageSubscriptionModal />
    <WebReminderModal />
    <WhatNewsModal />
    <PremiumOnboardingModal />
    <EnableNotificationModal />
    <ExpiredPlanModal />
  </>
);

export default MainModalManager;
