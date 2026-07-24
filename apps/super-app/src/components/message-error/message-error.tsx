import { Button } from "@/components/button";
import Link from "@/components/link/link";
import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";

import type { TMessageError } from "./types";

export default function MessageError({ onRetry }: TMessageError) {
  return (
    <div className="flex w-full flex-row justify-start">
      <div className="block w-4/5">
        <div className="flex w-full flex-row gap-3">
          <div className="order-2 flex w-full flex-row justify-start md:w-[calc(100%-48px)]">
            <div
              className="gap-medium-1.5 rounded-tl-default rounded-tr-default rounded-br-default flex w-fit
                max-w-full whitespace-break-spaces"
            >
              <div className="size-[24px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12.0003 3.34277C11.2005 3.34277 10.2327 3.89167 9.41625 5.36399L9.4156 5.36514L6.47607 10.6443L6.47561 10.6451L3.35626 16.264C2.59577 17.6356 2.62829 18.7174 3.03589 19.4119C3.44308 20.1056 4.3701 20.6603 5.94034 20.6603H12.0003C12.0422 20.6603 12.0832 20.6637 12.1231 20.6703H18.0603C19.6248 20.6703 20.5527 20.116 20.9614 19.4213C21.3702 18.7263 21.4043 17.6445 20.6444 16.274L17.5248 10.6546L17.5246 10.6543L14.5848 5.36461L14.5844 5.36399C13.768 3.89167 12.8002 3.34277 12.0003 3.34277ZM11.8776 22.1603H5.94034C4.04058 22.1603 2.5076 21.475 1.74228 20.1712C0.977392 18.8681 1.12491 17.195 2.04441 15.5366L2.04461 15.5362L5.16461 9.91624L5.16507 9.91541L8.10443 4.63656L8.1048 4.6359C9.06836 2.89861 10.4504 1.84277 12.0003 1.84277C13.5503 1.84277 14.9323 2.89863 15.8959 4.63594L15.8959 4.63599L15.8962 4.63656L18.8359 9.92594L18.8361 9.92624L21.9561 15.5462L21.9563 15.5466C22.8763 17.206 23.0205 18.8792 22.2543 20.1818C21.488 21.4845 19.9559 22.1703 18.0603 22.1703H12.0003C11.9585 22.1703 11.9175 22.1669 11.8776 22.1603ZM11.9999 8.25024C12.4141 8.25024 12.7499 8.58603 12.7499 9.00024V14.0002C12.7499 14.4145 12.4141 14.7502 11.9999 14.7502C11.5857 14.7502 11.2499 14.4145 11.2499 14.0002V9.00024C11.2499 8.58603 11.5857 8.25024 11.9999 8.25024ZM11.9941 16.0002C11.4418 16.0002 10.9941 16.448 10.9941 17.0002C10.9941 17.5525 11.4418 18.0002 11.9941 18.0002H12.003C12.5553 18.0002 13.003 17.5525 13.003 17.0002C13.003 16.448 12.5553 16.0002 12.003 16.0002H11.9941Z"
                    fill="#F83617"
                  />
                </svg>
              </div>
              <div className="gap-medium-2 flex flex-1 flex-col">
                <div className="flex flex-col">
                  <h4 className="text-bodyM-highlight text-text-system-error">
                    We encountered an issue
                  </h4>
                  <p className="text-footnoteM-neutral text-text-general-secondary mt-small-0.5">
                    It seems there was a problem processing your request. This
                    could be due to a network issue or a temporary server
                    problem.
                  </p>
                  <ul className="text-footnoteM-neutral text-text-general-secondary mt-small-0.5 list-disc ps-3">
                    <li>Check your internet connection and try again.</li>
                    <li>Refresh the page and resend your prompt.</li>
                    <li>
                      If the problem persists, please contact support for
                      further assistance.
                    </li>
                  </ul>
                </div>
                <div className="gap-medium-1.5 flex">
                  <Link
                    fullWidth
                    size="base"
                    color="line"
                    href={LINK_NEED_HELP_CONST}
                  >
                    Need Help
                  </Link>
                  <Button fullWidth onClick={onRetry}>
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
