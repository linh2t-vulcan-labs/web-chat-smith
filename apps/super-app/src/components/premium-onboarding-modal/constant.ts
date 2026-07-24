import { UNLOCK_PRO_VIDEO } from "@/utils/constants/cdn";

import type { TFeaturesData } from "./types";

const ONBOARDING_FEATURE_DATA: TFeaturesData[] = [
  {
    description: "onboardingPro.step1.description",
    id: "1",
    image: "/images/welcome-premium.png",
    title: "onboardingPro.step1.title",
  },
  {
    description: "onboardingPro.step2.description",
    id: "2",
    title: "onboardingPro.step2.title",
    video: UNLOCK_PRO_VIDEO(),
  },
  {
    description: "onboardingPro.step3.description",
    id: "3",
    title: "onboardingPro.step3.title",
    video: UNLOCK_PRO_VIDEO(),
  },
  {
    description: "onboardingPro.step4.description",
    id: "4",
    title: "onboardingPro.step4.title",
    video: UNLOCK_PRO_VIDEO(),
  },
];

export { ONBOARDING_FEATURE_DATA };
