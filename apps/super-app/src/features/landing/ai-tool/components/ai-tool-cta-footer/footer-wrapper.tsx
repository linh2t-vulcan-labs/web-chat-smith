import type { HeaderCategories } from "../../sanity/get-header-categories";
import type { AIToolLocale } from "../../translations/config";
import AIToolFooter from "../ai-tool-footer/ai-tool-footer";
import AIToolFooterProductNav from "../ai-tool-footer/ai-tool-product-nav/ai-tool-footer-product-nav";
import AIToolCTAFooter from "./ai-tool-cta-footer";

export interface FooterWrapperProps {
  desktopProductNav?: {
    locale: AIToolLocale;
    categories: HeaderCategories["categories"];
    extraCategories: HeaderCategories["extraCategories"];
  };
  trackingPage?: "ai-tool" | "pricing";
}

/**
 * Bundles the three AI-tool footer regions so a route layout only needs a single mount point:
 * 1. `AIToolCTAFooter` – top "Sign Up Now" CTA band
 * 2. `AIToolFooterProductNav` – header `categories` / `extra_categories` link columns
 * 3. `AIToolFooter` – brand, about, follow, and copyright bar
 */
export default function FooterWrapper({
  desktopProductNav,
  trackingPage,
}: FooterWrapperProps = {}) {
  return (
    <>
      <AIToolCTAFooter trackingPage={trackingPage} />
      {desktopProductNav ? (
        <AIToolFooterProductNav
          locale={desktopProductNav.locale}
          categories={desktopProductNav.categories}
          extraCategories={desktopProductNav.extraCategories}
        />
      ) : null}
      <AIToolFooter />
    </>
  );
}
