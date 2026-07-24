import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { DISCORD_COMMUNITY } from "@/utils/constants/url";

type SocialChannel =
  | "facebook"
  | "discord"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "x";

interface SocialEntry {
  id: string;
  logo: string;
  href: string;
  channel: SocialChannel;
}

/** Social icons for the AI tool footer (Figma). */
export const AI_TOOL_FOOTER_SOCIAL_LINKS: readonly SocialEntry[] = [
  {
    channel: "facebook",
    href: "https://www.facebook.com/people/Chatsmith-AI-Chatbot-Agent/61577953781644/",
    id: TRACKING_ELEMENT_ID.LANDING_PAGE.SOCIAL_FACEBOOK,
    logo: "/images/landing-page-v2/social/fb.svg",
  },
  {
    channel: "discord",
    href: DISCORD_COMMUNITY,
    id: TRACKING_ELEMENT_ID.LANDING_PAGE.SOCIAL_DISCORD,
    logo: "/images/landing-page-v2/social/discord.svg",
  },
  {
    channel: "youtube",
    href: "https://www.youtube.com/@AIChatSmithAgent",
    id: "ai-tool-footer-youtube",
    logo: "/images/landing-page-v2/social/youtube.svg",
  },
  {
    channel: "instagram",
    href: "https://www.instagram.com/chatsmith_ai/",
    id: "ai-tool-footer-instagram",
    logo: "/images/landing-page-v2/social/insta.svg",
  },
  {
    channel: "tiktok",
    href: "https://www.tiktok.com/@aichatsmith",
    id: "ai-tool-footer-tiktok",
    logo: "/images/landing-page-v2/social/tiktok.svg",
  },
  {
    channel: "x",
    href: "https://x.com/ChatSmithApp",
    id: "ai-tool-footer-x",
    logo: "/images/landing-page-v2/social/x.svg",
  },
];
