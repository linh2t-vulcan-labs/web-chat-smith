import Image from "next/image";
import React from "react";

interface Props {
  onClickHome?: () => void;
}

export const SidebarHeader: React.FC<Props> = ({ onClickHome }) => (
  <div className="flex justify-center">
    <Image
      src="/images/logo-v3.svg"
      width={28}
      height={28}
      alt="logo"
      className="cursor-pointer"
      onClick={onClickHome}
    />
  </div>
);
