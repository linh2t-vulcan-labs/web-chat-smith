import { GuideTourProvider } from "@/libs/guide-tour";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuideTourProvider>{children}</GuideTourProvider>;
}
