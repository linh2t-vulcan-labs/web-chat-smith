"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import type { SVGProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { DEFAULT_LIST_STYLE_OPTIONS } from "@/components/conversation-input/features/image-creation/consts";
import type { TRemoteConfigListStyleOptions } from "@/components/conversation-input/features/image-creation/types";
import { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import { EAIValueModel } from "@/core/models/model";
import type { TAIArtOptions } from "@/core/ports/chat-features/image-creation";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import type { TFeaturePageSection } from "@/libs/tracking-event/types";
import { safeJsonParse } from "@/utils/commons/helpers";

import { useFeaturePageTracking } from "../../tracking/use-feature-page-tracking";
import type { AIToolArtStyleDrawerItem } from "./ai-tool-art-style-drawer";
import { AIToolArtStyleDrawer } from "./ai-tool-art-style-drawer";

import styles from "./styles.module.css";

interface AIToolArtStyleChooserProps {
  /** Pre-rendered on the server — same defaults as Firebase defaultConfig for SEO */
  initialOptions: TAIArtOptions[];
  modelValue?: EAIValueModel;
  /** Controlled selection (optional). When set, `onSelectedValueChange` should update parent state. */
  selectedValue?: EAIART_STYLE;
  onSelectedValueChange?: (value: EAIART_STYLE) => void;
  /** When set, fires `featurepage_select_style` on user style selection. */
  trackingSection?: TFeaturePageSection;
}

function filterEnabled(opts: TAIArtOptions[]): TAIArtOptions[] {
  return opts.filter((o) => o.isEnabled !== false);
}

export function AIToolArtStyleChooser({
  initialOptions,
  modelValue = EAIValueModel.Banana,
  selectedValue: controlledSelected,
  onSelectedValueChange,
  trackingSection,
}: AIToolArtStyleChooserProps) {
  const t = useTranslations("aiTool.banner.referenceStyle");
  const { isReady, getValueSyncRemoteConfig } = useRemoteConfigContext();
  const { trackSelectStyle } = useFeaturePageTracking();
  const listRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const options = useMemo<TAIArtOptions[]>(() => {
    const fallback = filterEnabled(initialOptions);
    if (!isReady) {
      return fallback;
    }

    const raw = getValueSyncRemoteConfig(REMOTE_CONFIG_KEY.LIST_STYLE_OPTIONS);
    const parsed = safeJsonParse<TRemoteConfigListStyleOptions>(raw);
    const fromRemote = parsed?.styles?.[modelValue];

    const nextRaw =
      fromRemote && fromRemote.length > 0
        ? fromRemote
        : (DEFAULT_LIST_STYLE_OPTIONS.styles[modelValue] ?? initialOptions);

    const next = filterEnabled(nextRaw);
    return next.length > 0 ? next : fallback;
  }, [isReady, getValueSyncRemoteConfig, initialOptions, modelValue]);

  const isControlled = controlledSelected !== undefined;
  const [uncontrolledSelected, setUncontrolledSelected] =
    useState<EAIART_STYLE>(
      () => filterEnabled(initialOptions)[0]?.value ?? EAIART_STYLE.NONE
    );
  const selectedValue = controlledSelected ?? uncontrolledSelected;

  const applySelectedValue = useCallback(
    (next: EAIART_STYLE) => {
      onSelectedValueChange?.(next);
      if (!isControlled) {
        setUncontrolledSelected(next);
      }
    },
    [isControlled, onSelectedValueChange]
  );
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- classic client-mounted flag set once on mount to gate SSR-unsafe rendering, not a render derivation
    setMounted(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSearch("");
  }, []);

  // Keep selectedValue valid when remote config replaces the option list.
  useEffect(() => {
    const correct = (prev: EAIART_STYLE) => {
      if (prev === EAIART_STYLE.NONE) {
        return prev;
      }
      if (options.some((o) => o.value === prev)) {
        return prev;
      }
      return options[0]?.value ?? EAIART_STYLE.NONE;
    };
    const next = correct(selectedValue);
    if (next !== selectedValue) {
      // oxlint-disable-next-line react/react-compiler -- corrects selectedValue when remote config replaces the option list, external-data-driven resync, not a render derivation
      applySelectedValue(next);
    }
  }, [applySelectedValue, options, selectedValue]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter((o) => {
      const title = o.title?.toLowerCase() ?? "";
      const desc = o.description?.toLowerCase() ?? "";
      return title.includes(q) || desc.includes(q);
    });
  }, [options, search]);

  const toggleId = "ai-style-grid";

  function toggleSelect(value: EAIART_STYLE) {
    // Do not auto-toggle a selected style back to NONE on repeated clicks.
    // If the user wants to clear the selection, they should explicitly choose `NONE`.
    const next = value === EAIART_STYLE.NONE ? EAIART_STYLE.NONE : value;
    if (next === selectedValue) {
      return;
    }
    applySelectedValue(next);
    if (trackingSection) {
      trackSelectStyle(trackingSection);
    }
  }

  function selectFromModal(value: EAIART_STYLE) {
    toggleSelect(value);
    closeDrawer();
  }

  useEffect(() => {
    if (selectedValue === EAIART_STYLE.NONE) {
      return;
    }
    const el = listRefs.current[String(selectedValue)];
    if (!el) {
      return;
    }
    el.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedValue]);

  const drawerItems: AIToolArtStyleDrawerItem[] = useMemo(
    () =>
      filteredOptions.map((o) => ({
        description: o.description,
        id: o.id,
        image: o.image,
        isNew: o.isNew,
        title: o.title,
        value: String(o.value),
      })),
    [filteredOptions]
  );

  return (
    <div className={styles.artStyleRoot} aria-busy={!isReady}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardHeaderLabel}>{t("label")}</span>
          <span className={styles.cardHeaderLabelHint}> {t("optional")}</span>
        </div>
        <button
          type="button"
          className={styles.iconGhost}
          aria-label="Open style grid"
          data-ai-toggle={toggleId}
          aria-expanded={isDrawerOpen}
          onClick={() => {
            setIsDrawerOpen(true);
          }}
        >
          <span className={styles.gridIconSpan} aria-hidden>
            <GridIcon className={styles.icon} />
          </span>
        </button>
      </div>

      <div className={styles.stylesStrip}>
        <input
          type="hidden"
          name="art_style"
          value={selectedValue}
          form="ai-tool-banner-prompt"
        />

        <ul className={styles.stylesListMobile} aria-label="Style presets">
          {options.map((opt) => (
            <li
              key={opt.id}
              ref={(el) => {
                listRefs.current[String(opt.value)] = el;
              }}
              className={styles.styleItem}
            >
              <StyleOptionButton
                option={opt}
                isSelected={opt.value === selectedValue}
                showThumbSkeleton={!isReady}
                onSelect={() => toggleSelect(opt.value)}
              />
            </li>
          ))}
        </ul>
        <ul className={styles.stylesListDesktop} aria-label="Style presets">
          {options.map((opt) => (
            <li
              key={opt.id}
              ref={(el) => {
                listRefs.current[String(opt.value)] = el;
              }}
              className={styles.styleItem}
            >
              <StyleOptionButton
                option={opt}
                isSelected={opt.value === selectedValue}
                showThumbSkeleton={!isReady}
                onSelect={() => toggleSelect(opt.value)}
              />
            </li>
          ))}
        </ul>
      </div>
      {/* Drawer rendered at document.body level (outside banner scope) */}
      {mounted && isDrawerOpen
        ? createPortal(
            <AIToolArtStyleDrawer
              toggleId={toggleId}
              search={search}
              setSearch={setSearch}
              items={drawerItems}
              selectedValue={String(selectedValue)}
              showThumbSkeleton={!isReady}
              onSelect={(v) => selectFromModal(v as EAIART_STYLE)}
              onClose={closeDrawer}
            />,
            document.body
          )
        : null}
    </div>
  );
}

