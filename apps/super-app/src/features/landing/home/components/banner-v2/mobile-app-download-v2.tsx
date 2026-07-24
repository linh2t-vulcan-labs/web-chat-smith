import Image from "next/image";

import { Link } from "@/i18n/navigation";

interface Props {
  appStoreLink: string;
  chPlayLink: string;
}

export default function MobileAppDownloadV2({
  appStoreLink,
  chPlayLink,
}: Props) {
  return (
    <>
      <Link
        href={appStoreLink}
        className="relative h-11 w-[136px]"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/images/landing-page-v2/app-store.png"
          alt="apple-store"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
      <Link
        href={chPlayLink}
        className="relative h-11 w-[136px]"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/images/landing-page-v2/google-play.png"
          alt="google-store"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
    </>
  );
}
