import Image from "next/image";

import { Link } from "@/i18n/navigation";

import { footerMobileStores } from "./consts";

export function FooterMobileStores() {
  return (
    <div className="flex gap-medium-2.5">
      {footerMobileStores.map((store) => (
        <Link
          key={store.id}
          id={store.id}
          href={store.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-11 w-[136px]"
        >
          <Image
            src={store.url}
            alt={store.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      ))}
    </div>
  );
}
