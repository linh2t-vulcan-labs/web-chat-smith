import { useTranslations } from "next-intl";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { compositeStyles } from "@/utils/commons/styles";
import { FAQ_URL } from "@/utils/constants/url";

const SubscriptionLayoutV5: React.FC<
  PropsWithChildren & { showNavigate?: boolean }
> = ({ showNavigate = true, children }) => {
  const isDesktop = useMediaQuery("md");
  const commonT = useTranslations("common");
  const mainLayoutT = useTranslations("mainLayout");

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      <div className="my-medium-2 2xl:px-large-10 mx-auto flex w-full items-center">
        <div
          className={compositeStyles(
            "gap-medium-3 p-medium-2 flex items-center",
            !isDesktop && !showNavigate && "hidden"
          )}
        >
          <div className="border-border-brand-identity text-bodyM-highlight text-text-general-brand-identity border-b-[3px]">
            {commonT("upgrade")}
          </div>
          <div className="text-bodyM-highlight text-icon-general-primary">
            <Link href={FAQ_URL}>{mainLayoutT("helpCenter.faq.title")}</Link>
          </div>
        </div>
      </div>
      <div className="gap-medium-3 mx-auto flex w-full flex-col xl:max-w-[1206px]">
        <div className="relative h-[calc(100dvh-94px)] min-h-0">{children}</div>
      </div>
    </div>
  );
};

export default SubscriptionLayoutV5;
