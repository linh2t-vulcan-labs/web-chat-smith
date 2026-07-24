import type { Step } from "react-joyride";

import type { GUIDE_TOUR_IDS } from "@/config/guide-tour";

import { CustomTooltip } from "../components/custom-tooltip.tsx/custom-tooltip";

export type TBananaTourId =
  (typeof GUIDE_TOUR_IDS)[keyof typeof GUIDE_TOUR_IDS];

export const tourSelector = (id: TBananaTourId) => `#${id}`;

// react-joyride v3 renamed the step options:
//   disableOverlayClose → overlayClickAction: false
//   disableBeacon       → skipBeacon
//   floaterProps.arrow  → arrowColor / arrowSize / arrowSpacing
//   styles.spotlight.borderRadius → spotlightRadius
export const commonStepProps: Partial<Step> = {
  arrowColor: "#EDEDED",
  arrowSize: 6,
  arrowSpacing: 12,
  overlayClickAction: false,
  skipBeacon: true,
  spotlightRadius: 12,
  tooltipComponent: CustomTooltip,
};
