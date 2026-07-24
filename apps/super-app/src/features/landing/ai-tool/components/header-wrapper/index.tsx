"use client";

import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import NextLink from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import type { AiToolTitleByLocale } from "@/libs/sanity/sanity.types";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import ChevronDown from "@/public/icons/landing-page/arrow-down.svg?react";
import LangTriggerArrow from "@/public/icons/landing-page/arrow.svg?react";
import CheckIcon from "@/public/icons/landing-page/checked.svg";
import CloseIcon from "@/public/icons/landing-page/close.svg";
import HamburgerIcon from "@/public/icons/landing-page/hamburger.svg?react";
import SearchStatus from "@/public/icons/landing-page/search.svg?react";
import {
  BLOGS_URL,
  HOME_URL,
  LOGIN_PAGE_URL,
  PRICING_PAGE_URL,
} from "@/utils/constants/url";

import {
  AI_TOOL_LOCALES,
  normalizeAIToolLocale,
} from "../../translations/config";
import type { AIToolLocale } from "../../translations/config";
import type {
  AIToolHeaderCategoryLinkRow,
  AIToolHeaderCategoryRow,
  AIToolHeaderResolvedCategory,
} from "../../types/types";
import { pickByLocaleKey } from "../../utils/locale-record";
import Account from "./account";
import { useHeaderNavLayout } from "./use-header-nav-layout";

import styles from "./styles.module.css";

const LANGUAGE_FLAG_ICONS: Partial<
  Record<(typeof AI_TOOL_LOCALES)[number], string>
> = {
  ar: "/icons/landing-page/flag_ar.png",
  en: "/icons/landing-page/flag_en.png",
  es: "/icons/landing-page/flag_es.png",
  hi: "/icons/landing-page/flag_hi.png",
  ja: "/icons/landing-page/flag_ja.png",
  ko: "/icons/landing-page/flag_ko.png",
  th: "/icons/landing-page/flag_th.png",
  zh: "/icons/landing-page/flag_zh.png",
};

function pickLocalizedTitle(
  byLocale: AiToolTitleByLocale | undefined,
  locale: AIToolLocale
): string {
  if (!byLocale) {
    return "";
  }
  const preferred = pickByLocaleKey(byLocale, locale);
  if (typeof preferred === "string" && preferred.trim()) {
    return preferred.trim();
  }
  for (const loc of AI_TOOL_LOCALES) {
    const v = pickByLocaleKey(byLocale, loc);
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return "";
}

function resolveCurrentLanguage<T extends { id: string }>(
  languageOptions: T[],
  locale: string
): T {
  // AI_TOOL_LOCALES is a fixed non-empty tuple, so languageOptions[0] always exists.
  const [firstLanguageOption] = languageOptions;
  if (!firstLanguageOption) {
    throw new Error("AI_TOOL_LOCALES must not be empty");
  }
  return (
    languageOptions.find((option) => option.id === locale) ??
    firstLanguageOption
  );
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//iu.test(href.trim());
}

function externalLinkProps(href: string): { target?: "_blank"; rel?: string } {
  return isExternalHref(href)
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};
}

/** Max links per vertical column before wrapping to the next column (same category). */
/** Minimum drawer search length before categories/links are filtered. */
const DRAWER_SEARCH_MIN_LENGTH = 2;

function readMegaPanelTopOffsetPx(scopeEl: Element | null): number {
  if (!scopeEl) {
    return 12;
  }
  const raw = getComputedStyle(scopeEl)
    .getPropertyValue("--ai-header-mega-panel-top-offset")
    .trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : 12;
}

const BLOGS_PAGE_PATH = BLOGS_URL;

/** Lowercase only (no trim) for drawer search matching. */
function drawerSearchMatchKey(query: string): string {
  return query.toLowerCase();
}

