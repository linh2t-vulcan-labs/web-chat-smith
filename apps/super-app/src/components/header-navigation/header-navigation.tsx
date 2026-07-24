import Image from "next/image";

import { DownloadAppButton } from "@/components/download-app-button";
import { Link } from "@/i18n/navigation";
import { HOME_URL } from "@/utils/constants/url";

function HeaderNavigation() {
  return (
    <header className="backdrop-blur-webkit fixed top-0 z-999 flex h-[104px] w-full items-end md:h-[72px]">
      <div className="mb-4 flex w-full justify-between px-8">
        <Link href={HOME_URL} className="flex items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-v2.png"
              alt="logo"
              width={32}
              height={32}
            />
            <span className="text-title3 text-text-general-primary">
              Chat Smith
            </span>
          </div>
        </Link>
        <div className="">
          <DownloadAppButton text="Start Chatting" />
        </div>
      </div>
    </header>
  );
}

export default HeaderNavigation;
