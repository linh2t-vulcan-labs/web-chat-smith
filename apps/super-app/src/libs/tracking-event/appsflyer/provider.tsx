"use client";

import { getRuntimeEnv } from "@cs/env/universal";
import Script from "next/script";
import React from "react";

type TAppsFlyerScriptProps = Readonly<{
  /**
   * Enable loading the AppsFlyer Web SDK.
   * Defaults to true only in production builds; override as needed.
   */
  enabled: boolean;
  /**
   * Your AppsFlyer Web App ID. If omitted, will fall back to
   * CS_PUBLIC_AF_WEB_APP_ID.
   */
  webAppId?: string;
  /**
   * Optional list of plugin short-names (e.g. "pba"), comma-separated.
   * Defaults to "pba".
   */
  plugins?: string;
  /**
   * Custom script element id to avoid duplicates if you need multiple variants.
   */
  id?: string;
}>;

export function AppsFlyerScript({
  enabled = false,
  // Default param evaluated at every render (including SSR of this
  // "use client" component) — use the isomorphic getRuntimeEnv().
  webAppId = getRuntimeEnv().CS_PUBLIC_AF_WEB_APP_ID || "",
  plugins = "pba",
  id = "appsflyer-sdk",
}: TAppsFlyerScriptProps): React.JSX.Element | null {
  if (!enabled) {
    return null;
  }
  if (!webAppId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[AF] AppsFlyerScript enabled but no webAppId provided.");
    }
    return null;
  }

  // Build the SDK URL. Keep this minimal & explicit.
  const src = `https://websdk.appsflyer.com?st=${encodeURIComponent(
    plugins
  )}&af_id=${encodeURIComponent(webAppId)}`;

  // Define the AF queue stub *before* the script loads so early events are queued.
  const inlineBootstrap = `
    (function(w, d) {
      var ns = 'AF';
      w.AppsFlyerSdkObject = ns;
      w[ns] = w[ns] || function() {
        (w[ns].q = w[ns].q || []).push([Date.now()].concat([].slice.call(arguments)));
      };
    })(window, document);
  `;

  return (
    <>
      <Script id={`${id}-bootstrap`} strategy="afterInteractive">
        {inlineBootstrap}
      </Script>
      <Script id={id} src={src} strategy="afterInteractive" />
    </>
  );
}
