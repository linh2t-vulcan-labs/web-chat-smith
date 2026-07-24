import type { Metadata } from "next";

import { generateLocalizedPageMetadata } from "@/metadata/seo";
import { GUEST_URL } from "@/utils/constants/url";

import GuestConversation from "./guest-conversation";

interface TGuestPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TGuestPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateLocalizedPageMetadata(locale, GUEST_URL);
}

export default function Page() {
  return <GuestConversation />;
}
