"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/button-ds";
import { PromoteSignin } from "@/components/promote-signin";
import { SvgIcon } from "@/components/svg-icon-ds";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useMatchRoute } from "@/hooks/use-match-route";
import { useGlobalState } from "@/store/global/hooks";

const NavbarMobile = () => {
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  return (
    <Button
      className="flex md:hidden"
      variant="ghost"
      iconOnly
      suffixIcon={<SvgIcon name="menu" size={24} />}
      onClick={handleToggleSidebar}
    />
  );
};

// Guest "sign in" promo banner. Only mounted in guest context (isGuest), so its
// guest-mode hooks never run on the logged-in suite layout that also uses SuiteNavbar.
const GuestPromoteSignin = () => {
  const tLogin = useTranslations("loginPage.loginForm");
  const tCommon = useTranslations("common");
  const { showLoginModal } = useFeatureGating();
  const isOpenPromoteSignIn = useGuestState(
    (state) => state.isOpenPromoteSignIn
  );
  const setIsOpenPromoteSignIn = useGuestState(
    (state) => state.setIsOpenPromoteSignIn
  );
  const matchGuestAssistantWildcard = useMatchRoute("/guest/assistant/*");

  if (!isOpenPromoteSignIn || matchGuestAssistantWildcard) {
    return null;
  }

  return (
    <PromoteSignin
      title={tLogin("guestBanner.title")}
      subTitle={tLogin("guestBanner.description")}
      signInText={tCommon("signIn")}
      className="md:top-v1-structural-content-normal top-v1-structural-section-large fixed start-1/2 z-10 w-full max-w-[92%] -translate-x-1/2 md:left-[calc(50%+74px)] md:max-w-120 md:-translate-x-[calc(50%+37px)] rtl:left-[calc(50%-74px)]"
      onSignIn={() => showLoginModal("header")}
      onClose={() => setIsOpenPromoteSignIn(false)}
    />
  );
};

export function SuiteNavbar({ isGuest = false }: { isGuest?: boolean }) {
  return (
    <>
      <div className="suite-root">
        <nav className="bg-v1-surface-hierarchy-base px-v1-structural-component-medium py-v1-optical-strong gap-v1-structural-content-micro flex h-15 flex-row items-center">
          <NavbarMobile />
          <span className="text-heading-scale-0 text-v1-text-hierarchy-primary min-w-0 flex-1 font-medium capitalize">
            Design Studio
          </span>
        </nav>
      </div>
      {isGuest && <GuestPromoteSignin />}
    </>
  );
}
