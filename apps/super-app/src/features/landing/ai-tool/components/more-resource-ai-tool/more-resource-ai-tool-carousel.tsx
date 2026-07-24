"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Link } from "@/i18n/navigation";
import ArrowRightIcon from "@/public/icons/landing-page/arrow-right.svg?react";

import styles from "./styles.module.css";

/** Fallback before measure; card is always 1:1 via CSS, not via `sizes`. */
const MORE_RESOURCE_CARD_SIZE_FALLBACK_PX = 380;

const DESKTOP_VISIBLE_COUNT = 4;
const TABLET_VISIBLE_COUNT = 3;
const MOBILE_VISIBLE_COUNT = 2;

export interface MoreResourceCardItem {
  key: string;
  title: string;
  description: string;
  imageUrl: string | null;
  href: string;
}

export interface MoreResourceAIToolCarouselProps {
  items: MoreResourceCardItem[];
  listAria: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
}

function getVisibleCount(): number {
  if (typeof window === "undefined") {
    return DESKTOP_VISIBLE_COUNT;
  }
  const width = window.innerWidth;
  if (width < 768) {
    return MOBILE_VISIBLE_COUNT;
  }
  if (width < 1024) {
    return TABLET_VISIBLE_COUNT;
  }
  return DESKTOP_VISIBLE_COUNT;
}

function getMaxPageIndex(itemCount: number, visibleCount: number): number {
  if (itemCount <= visibleCount) {
    return 0;
  }
  return Math.ceil(itemCount / visibleCount) - 1;
}

export function MoreResourceAIToolCarousel({
  items,
  listAria,
  prevAriaLabel,
  nextAriaLabel,
}: MoreResourceAIToolCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(DESKTOP_VISIBLE_COUNT);
  const [cardSizePx, setCardSizePx] = useState(
    MORE_RESOURCE_CARD_SIZE_FALLBACK_PX
  );

  useLayoutEffect(() => {
    const [card] = cardRefs.current;
    if (!card) {
      return;
    }

    const syncCardSize = () => {
      const width = Math.ceil(card.getBoundingClientRect().width);
      if (width > 0) {
        setCardSizePx(width);
      }
    };

    syncCardSize();
    const observer = new ResizeObserver(syncCardSize);
    observer.observe(card);
    return () => observer.disconnect();
  }, [items.length, visibleCount]);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, items.length);
    // oxlint-disable-next-line react/react-compiler -- resets carousel page to 0 whenever the items list changes, syncing with an external ref array trim above; not a render derivation
    setPageIndex(0);
  }, [items]);

  useEffect(() => {
    const syncVisibleCount = () => {
      const nextVisible = getVisibleCount();
      setVisibleCount(nextVisible);
      setPageIndex((current) =>
        Math.min(current, getMaxPageIndex(items.length, nextVisible))
      );
    };

    syncVisibleCount();
    window.addEventListener("resize", syncVisibleCount);
    return () => window.removeEventListener("resize", syncVisibleCount);
  }, [items.length]);

  const maxPageIndex = getMaxPageIndex(items.length, visibleCount);
  const showNav = items.length > visibleCount;

  const scrollToPage = useCallback(
    (nextPage: number) => {
      const clamped = Math.max(0, Math.min(nextPage, maxPageIndex));
      const targetIndex = clamped * visibleCount;
      const target = cardRefs.current[targetIndex];
      const viewport = viewportRef.current;
      const list = listRef.current;

      if (target && viewport && list) {
        const left = target.offsetLeft - list.offsetLeft;
        viewport.scrollTo({ behavior: "smooth", left });
      } else if (viewport) {
        viewport.scrollTo({ behavior: "smooth", left: 0 });
      }

      setPageIndex(clamped);
    },
    [maxPageIndex, visibleCount]
  );

  const onPrev = useCallback(() => {
    scrollToPage(pageIndex - 1);
  }, [pageIndex, scrollToPage]);

  const onNext = useCallback(() => {
    scrollToPage(pageIndex + 1);
  }, [pageIndex, scrollToPage]);

  return (
    <div className={styles.carouselBlock}>
      <div ref={viewportRef} className={styles.cardsViewport}>
        <ul ref={listRef} className={styles.cards} aria-label={listAria}>
          {items.map((it, index) => (
            <li
              key={it.key}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={styles.card}
              data-more-resource-card
            >
              <Link className={styles.cardLink} href={it.href}>
                <div className={styles.cardMedia} aria-hidden>
                  {it.imageUrl ? (
                    <Image
                      className={styles.icon}
                      src={it.imageUrl}
                      alt={it.title}
                      fill
                      sizes={`${cardSizePx}px`}
                      quality={100}
                    />
                  ) : (
                    <div className={styles.iconFallback} aria-hidden />
                  )}
                  <div className={styles.cardOverlay}>
                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{it.title}</h3>
                      {it.description?.trim() ? (
                        <p className={styles.cardDescription}>
                          {it.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {showNav ? (
        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={prevAriaLabel}
            disabled={pageIndex <= 0}
            onClick={onPrev}
          >
            <ArrowRightIcon
              className={`${styles.navIcon} ${styles.navIconBack}`}
              aria-hidden
            />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={nextAriaLabel}
            disabled={pageIndex >= maxPageIndex}
            onClick={onNext}
          >
            <ArrowRightIcon className={styles.navIcon} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
