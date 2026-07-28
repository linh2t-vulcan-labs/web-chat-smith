"use client";

import { useEffect } from "react";

/**
 * The root `<html lang>` lives in the static outer layout (app/layout.tsx),
 * which doesn't know the request's locale — see that file for why. This
 * corrects it client-side once the real locale is known. Purely a
 * lang/a11y/SEO attribute with no visual effect, so unlike `dir` there's no
 * flash to worry about; `dir` is set correctly at SSR time on `<body>`
 * instead (see the app's own `[locale]/layout.tsx`, e.g.
 * `apps/web/app/(workspace)/[locale]/layout.tsx`).
 */
export const HtmlLangSync = ({ locale }: { locale: string }) => {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
};
