import Link from "next/link";

import { Button } from "@/components/button";
import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";

export default function ErrorPageContent() {
  return (
    <div className="bg-error-starling absolute top-0 h-screen max-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat">
      <section className="gap-small-1 relative z-99 m-auto flex h-screen max-h-screen w-full flex-col items-center justify-center space-y-6 px-4 md:max-w-[568px] md:space-y-8 md:px-0">
        <div className="gap-small-0.5 md:gap-small-1 flex flex-col text-center">
          <div className="text-text-general-brand-identity flex flex-col">
            <p className="text-bodyXL-Highlight">Error</p>
            <h1 className="text-web-h1">50x</h1>
          </div>
          <h2 className="text-mobile-h4 md:text-web-h4">
            This is a temporary issue.
          </h2>
          <p className="text-bodyM-Neutral">
            This is a temporary issue. Please try again in a few minutes. In
            case error persists, contact us via{" "}
            <Link
              href={LINK_NEED_HELP_CONST}
              prefetch={false}
              className="text-bodyM-Link text-text-general-brand-identity hover:text-surface-action-primary-hover cursor-pointer underline"
            >
              {LINK_NEED_HELP_CONST}
            </Link>
          </p>
        </div>
        <Button color="tertiary">
          <Link href={LINK_NEED_HELP_CONST} prefetch={false}>
            Contact Us
          </Link>
        </Button>
      </section>
    </div>
  );
}