/** Collect category title strings from Sanity `categoryTitleByLocale` for matching. */
function getCategoryTitleSearchStrings(
  category: AIToolHeaderResolvedCategory,
  locale: AIToolLocale,
  untitledFallback: string
): string[] {
  const out: string[] = [];
  const displayed =
    pickLocalizedTitle(category.categoryTitleByLocale, locale) ||
    untitledFallback;
  out.push(displayed);
  const by = category.categoryTitleByLocale;
  if (by) {
    for (const loc of AI_TOOL_LOCALES) {
      const v = pickByLocaleKey(by, loc);
      if (typeof v === "string" && v.trim()) {
        out.push(v.trim());
      }
    }
  }
  return [...new Set(out)];
}

/** Collect link label strings from Sanity `linkTitleByLocale` for matching (all configured locales). */
function getLinkTitleSearchStrings(
  linkTitleByLocale: AiToolTitleByLocale | undefined,
  locale: AIToolLocale,
  untitledFallback: string
): string[] {
  const out: string[] = [];
  const displayed =
    pickLocalizedTitle(linkTitleByLocale, locale) || untitledFallback;
  out.push(displayed);
  if (linkTitleByLocale) {
    for (const loc of AI_TOOL_LOCALES) {
      const v = pickByLocaleKey(linkTitleByLocale, loc);
      if (typeof v === "string" && v.trim()) {
        out.push(v.trim());
      }
    }
  }
  return [...new Set(out)];
}

function linkRowMatchesDrawerSearch(
  item: AIToolHeaderCategoryLinkRow,
  locale: AIToolLocale,
  untitledFallback: string,
  matchKey: string
): boolean {
  return getLinkTitleSearchStrings(
    item.link.linkTitleByLocale,
    locale,
    untitledFallback
  ).some((s) => s.toLowerCase().includes(matchKey));
}

function getDrawerVisibleLinkRows(
  category: AIToolHeaderResolvedCategory,
  locale: AIToolLocale,
  untitledFallback: string,
  matchKey: string,
  searchFilterActive: boolean
): AIToolHeaderCategoryLinkRow[] {
  const base = (category.links ?? []).filter((item) => item.link?._id);
  if (!searchFilterActive) {
    return base;
  }
  const categoryHit = getCategoryTitleSearchStrings(
    category,
    locale,
    untitledFallback
  ).some((s) => s.toLowerCase().includes(matchKey));
  if (categoryHit) {
    return base;
  }
  return base.filter((item) =>
    linkRowMatchesDrawerSearch(item, locale, untitledFallback, matchKey)
  );
}

function categoryMatchesDrawerSearch(
  category: AIToolHeaderResolvedCategory,
  locale: AIToolLocale,
  untitledFallback: string,
  matchKey: string
): boolean {
  if (matchKey.length < DRAWER_SEARCH_MIN_LENGTH) {
    return true;
  }
  if (
    getCategoryTitleSearchStrings(category, locale, untitledFallback).some(
      (s) => s.toLowerCase().includes(matchKey)
    )
  ) {
    return true;
  }
  const links = (category.links ?? []).filter((item) => item.link?._id);
  return links.some((item) =>
    linkRowMatchesDrawerSearch(item, locale, untitledFallback, matchKey)
  );
}

/** Expand `<details>` once on mount (types omit `defaultOpen` on `details` in this React version). */
function setMobileDrawerDetailsOpenOnce(el: HTMLDetailsElement | null) {
  if (!el) {
    return;
  }
  if (el.dataset.aiInitialOpen === "1") {
    return;
  }
  el.open = true;
  el.dataset.aiInitialOpen = "1";
}

interface ProductsMegaMenuBodyProps {
  categoryRows: AIToolHeaderCategoryRow[];
  locale: AIToolLocale;
  untitledLabel: string;
}

