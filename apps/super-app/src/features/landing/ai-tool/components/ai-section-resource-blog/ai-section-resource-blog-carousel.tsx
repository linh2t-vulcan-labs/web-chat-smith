"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import ArrowRightIcon from "@/public/icons/landing-page/arrow-right.svg?react";

import styles from "./styles.module.css";

const DESKTOP_VISIBLE_COUNT = 3;
const TABLET_VISIBLE_COUNT = 2;
const MOBILE_VISIBLE_COUNT = 1;

export interface BlogCarouselItem {
  id: string;
  href: string;
  title: string;
  imageUrl: string;
  imageLqip?: string;
  imageAlt: string;
  categoryLabel: string;
  authorName: string;
  authorSrc: string;
  published: string;
}

interface Props {
  items: BlogCarouselItem[];
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

export function AISectionResourceBlogCarousel({
  items,
  listAria,
  prevAriaLabel,
  nextAriaLabel,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(DESKTOP_VISIBLE_COUNT);

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

  const onPrev = useCallback(
    () => scrollToPage(pageIndex - 1),
    [pageIndex, scrollToPage]
  );
  const onNext = useCallback(
    () => scrollToPage(pageIndex + 1),
    [pageIndex, scrollToPage]
  );

  return (
    <div className={styles.carouselBlock}>
      <div ref={viewportRef} className={styles.cardsViewport}>
        <ul ref={listRef} className={styles.cards} aria-label={listAria}>
          {items.map((item, index) => (
            <li
              key={item.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={styles.cardItem}
            >
              <Link href={item.href as Route} className={styles.cardLink}>
                <article className={styles.card}>
                  <div className={styles.media}>
                    <Image
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      fill
                      className={styles.image}
                      sizes="(min-width: 1024px) calc((min(1163px, 100vw - 112px) - 64px) / 3), (min-width: 768px) calc(50vw - 32px), 76vw"
                      placeholder={item.imageLqip ? "blur" : "empty"}
                      blurDataURL={item.imageLqip}
                    />
                  </div>
                  <div className={styles.body}>
                    <span className={styles.badge}>{item.categoryLabel}</span>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <div className={styles.metaRow}>
                      <Image
                        src={item.authorSrc}
                        alt={item.authorName}
                        width={32}
                        height={32}
                        className={styles.avatar}
                      />
                      <div className={styles.metaText}>
                        <span className={styles.authorName}>
                          {item.authorName}
                        </span>
                        <span className={styles.published}>
                          {item.published}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
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
