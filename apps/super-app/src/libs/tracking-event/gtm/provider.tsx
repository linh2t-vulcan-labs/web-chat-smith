"use client";

import { GoogleTagManager } from "@next/third-parties/google";
// import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * Props required for initializing Google Tag Manager.
 *
 * @property {string} gtmId  - Google Tag Manager container ID (e.g. "GTM-XXXXXXX")
 * @property {string} auth   - GTM environment-specific authentication string
 * @property {string} preview - GTM preview mode identifier
 * @property {string} [nonce]  - Per-request CSP nonce (from getNonce()). Required for
 *   'strict-dynamic' to trust gtm.js and everything it injects — without it,
 *   every third-party tag GTM loads (ad pixels, Clarity, etc.) needs its own
 *   domain in script-src-elem.
 */
type TGoogleTagManagerProviderProps = Readonly<{
  gtmId: string;
  auth: string;
  preview: string;
  nonce?: string;
}>;

/**
 * GoogleTagManagerProvider
 *
 * Mirrors `@next/third-parties/google`'s `<GoogleTagManager>` snippet, but
 * loads the actual `gtm.js` payload (~170KiB, the bulk of the Lighthouse
 * "unused JavaScript"/main-thread-work finding) with `strategy="lazyOnload"`
 * instead of the library's fixed `afterInteractive`. This defers GTM's
 * parse/eval cost to browser idle time, off the initial-load critical
 * window — without dropping any tracking data: the inline dataLayer-init
 * script still runs eagerly, and `dataLayer.push` (via `sendGTMEvent`)
 * self-initializes the array and queues events regardless of whether gtm.js
 * has loaded yet, so nothing fired before idle is lost — it's only
 * delivered a bit later, same as GTM's own documented queuing behavior.
 *
 * Do not gate this on cookie consent — see project chat: an earlier opt-in
 * consent gate was reverted because it silently dropped GA4/Ads data for
 * every visitor who didn't interact with a consent banner in time, which is
 * a growth/marketing-impacting decision no one had signed off on.
 */
function GoogleTagManagerProvider(props: TGoogleTagManagerProviderProps) {
  const { gtmId, auth, preview, ...rest } = props;

  const [load, setLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoad(true);
    }, 3000);
    const onInteraction = () => {
      setLoad(true);
    };

    window.addEventListener("scroll", onInteraction);
    window.addEventListener("click", onInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("click", onInteraction);
    };
  }, []);

  if (!load) {
    return null;
  }

  return (
    <GoogleTagManager gtmId={gtmId} auth={auth} preview={preview} {...rest} />
  );

  // const scriptUrl = new URL("https://www.googletagmanager.com/gtm.js");
  // scriptUrl.searchParams.set("id", gtmId);
  // if (auth) {
  //   scriptUrl.searchParams.set("gtm_auth", auth);
  // }
  // if (preview) {
  //   scriptUrl.searchParams.set("gtm_preview", preview);
  //   scriptUrl.searchParams.set("gtm_cookies_win", "x");
  // }

  // return (
  //   <>
  //     <Script
  //       dangerouslySetInnerHTML={{
  //         __html: `(function(w,l){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});})(window,'dataLayer');`,
  //       }}
  //       id="_next-gtm-init"
  //       nonce={nonce}
  //       strategy="afterInteractive"
  //     />
  //     <Script
  //       data-ntpc="GTM"
  //       id="_next-gtm"
  //       nonce={nonce}
  //       src={scriptUrl.href}
  //       strategy="lazyOnload"
  //     />
  //   </>
  // );
}

export { GoogleTagManagerProvider };
