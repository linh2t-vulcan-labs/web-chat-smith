"use client";

import { useLocale } from "next-intl";
import Script from "next/script";

import {
  GOOGLE_CLIENT_SRC,
  GOOGLE_IDENTITY_READY_EVENT,
  GOOGLE_SCRIPT_ID,
} from "./constants";

export function GoogleAuthScript() {
  const locale = useLocale();

  return (
    <Script
      id={GOOGLE_SCRIPT_ID}
      src={`${GOOGLE_CLIENT_SRC}?hl=${locale}`}
      strategy="afterInteractive"
      onReady={() => {
        const script = document.querySelector(`#${GOOGLE_SCRIPT_ID}`);
        if (script instanceof HTMLScriptElement) {
          script.dataset.loaded = "true";
        }

        document.dispatchEvent(new Event(GOOGLE_IDENTITY_READY_EVENT));
      }}
    />
  );
}