function StyleOptionButton({
  option,
  isSelected,
  showThumbSkeleton,
  onSelect,
}: {
  option: TAIArtOptions;
  isSelected: boolean;
  /** Shimmer placeholder until Firebase Remote Config style list is ready */
  showThumbSkeleton?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.styleBtn} ${isSelected ? styles.styleBtnSelected : ""}`}
      aria-pressed={isSelected}
      aria-busy={showThumbSkeleton}
      aria-label={`${option.title}${isSelected ? ", selected" : ""}`}
      onClick={onSelect}
    >
      <span className={styles.styleThumb}>
        {showThumbSkeleton ? (
          <span className={styles.styleThumbSkeleton} aria-hidden />
        ) : (
          <>
            <Image
              src={option.image}
              alt={option.title}
              className={styles.styleThumbImg}
              width={56}
              height={56}
              loading="lazy"
              sizes="56px"
              unoptimized
            />
            {option.isNew ? (
              <span className={styles.styleNewBadge} aria-hidden>
                <span className={styles.styleNewBadgeText}>New</span>
              </span>
            ) : null}
          </>
        )}
      </span>
      <span className={styles.styleLabel}>
        <span className={styles.styleLabelText} data-text={option.title}>
          {option.title}
        </span>
      </span>
    </button>
  );
}

function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M3 3H8V8H3V3ZM12 3H17V8H12V3ZM3 12H8V17H3V12ZM12 12H17V17H12V12Z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  );
}
