"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useMemo } from "react";

import { LoginFlowMain } from "@/components/login-flow-main";
// import { HelpButton } from "@/components/help-button";
import { PackageSubscriptionModal } from "@/components/package-subscription-modal";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { CaptchaModal } from "@/features/guest-mode/components/captcha-modal";
import { GuestConfirmModal } from "@/features/guest-mode/components/guest-confirm-modal";
import { useBootstrapErrorHandler } from "@/features/guest-mode/hooks/use-bootstrap-error-handler";
import { useGuestVerification } from "@/features/guest-mode/hooks/use-guest-verification";
import {
  useForceReload,
  useLoadingSafeguard,
} from "@/features/guest-mode/hooks/use-loading-safeguard";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { buildInitializeConfig, usePaddle } from "@/libs/paddle-js";
import { useAuthState } from "@/store/auth";

// Lazy load modal components for better performance
const WebReminderModal = dynamic(
  async () => {
    const mod = await import("@/components/web-reminder-modal");
    return mod.WebReminderModal;
  },
  {
    ssr: false,
  }
);

const GuestModalManager = () => {
  // State selectors - grouped by concern
  const isVerifiedCaptcha = useGuestState((state) => state.isVerifiedCaptcha);
  const isShowCaptchaModal = useGuestState((state) => state.isShowCaptchaModal);
  const isOpenLoginModal = useAuthState((state) => state.isOpenLoginModal);
  const isOpenGuestConfirmModal = useGuestState(
    (state) => state.isOpenGuestConfirmModal
  );
  const setIsOpenLoginModal = useAuthState(
    (state) => state.setIsOpenLoginModal
  );

  // GU-1250: initialize paddle retain for guest mode.
  const paddleConfig = useMemo(() => buildInitializeConfig(), []);
  usePaddle(paddleConfig);

  const forceReload = useForceReload();
  useGuestVerification();
  useBootstrapErrorHandler(forceReload);
  useLoadingSafeguard({
    isLoading: !isVerifiedCaptcha,
    onTimeout: forceReload,
  });

  const handleCloseLoginModal = useCallback(() => {
    setIsOpenLoginModal(false, null);
  }, [setIsOpenLoginModal]);

  return (
    <>
      {isShowCaptchaModal && <CaptchaModal />}
      {isOpenGuestConfirmModal && <GuestConfirmModal />}
      <WebReminderModal />
      {/* HelpButton Desktop */}
      {/* <HelpButton className="fixed right-4 bottom-4 z-10 hidden md:block" /> */}
      {isVerifiedCaptcha && <PackageSubscriptionModal />}
      {isOpenLoginModal && (
        <LoginFlowMain
          isOpenLoginModal
          onClose={handleCloseLoginModal}
          dialogContentProps={{
            style: {
              pointerEvents: "auto",
              zIndex: MODAL_Z_INDEX.GUEST_LOGIN_MODAL,
            },
          }}
        />
      )}
    </>
  );
};

export default GuestModalManager;
