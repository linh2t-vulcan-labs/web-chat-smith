import BreadcrumbArrowIcon from "@/public/icons/landing-page/arrow-right.svg?react";
import ProtectIcon from "@/public/icons/outlined/protect.svg?react";
import AimodelGeminiIcon from "@/public/icons/pricing/aimodel-gemini.svg?react";
import AimodelClaudeIcon from "@/public/icons/pricing/aimodels-claude.svg?react";
import AimodelDeepseekIcon from "@/public/icons/pricing/aimodels-deepseek.svg?react";
import AimodelGptIcon from "@/public/icons/pricing/aimodels-gpt.svg?react";
import AimodelGrokIcon from "@/public/icons/pricing/aimodels-grok.svg?react";
import ArrowRightOutlinedIcon from "@/public/icons/pricing/arrow-right.svg?react";
import Benefit1Icon from "@/public/icons/pricing/benifit_1.svg?react";
import Benefit2Icon from "@/public/icons/pricing/benifit_2.svg?react";
import Benefit3Icon from "@/public/icons/pricing/benifit_3.svg?react";
import Benefit4Icon from "@/public/icons/pricing/benifit_4.svg?react";
import Benefit5Icon from "@/public/icons/pricing/benifit_5.svg?react";
import Benefit6Icon from "@/public/icons/pricing/benifit_6.svg?react";
import Benefit7Icon from "@/public/icons/pricing/benifit_7.svg?react";
import Benefit8Icon from "@/public/icons/pricing/benifit_8.svg?react";
import CheckedIcon from "@/public/icons/pricing/checked.svg?react";
import ClockIcon from "@/public/icons/pricing/clock.svg?react";
import Payment1Icon from "@/public/icons/pricing/payment_1.svg?react";
import Payment2Icon from "@/public/icons/pricing/payment_2.svg?react";
import Payment3Icon from "@/public/icons/pricing/payment_3.svg?react";
import Payment4Icon from "@/public/icons/pricing/payment_4.svg?react";
import Payment5Icon from "@/public/icons/pricing/payment_5.svg?react";
import Payment6Icon from "@/public/icons/pricing/payment_6.svg?react";
import UncheckedIcon from "@/public/icons/pricing/un-checked.svg?react";

/** Static benefit rows for pricing desktop comparison (Figma 262:49651). */

export type PricingSvgIcon = typeof Benefit1Icon;

export type PricingBenefitIcon = PricingSvgIcon;

export const PRICING_ICONS = {
  checked: CheckedIcon,
  unchecked: UncheckedIcon,
} as const;

export type PricingPaymentIcon = PricingSvgIcon;

/** Checkout / plans panel outlined icons */
export const PRICING_OUTLINED_ICONS = {
  arrowRight: ArrowRightOutlinedIcon,
  clock: ClockIcon,
  protect: ProtectIcon,
} as const;

/** Page chrome (breadcrumb, etc.) */
export const PRICING_NAV_ICONS = {
  breadcrumbArrow: BreadcrumbArrowIcon,
} as const;

/** Payment method badges — horizontal row on desktop plans panel. */
export const PRICING_PAYMENT_ICONS: readonly {
  id: string;
  Icon: PricingPaymentIcon;
}[] = [
  { Icon: Payment1Icon, id: "payment-1" },
  { Icon: Payment2Icon, id: "payment-2" },
  { Icon: Payment3Icon, id: "payment-3" },
  { Icon: Payment4Icon, id: "payment-4" },
  { Icon: Payment5Icon, id: "payment-5" },
  { Icon: Payment6Icon, id: "payment-6" },
];

/** AI model logos — order matches Figma built-on row. */
export const PRICING_AI_MODELS: readonly {
  name: string;
  Icon: PricingSvgIcon;
}[] = [
  { Icon: AimodelGeminiIcon, name: "Gemini 3 Pro" },
  { Icon: AimodelClaudeIcon, name: "Claude" },
  { Icon: AimodelGptIcon, name: "GPT-5.2" },
  { Icon: AimodelGrokIcon, name: "Grok-4" },
  { Icon: AimodelDeepseekIcon, name: "DeepSeek V3.2" },
];

export type PricingBenefitFreeStatus = "included" | "limitedLabel";
export type PricingBenefitProStatus = "included";

export interface PricingBenefitRow {
  id: string;
  icon: PricingBenefitIcon;
  titleKey: string;
  descriptionKey: string;
  free: PricingBenefitFreeStatus;
  pro: PricingBenefitProStatus;
}

export const PRICING_BENEFIT_ROWS: PricingBenefitRow[] = [
  {
    descriptionKey: "benefits.rows.everydayModels.description",
    free: "limitedLabel",
    icon: Benefit1Icon,
    id: "everyday-models",
    pro: "included",
    titleKey: "benefits.rows.everydayModels.title",
  },
  {
    descriptionKey: "benefits.rows.proModels.description",
    free: "limitedLabel",
    icon: Benefit1Icon,
    id: "pro-models",
    pro: "included",
    titleKey: "benefits.rows.proModels.title",
  },
  {
    descriptionKey: "benefits.rows.imageGen.description",
    free: "included",
    icon: Benefit2Icon,
    id: "image-gen",
    pro: "included",
    titleKey: "benefits.rows.imageGen.title",
  },
  {
    descriptionKey: "benefits.rows.sync.description",
    free: "included",
    icon: Benefit3Icon,
    id: "sync",
    pro: "included",
    titleKey: "benefits.rows.sync.title",
  },
  {
    descriptionKey: "benefits.rows.research.description",
    free: "included",
    icon: Benefit4Icon,
    id: "research",
    pro: "included",
    titleKey: "benefits.rows.research.title",
  },
  {
    descriptionKey: "benefits.rows.uploads.description",
    free: "limitedLabel",
    icon: Benefit5Icon,
    id: "uploads",
    pro: "included",
    titleKey: "benefits.rows.uploads.title",
  },
  {
    descriptionKey: "benefits.rows.grammar.description",
    free: "limitedLabel",
    icon: Benefit6Icon,
    id: "grammar",
    pro: "included",
    titleKey: "benefits.rows.grammar.title",
  },
  {
    descriptionKey: "benefits.rows.study.description",
    free: "limitedLabel",
    icon: Benefit7Icon,
    id: "study",
    pro: "included",
    titleKey: "benefits.rows.study.title",
  },
  {
    descriptionKey: "benefits.rows.languages.description",
    free: "limitedLabel",
    icon: Benefit8Icon,
    id: "languages",
    pro: "included",
    titleKey: "benefits.rows.languages.title",
  },
];
