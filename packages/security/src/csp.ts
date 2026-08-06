import { isNonEmptyString } from "@cs/core/domain";

import {
  CSP_BING_ADS,
  CSP_CORALOGIX,
  CSP_FIREBASE,
  CSP_GOOGLE,
  CSP_GOOGLE_ADS,
  CSP_GOOGLE_AUTH,
  CSP_IMAGE_HOSTS,
  CSP_META_PIXEL,
  CSP_PADDLE,
  CSP_TURNSTILE,
} from "./constants";

export type CspDirectives = Record<string, string | (string | undefined)[]>;

export interface CspOptions {
  apiBaseUrl?: string;
  domainWildcard?: string;
  isProd: boolean;
  webUrl?: string;
}

const toKebabCase = (s: string): string =>
  s.replaceAll(/(?<u>[A-Z])/gu, (m) => `-${m.toLowerCase()}`);

export const serializeCsp = (directives: CspDirectives): string =>
  Object.entries(directives)
    .map(([key, val]) => {
      const tokens = [
        ...new Set((Array.isArray(val) ? val : [val]).filter(isNonEmptyString)),
      ];
      const name = toKebabCase(key);
      return tokens.length === 0 ? name : `${name} ${tokens.join(" ")}`;
    })
    .join("; ");

export const buildCspDirectives = ({
  apiBaseUrl,
  domainWildcard,
  isProd,
  webUrl,
}: CspOptions): CspDirectives => {
  const dev = (src: string): string | undefined => (isProd ? undefined : src);
  const unsafeEval = isProd ? undefined : "'unsafe-eval'";

  return {
    baseUri: ["'self'"],
    connectSrc: [
      "'self'",
      dev("localhost:*"),
      dev("ws://localhost:*"),
      webUrl,
      apiBaseUrl,
      domainWildcard,
      ...CSP_FIREBASE,
      ...CSP_CORALOGIX,
      ...CSP_GOOGLE,
      // GIS One Tap issues status/credential fetches to accounts.google.com.
      ...CSP_GOOGLE_AUTH,
      ...CSP_PADDLE,
      // Google Ads conversion/remarketing collect endpoints (ccm/rmkt).
      ...CSP_GOOGLE_ADS,
      // Microsoft Clarity uploads recorded session data.
      ...CSP_BING_ADS,
    ],
    defaultSrc: ["'self'"],
    fontSrc: ["'self'", "data:", domainWildcard],
    formAction: ["'self'"],
    frameAncestors: ["'self'", dev("localhost:*")],
    frameSrc: [
      "'self'",
      dev("localhost:*"),
      ...CSP_TURNSTILE,
      ...CSP_PADDLE,
      ...CSP_GOOGLE,
      ...CSP_GOOGLE_AUTH,
      ...CSP_FIREBASE,
      domainWildcard,
    ],
    imgSrc: ["'self'", "data:", apiBaseUrl, domainWildcard, ...CSP_IMAGE_HOSTS],
    manifestSrc: ["'self'"],
    mediaSrc: ["'self'", domainWildcard, ...CSP_IMAGE_HOSTS],
    objectSrc: ["'none'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      unsafeEval,
      ...CSP_GOOGLE,
      ...CSP_GOOGLE_AUTH,
      ...CSP_TURNSTILE,
      dev("localhost:*"),
      domainWildcard,
    ],
    scriptSrcElem: [
      "'self'",
      "'unsafe-inline'",
      unsafeEval,
      ...CSP_TURNSTILE,
      ...CSP_GOOGLE,
      ...CSP_GOOGLE_AUTH,
      ...CSP_PADDLE,
      // Ad/remarketing pixels fired via GTM tags.
      ...CSP_BING_ADS,
      ...CSP_META_PIXEL,
      ...CSP_GOOGLE_ADS,
      dev("localhost:*"),
      domainWildcard,
    ],
    styleSrc: ["'self'", "'unsafe-inline'", ...CSP_GOOGLE_AUTH, ...CSP_PADDLE],
    workerSrc: ["'self'", "blob:", dev("localhost:*"), domainWildcard],
    ...(isProd ? { upgradeInsecureRequests: [] } : {}),
  };
};
