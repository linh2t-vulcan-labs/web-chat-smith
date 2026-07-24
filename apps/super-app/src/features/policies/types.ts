export const POLICY_PAGE_LABEL_KEYS = {
  "privacy-policy": "privacyPolicy",
  "refund-policy": "refundPolicy",
  "terms-of-use": "termsOfUse",
} as const;

export type PolicySlug = keyof typeof POLICY_PAGE_LABEL_KEYS;

export type PolicyPageLabelKey = (typeof POLICY_PAGE_LABEL_KEYS)[PolicySlug];
