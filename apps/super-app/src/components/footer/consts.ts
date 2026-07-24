import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

export const footerLinks = [
  {
    href: TERMS_OF_USE_URL,
    id: "terms",
    name: "Terms of use",
  },
  {
    href: PRIVACY_POLICY_URL,
    id: "privacy",
    name: "Privacy Policy",
  },
  {
    href: REFUND_POLICY_URL,
    id: "refund",
    name: "Refund policy",
  },
  {
    href: LINK_NEED_HELP_CONST,
    id: "contact",
    name: "Contact Us",
  },
];
