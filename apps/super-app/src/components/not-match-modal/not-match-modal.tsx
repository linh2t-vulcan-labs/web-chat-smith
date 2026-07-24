import Image from "next/image";

import { ButtonV2 } from "@/components/button-v2";
import { ModalV2 } from "@/components/modal";

import type { TNotMatchModalProps } from "./types";

const NotMatchModal = ({ isOpen, onClick, onClose }: TNotMatchModalProps) => (
  <ModalV2
    zIndex={150}
    containerClassName="md:max-w-[462px] w-full"
    className="md:p-large-8! p-[32px]"
    open={isOpen}
    onClose={onClose}
  >
    <div className="gap-medium-3 flex flex-col items-center text-center">
      <Image
        src="/images/not-match.png"
        width={150}
        height={178}
        alt="not match"
      />
      <div className="gap-small-0.75 flex flex-col">
        <h4 className="text-memoji text-text-general-secondary">
          Email address does not match!
        </h4>
        <p className="text-bodyS-neutral text-text-general-secondary">
          Please check again!
        </p>
      </div>
      <ButtonV2 fullWidth onClick={onClick}>
        Try Again
      </ButtonV2>
    </div>
  </ModalV2>
);

export default NotMatchModal;
