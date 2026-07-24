import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
// import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";
import {
  APPLE_SMITHCHAT_APP_URL,
  GOOGLE_PLAY_SMITHCHAT_APP_URL,
  // PRIVACY_POLICY_URL,
  // REFUND_POLICY_URL,
  // TERMS_OF_USE_URL,
} from "@/utils/constants/url";

export const footerMobileStores = [
  {
    alt: "apple-store",
    id: TRACKING_ELEMENT_ID.LANDING_PAGE.HERO_SECTION_APP_STORE,
    link: APPLE_SMITHCHAT_APP_URL,
    url: "/images/landing-page-v2/app-store-footer.png",
  },
  {
    alt: "google-play",
    id: TRACKING_ELEMENT_ID.LANDING_PAGE.HERO_SECTION_GOOGLE_PLAY,
    link: GOOGLE_PLAY_SMITHCHAT_APP_URL,
    url: "/images/landing-page-v2/google-play-footer.png",
  },
];

export const socialLinks = [
  {
    href: "https://www.facebook.com/profile.php?id=61577953781644",
    id: TRACKING_ELEMENT_ID.LANDING_PAGE.SOCIAL_FACEBOOK,
    logo: "/images/landing-page-v2/social/fb.svg",
  },
  {
    href: "https://discord.com/invite/KSHU3ZcUxP",
    id: TRACKING_ELEMENT_ID.LANDING_PAGE.SOCIAL_DISCORD,
    logo: "/images/landing-page-v2/social/discord.svg",
  },
];

// const footerLinks = [
//   {
//     id: "1",
//     name: "Privacy",
//     href: PRIVACY_POLICY_URL,
//   },
//   {
//     id: "2",
//     name: "Terms of use",
//     href: TERMS_OF_USE_URL,
//   },
//   {
//     id: "3",
//     name: "Refund Policy",
//     href: REFUND_POLICY_URL,
//   },
//   {
//     id: "4",
//     name: "Contact Us",
//     href: LINK_NEED_HELP_CONST,
//   },
// ];