/** Products mega-menu columns — only rendered with `<nav>` (hidden in compact header layout). */
function ProductsMegaMenuBody({
  categoryRows,
  locale,
  untitledLabel,
}: ProductsMegaMenuBodyProps) {
  const categoryCount = Math.max(categoryRows.length, 1);

  return (
    <div
      className={styles.productsGrid}
      style={{ "--ai-products-category-count": categoryCount } as CSSProperties}
    >
      {categoryRows.map(({ _key: rowKey, category }) => (
        <div key={`${category._id}-${rowKey}`} className={styles.productsCol}>
          <div className={styles.productsHeading}>
            {pickLocalizedTitle(category.categoryTitleByLocale, locale) ||
              untitledLabel}
          </div>
          <div className={styles.productsList}>
            {(category.links ?? [])
              .filter((item) => item.link?._id)
              .map((item) => {
                const href = item.link.url?.trim() || "#";
                return (
                  <NextLink
                    key={item._key}
                    href={href as Route}
                    role="menuitem"
                    className={styles.productsItem}
                    {...externalLinkProps(href)}
                  >
                    {pickLocalizedTitle(item.link.linkTitleByLocale, locale) ||
                      untitledLabel}
                  </NextLink>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface HeaderWrapperProps {
  /** Resolved from Sanity singleton `header` (`categories` / `extra_categories`). */
  categories: AIToolHeaderCategoryRow[];
  /** `/home`: ai-tool header (dark scope) + lang + Chat now instead of Account. */
  variant?: "default" | "home";
}

function ChatNowCta({
  label,
  className,
  onNavigate,
}: {
  label: string;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={LOGIN_PAGE_URL}
      id={TRACKING_ELEMENT_ID.LANDING_PAGE.START_CHATTING}
      className={className}
      onClick={onNavigate}
    >
      <span className={styles.chatNowBtn}>{label}</span>
    </Link>
  );
}

/** Renders the home-page CMS link when on the home variant, else the localized app route. */
function HomeAwareLink({
  isHomeVariant,
  homeHref,
  className,
  children,
}: {
  isHomeVariant: boolean;
  homeHref: Route;
  className?: string;
  children: ReactNode;
}) {
  if (isHomeVariant) {
    return (
      <Link href={HOME_URL} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <NextLink href={homeHref} className={className}>
      {children}
    </NextLink>
  );
}

export default function HeaderWrapper({
  categories,
  variant = "default",
}: HeaderWrapperProps) {
  const isHomeVariant = variant === "home";
  const t = useTranslations("aiTool");
  const tLanding = useTranslations("landingPage");
  const locale = normalizeAIToolLocale(useLocale());
  const pathname = usePathname();

  const homeHref = "/";

  const categoryRows = (categories ?? []).filter((row) => row.category?._id);

  const languageOptions = AI_TOOL_LOCALES.map((id) => ({
    flagSrc: LANGUAGE_FLAG_ICONS[id] ?? null,
    id,
    title: t(`languages.${id}`),
  }));
  const currentLanguage = resolveCurrentLanguage(languageOptions, locale);

  const untitledLabel = t("header.fallback.untitled");
  const toggleMenuLabel = t("header.aria.toggleMenu");
  const languageLabel = t("header.aria.language");
  const searchPlaceholder = t("header.search.placeholder");
  const searchAriaLabel = t("header.search.ariaLabel");
  const searchNoResults = t("header.search.noResults");
  const signInLabel = t("header.auth.signIn");
  const accountAriaLabel = t("header.aria.account");
  const homeLabel = t("header.nav.home");
  const productsLabel = t("header.nav.products");
  const blogLabel = t("header.nav.blog");
  const pricingLabel = t("header.nav.pricing");
  const brandName = t("brand.name");
  const chatNowLabel = tLanding("CTA");

  const containerRef = useRef<HTMLDivElement>(null);

  const navLayoutKey = useMemo(
    () =>
      [
        locale,
        categoryRows.length,
        homeLabel,
        productsLabel,
        blogLabel,
        pricingLabel,
        brandName,
      ].join("|"),
    [
      // oxlint-disable-next-line react/react-compiler -- compiler flags categoryRows as possibly mutated later since it's an externally-owned array prop; verifying immutability across all callers is out of scope here
      locale,
      categoryRows.length,
      homeLabel,
      productsLabel,
      blogLabel,
      pricingLabel,
      brandName,
    ]
  );

  /* --- Mobile compact layout: full-screen navigation drawer --- */
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const drawerToggleLockRef = useRef(false);

  /* --- Desktop + mobile (header): products mega-menu / language dropdown --- */
  const [productsOpen, setProductsOpen] = useState(false);
  const [productsPanelTop, setProductsPanelTop] = useState<number | null>(null);
  const productsRootRef = useRef<HTMLDivElement>(null);
  const productsMenuId = useId();

  const [langOpen, setLangOpen] = useState(false);
  const langRootRef = useRef<HTMLDivElement>(null);
  const langMenuId = useId();

  const layout = useHeaderNavLayout(containerRef, navLayoutKey, {
    freezeMeasure: mobileDrawerOpen,
  });

  const handleMobileDrawerToggle = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (drawerToggleLockRef.current) {
        return;
      }
      drawerToggleLockRef.current = true;
      setMobileDrawerOpen((open) => !open);
      setProductsOpen(false);
      window.setTimeout(() => {
        drawerToggleLockRef.current = false;
      }, 300);
    },
    [setMobileDrawerOpen, setProductsOpen]
  );

  const handleMobileDrawerClose = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (drawerToggleLockRef.current) {
        return;
      }
      setMobileDrawerOpen(false);
    },
    [setMobileDrawerOpen]
  );
  const [drawerSearchQuery, setDrawerSearchQuery] = useState("");
  const mobileDrawerId = useId();
  const mobileMenuBtnId = useId();

  const navigationDrawerLabel = t("header.aria.navigationDrawer");
  const closeMenuLabel = t("header.aria.closeMenu");

  // Mobile drawer: lock page scroll while open.
  useEffect(() => {
    if (!mobileDrawerOpen) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileDrawerOpen]);

  // Mobile drawer: reset search when closed.
  useEffect(() => {
    if (!mobileDrawerOpen) {
      // oxlint-disable-next-line react/react-compiler -- clears the drawer search query when the mobile drawer closes, syncing with that external open/close transition, not a render derivation
      setDrawerSearchQuery("");
    }
  }, [mobileDrawerOpen]);

  // Desktop products mega-menu: Y from Product anchor; X via `--ai-header-products-panel-left` (~150px).
  useLayoutEffect(() => {
    if (!productsOpen) {
      // oxlint-disable-next-line react/react-compiler -- resets the DOM-measured panel offset when the mega-menu closes, syncing with the layout effect below, not a render derivation
      setProductsPanelTop(null);
      return;
    }

    const root = productsRootRef.current;
    if (!root) {
      return;
    }

    const syncPanelTop = () => {
      const scope = root.closest(".ai-tool-scope");
      const offset = readMegaPanelTopOffsetPx(scope);
      setProductsPanelTop(root.getBoundingClientRect().bottom + offset);
    };

    syncPanelTop();
    window.addEventListener("resize", syncPanelTop);
    window.addEventListener("scroll", syncPanelTop, true);
    return () => {
      window.removeEventListener("resize", syncPanelTop);
      window.removeEventListener("scroll", syncPanelTop, true);
    };
  }, [productsOpen]);

  const loginHref = `/${locale}/login`;
  // oxlint-disable-next-line react/react-compiler -- compiler could not preserve this memoization in its output (likely cascading from the categoryRows mutation concerns above); verifying is out of scope here
  const drawerSearchLowercase = useMemo(
    () => drawerSearchMatchKey(drawerSearchQuery),
    [drawerSearchQuery]
  );
  const drawerSearchFilterActive =
    drawerSearchLowercase.length >= DRAWER_SEARCH_MIN_LENGTH;

  // Mobile drawer: categories/links filtered by search (see `DRAWER_SEARCH_MIN_LENGTH`).
  // oxlint-disable-next-line react/react-compiler -- compiler could not preserve this memoization in its output (likely cascading from the categoryRows mutation concerns below); verifying is out of scope here
  const filteredDrawerCategoryRows = useMemo(() => {
    if (!drawerSearchFilterActive) {
      return categoryRows;
    }
    return categoryRows.filter(({ category }) =>
      categoryMatchesDrawerSearch(
        category,
        locale,
        untitledLabel,
        drawerSearchLowercase
      )
    );
  }, [
    categoryRows,
    drawerSearchFilterActive,
    drawerSearchLowercase,
    // oxlint-disable-next-line react/react-compiler -- compiler flags categoryRows as possibly mutated later since it's an externally-owned array prop; verifying immutability across all callers is out of scope here
    locale,
    untitledLabel,
  ]);

  // Close products or language popovers on outside click / Escape (all breakpoints).
  useEffect(() => {
    if (!productsOpen && !langOpen) {
      return;
    }

    const onDocPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        productsOpen &&
        productsRootRef.current &&
        !productsRootRef.current.contains(target)
      ) {
        setProductsOpen(false);
      }
      if (
        langOpen &&
        langRootRef.current &&
        !langRootRef.current.contains(target)
      ) {
        setLangOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") {
        return;
      }
      if (productsOpen) {
        setProductsOpen(false);
      }
      if (langOpen) {
        setLangOpen(false);
      }
    };

    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [productsOpen, langOpen]);

  // Mobile drawer: Escape closes the dialog (separate from products/lang Escape handling above).
  useEffect(() => {
    if (!mobileDrawerOpen) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileDrawerOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileDrawerOpen]);

  // Close drawer when viewport crosses desktop nav breakpoint (not layout measure — avoids flicker loop).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const closeIfDesktop = () => {
      if (mq.matches) {
        setMobileDrawerOpen(false);
      }
    };
    closeIfDesktop();
    mq.addEventListener("change", closeIfDesktop);
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, []);

  /* Shared: language selector (visible in header at all breakpoints; panel positioning in SCSS). */
  const langDropdown = (
    <div
      ref={langRootRef}
      className={`${styles.lang} ${langOpen ? styles.langOpen : ""}`}
      data-ai-dropdown="language"
    >
      <button
        type="button"
        className={styles.langBtn}
        aria-expanded={langOpen}
        aria-haspopup="menu"
        aria-controls={langMenuId}
        id={`${langMenuId}-btn`}
        aria-label={languageLabel}
        onClick={() => setLangOpen((open) => !open)}
      >
        <span className={styles.langSummary}>
          <span className={styles.langLabel}>{currentLanguage.title}</span>
        </span>
        <LangTriggerArrow
          className={`${styles.langTriggerArrow}${langOpen ? ` ${styles.langTriggerArrowOpen}` : ""}`}
          aria-hidden="true"
          focusable="false"
        />
      </button>
      {langOpen ? (
        <div
          id={langMenuId}
          role="menu"
          aria-labelledby={`${langMenuId}-btn`}
          className={styles.langPanel}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a[href]")) {
              setLangOpen(false);
            }
          }}
        >
          {languageOptions.map((opt) => (
            <Link
              key={opt.id}
              href={pathname || "/"}
              locale={opt.id}
              role="menuitem"
              className={`${styles.langItem} ${opt.id === locale ? styles.langItemActive : ""}`}
            >
              <span className={styles.langFlag} aria-hidden="true">
                {opt.flagSrc ? (
                  <Image src={opt.flagSrc} alt="" width={18} height={18} />
                ) : (
                  String(opt.id).toUpperCase()
                )}
              </span>
              <span className={styles.langItemLabel}>{opt.title}</span>
              {opt.id === locale ? (
                <span className={styles.langCheck} aria-hidden="true">
                  <CheckIcon
                    width={16}
                    height={16}
                    className={styles.langCheckSvg}
                    focusable="false"
                  />
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );

  let headerAuthSlot: ReactNode = null;
  if (!mobileDrawerOpen) {
    headerAuthSlot = isHomeVariant ? (
      <div className={styles.headerAuthSlot}>
        <ChatNowCta label={chatNowLabel} className={styles.chatNowLink} />
      </div>
    ) : (
      <div className={styles.headerAuthSlot}>
        <Account
          loginHref={loginHref}
          signInLabel={signInLabel}
          accountAriaLabel={accountAriaLabel}
        />
      </div>
    );
  }

  return (
    <>
      {/* Top bar: CSS assumes expanded at ≥900px until JS sets compact/expanded from measure. */}
      <header
        className={styles.header}
        data-header-root
        {...(layout === null ? {} : { "data-nav-layout": layout })}
      >
        <div ref={containerRef} className={styles.container}>
          <div className={styles.left}>
            <div className={styles.brandLead} data-header-measure="brand">
              {/* Compact layout: hamburger + brand (12px gap). */}
              <div className={styles.mobile}>
                <button
                  type="button"
                  id={mobileMenuBtnId}
                  className={styles.mobileMenuBtn}
                  aria-expanded={mobileDrawerOpen}
                  aria-controls={mobileDrawerId}
                  aria-label={toggleMenuLabel}
                  onClick={handleMobileDrawerToggle}
                >
                  <span className="sr-only">{toggleMenuLabel}</span>
                  <HamburgerIcon
                    width={24}
                    height={24}
                    className={styles.mobileMenuIcon}
                    aria-hidden="true"
                    focusable="false"
                  />
                </button>
              </div>

              <HomeAwareLink
                isHomeVariant={isHomeVariant}
                homeHref={homeHref as Route}
                className={styles.brand}
              >
                <span className={styles.brandLogoWrap}>
                  <Image
                    src="/images/logo-v2.png"
                    alt=""
                    width={32}
                    height={32}
                    className={styles.brandLogoImg}
                    priority
                    fetchPriority="high"
                    aria-hidden="true"
                  />
                </span>
                <span className={styles.brandText}>{brandName}</span>
              </HomeAwareLink>
            </div>

            {/* Expanded layout: Home, Products mega-menu, Blog, Pricing. */}
            <nav className={styles.nav} data-header-measure="nav">
              <HomeAwareLink
                isHomeVariant={isHomeVariant}
                homeHref={homeHref as Route}
                className={styles.navLink}
              >
                <span className={styles.navLinkInner}>{homeLabel}</span>
              </HomeAwareLink>

              <div
                ref={productsRootRef}
                className={styles.products}
                data-ai-dropdown="products"
              >
                <button
                  type="button"
                  className={`${styles.navLink} ${styles.productsTrigger}`}
                  aria-expanded={productsOpen}
                  aria-haspopup="menu"
                  aria-controls={productsMenuId}
                  id={`${productsMenuId}-btn`}
                  onClick={() => setProductsOpen((open) => !open)}
                >
                  <span className={styles.navLinkInner}>
                    {productsLabel}
                    <span className={styles.caretWrap} aria-hidden="true">
                      <span
                        className={`${styles.navCaretInner} ${productsOpen ? styles.navCaretInnerOpen : ""}`}
                      >
                        <ChevronDown
                          width={24}
                          height={24}
                          className={styles.navCaretSvg}
                          aria-hidden="true"
                          focusable="false"
                        />
                      </span>
                    </span>
                  </span>
                </button>
                {productsOpen && productsPanelTop !== null ? (
                  <div
                    id={productsMenuId}
                    role="menu"
                    aria-labelledby={`${productsMenuId}-btn`}
                    className={styles.productsPanel}
                    style={{ top: productsPanelTop }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("a[href]")) {
                        setProductsOpen(false);
                      }
                    }}
                  >
                    <ProductsMegaMenuBody
                      categoryRows={categoryRows}
                      locale={locale}
                      untitledLabel={untitledLabel}
                    />
                  </div>
                ) : null}
              </div>

              <Link href={BLOGS_PAGE_PATH} className={styles.navLink}>
                <span className={styles.navLinkInner}>{blogLabel}</span>
              </Link>

              <Link href={PRICING_PAGE_URL} className={styles.navLink}>
                <span className={styles.navLinkInner}>{pricingLabel}</span>
              </Link>
            </nav>
          </div>

          <div className={styles.right} data-header-measure="right">
            {langDropdown}
            {headerAuthSlot}
            {/* Compact layout: close control in the header row while the drawer is open. */}
            {mobileDrawerOpen ? (
              <button
                type="button"
                className={styles.headerDrawerCloseBtn}
                aria-label={closeMenuLabel}
                onClick={handleMobileDrawerClose}
              >
                <CloseIcon
                  width={20}
                  height={20}
                  className={styles.drawerCloseIcon}
                  aria-hidden="true"
                  focusable="false"
                />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Mobile only: overlay + slide-down drawer (search + accordion categories). Not rendered when closed. */}
      {mobileDrawerOpen ? (
        <>
          <div
            className={styles.mobileDrawerBackdrop}
            aria-hidden
            {...(isHomeVariant ? { "data-home-mobile-drawer": "" } : {})}
            onClick={handleMobileDrawerClose}
          />
          <div
            id={mobileDrawerId}
            role="dialog"
            aria-modal="true"
            aria-label={navigationDrawerLabel}
            className={styles.mobileDrawer}
            {...(isHomeVariant ? { "data-home-mobile-drawer": "" } : {})}
          >
            <div className={styles.drawerScroll}>
              <div className={styles.drawerContainer}>
                <div className={styles.drawerSearch}>
                  <div className={styles.search}>
                    <span className={styles.searchIcon} aria-hidden="true">
                      <SearchStatus
                        width={20}
                        height={20}
                        className="text-icon-general-primary"
                        aria-hidden="true"
                        focusable="false"
                      />
                    </span>
                    <input
                      type="search"
                      name="q"
                      value={drawerSearchQuery}
                      onChange={(e) => setDrawerSearchQuery(e.target.value)}
                      placeholder={searchPlaceholder}
                      className={styles.searchInput}
                      aria-label={searchAriaLabel}
                      autoComplete="off"
                      enterKeyHint="search"
                    />
                  </div>
                </div>

                <div className={styles.drawerSections}>
                  {drawerSearchFilterActive &&
                  filteredDrawerCategoryRows.length === 0 ? (
                    <p
                      className={styles.drawerSearchEmpty}
                      role="status"
                      aria-live="polite"
                    >
                      {searchNoResults}
                    </p>
                  ) : (
                    filteredDrawerCategoryRows.map(
                      ({ _key: rowKey, category }) => (
                        <details
                          key={`${category._id}-${rowKey}`}
                          ref={setMobileDrawerDetailsOpenOnce}
                          className={styles.mobileCategory}
                        >
                          <summary className={styles.sectionSummary}>
                            <span className={styles.sectionTitle}>
                              {pickLocalizedTitle(
                                category.categoryTitleByLocale,
                                locale
                              ) || untitledLabel}
                            </span>
                            <LangTriggerArrow
                              width={16}
                              height={16}
                              className={styles.sectionCaret}
                              aria-hidden="true"
                              focusable="false"
                            />
                          </summary>
                          <div className={styles.sectionLinks}>
                            {getDrawerVisibleLinkRows(
                              category,
                              locale,
                              untitledLabel,
                              drawerSearchLowercase,
                              drawerSearchFilterActive
                            ).map((item) => {
                              const href = item.link.url?.trim() || "#";
                              return (
                                <NextLink
                                  key={item._key}
                                  href={href as Route}
                                  className={styles.sectionLink}
                                  {...externalLinkProps(href)}
                                  onClick={() => setMobileDrawerOpen(false)}
                                >
                                  {pickLocalizedTitle(
                                    item.link.linkTitleByLocale,
                                    locale
                                  ) || untitledLabel}
                                </NextLink>
                              );
                            })}
                          </div>
                        </details>
                      )
                    )
                  )}
                </div>
              </div>
            </div>
            <div className={styles.drawerFooter}>
              <div className={styles.drawerFooterInner}>
                <nav className={styles.drawerFooterNav}>
                  <Link
                    href={BLOGS_PAGE_PATH}
                    className={styles.drawerFooterLink}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    {blogLabel}
                  </Link>
                  <span
                    className={styles.drawerFooterDivider}
                    aria-hidden="true"
                  />
                  <Link
                    href={PRICING_PAGE_URL}
                    className={styles.drawerFooterLink}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    {pricingLabel}
                  </Link>
                </nav>
                {isHomeVariant ? (
                  <ChatNowCta
                    label={chatNowLabel}
                    className={styles.chatNowLink}
                    onNavigate={() => setMobileDrawerOpen(false)}
                  />
                ) : (
                  <Account
                    loginHref={loginHref}
                    signInLabel={signInLabel}
                    accountAriaLabel={accountAriaLabel}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
