import PopupQueueManagerListener from "@/features/onboarding-popup-queue-manager/components/popup-queue-manager-listener";
import { OnboardingPopupQueueManagerProvider } from "@/features/onboarding-popup-queue-manager/store";
import { GlobalStateProvider } from "@/store/global/context";
import {
  SubscriptionLoadingIndicator,
  SubscriptionProvider,
} from "@/store/subscription";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalStateProvider>
      <SubscriptionProvider>
        <SubscriptionLoadingIndicator />
        <OnboardingPopupQueueManagerProvider>
          {children}
          <PopupQueueManagerListener />
        </OnboardingPopupQueueManagerProvider>
      </SubscriptionProvider>
    </GlobalStateProvider>
  );
}
