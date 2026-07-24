"use client";

import { LoginFormV2 } from "@/components/login-form-v2";
import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";

import type { TLoginFlowMainProps } from "./types";

export default function LoginFlowMain(props: TLoginFlowMainProps) {
  const { isOpenLoginModal, dialogContentProps, onClose } = props;

  return (
    <ModalV2
      open={isOpenLoginModal}
      onClose={onClose}
      isPreventClickOutside
      containerClassName="max-w-[calc(100vw-32px)] dark:bg-bg-login-form bg-cover inline-flex justify-center items-center w-full md:w-fit"
      // className="py-small-0.25! space-y-large-5 rounded-default flex flex-col items-center justify-center px-0! md:w-[270px]"
      dialogContentProps={dialogContentProps}
      className="p-0!"
    >
      <div className="px-large-4 py-large-6 md:p-large-10 relative w-full md:w-fit">
        {onClose && (
          <SVGIcon
            src="/icons/outlined/closed.svg"
            width={20}
            height={20}
            className="end-medium-2 top-medium-2 text-text-general-tertiary hover:text-text-general-secondary absolute cursor-pointer"
            onClick={onClose}
          />
        )}
        <div className="space-y-large-5 md:w-[270px]">
          <LoginFormV2 showLastBreak={false} />
        </div>
      </div>
    </ModalV2>
  );
}
