"use client";

import React from "react";

import { LoadingProcessing } from "@/components/loading-icon";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";

const CaptchaLoadingProcessing = () => {
  const isShowCaptchaModal = useGuestState((state) => state.isShowCaptchaModal);
  const isVerifiedCaptcha = useGuestState((state) => state.isVerifiedCaptcha);

  const loadingText = "loadingVerifyCaptcha";

  return (
    isShowCaptchaModal &&
    !isVerifiedCaptcha && <LoadingProcessing isSpinning text={loadingText} />
  );
};

export default CaptchaLoadingProcessing;
