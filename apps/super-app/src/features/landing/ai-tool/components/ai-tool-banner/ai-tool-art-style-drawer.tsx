"use client";

import Image from "next/image";
import { useEffect } from "react";

import styles from "./styles.module.css";

export interface AIToolArtStyleDrawerItem {
  id: string;
  title: string;
  description: string;
  image: string;
  value: string;
  isNew?: boolean;
}

export interface AIToolArtStyleDrawerProps {
  toggleId: string;
  search: string;
  setSearch: (value: string) => void;
  items: AIToolArtStyleDrawerItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  /** When false, preview area shows a skeleton instead of loading remote thumbnails. */
  showThumbSkeleton?: boolean;
}

export function AIToolArtStyleDrawer({
  toggleId,
  search,
  setSearch,
  items,
  selectedValue,
  onSelect,
  onClose,
  showThumbSkeleton = false,
}: AIToolArtStyleDrawerProps) {
  useEffect(() => {
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="ai-tool-style-modal-root">
      <div
        className={styles.styleModal}
        data-ai-toggle-content={toggleId}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className={styles.styleModalOverlay}
          aria-label="Close"
          onClick={onClose}
        />

        <div className={styles.styleModalPanel} role="document">
          <div className={styles.styleModalHeader}>
            <div className={styles.styleModalTitle}>Choose Style</div>
            <button
              type="button"
              className={styles.styleModalClose}
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className={styles.styleModalSearchWrap}>
            <input
              className={styles.styleModalSearch}
              type="search"
              placeholder="Type your search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  onClose();
                }
              }}
            />
          </div>

          {items.length === 0 ? (
            <div className={styles.styleModalEmpty}>No styles found.</div>
          ) : (
            <div className={styles.styleModalGrid}>
              {items.map((opt) => {
                const isSelected = opt.value === selectedValue;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.styleModalCard} ${isSelected ? styles.styleModalCardSelected : ""}`}
                    onClick={() => onSelect(opt.value)}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.styleModalPreview}>
                      {showThumbSkeleton ? (
                        <span
                          className={styles.styleModalThumbSkeleton}
                          aria-hidden
                        />
                      ) : (
                        <Image
                          src={opt.image}
                          alt={opt.title}
                          className={styles.styleModalThumbImg}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          unoptimized
                        />
                      )}

                      {!showThumbSkeleton && opt.isNew ? (
                        <span className={styles.styleNewBadge} aria-hidden>
                          <span className={styles.styleNewBadgeText}>New</span>
                        </span>
                      ) : null}

                      <span className={styles.styleModalCardMetaWrapper}>
                        <span className={styles.styleModalCardMeta}>
                          <span className={styles.styleModalCardTitle}>
                            {opt.title}
                          </span>
                          {opt.description ? (
                            <span className={styles.styleModalCardDesc}>
                              {opt.description}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
