"use client";

import Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";

import { resolveCssTokenColor } from "@/features/suite/utils/resolve-css-token-color";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";

import {
  CELL_H,
  CELL_RATIO_SIDE_MAX,
  CELL_W,
  EXPORT_JPEG_QUALITY,
  FIT_ANIMATION_DURATION,
  FIT_VIEWPORT_MARGIN,
  GAP,
  GENERATION_FOCUS_VIEWPORT_MARGIN,
  MAX_SCALE,
  MAX_STUDIO_ANNOTATIONS,
  MIN_SCALE,
  STUDIO_MODE,
  STUDIO_TOKEN_COLORS,
  TEMPLATE_INITIAL_ZOOM_SCALE,
  THUMBNAIL_SIZE,
  ZOOM_ANIMATION_DURATION,
  ZOOM_EPSILON,
} from "./constants";
import type { StudioMode } from "./constants";
import type {
  AnnotationRect,
  AttachmentPill,
  StudioAssetType,
  StudioCard,
} from "./types";

// Cell size of a card in canvas units. Cards are ratio-sized on image load (cellW/cellH);
// loading skeletons and failed cards fall back to the square CELL_W × CELL_H.
export function getCardSize(card: StudioCard): { w: number; h: number } {
  return { h: card.cellH ?? CELL_H, w: card.cellW ?? CELL_W };
}

export function getCardPositions(
  cards: StudioCard[]
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const groups: {
    generationId: string;
    assetType: StudioAssetType;
    cards: StudioCard[];
  }[] = [];

  for (const card of cards) {
    const group = groups.find(
      (item) => item.generationId === card.generationId
    );
    if (group) {
      group.cards.push(card);
      continue;
    }
    groups.push({
      assetType: card.assetType,
      cards: [card],
      generationId: card.generationId,
    });
  }

  // Cards keep their image's aspect ratio, so positions accumulate per-card sizes instead of a
  // fixed grid step. Logo groups are a horizontal row (fixed height, variable widths); poster
  // groups a vertical column (fixed width, variable heights).
  let baseY = 0;
  for (const group of groups) {
    let offset = 0;
    let groupHeight = 0;
    for (const card of group.cards) {
      const { w, h } = getCardSize(card);
      if (group.assetType === "poster") {
        positions.set(card.id, { x: 0, y: baseY + offset });
        offset += h + GAP;
        groupHeight += h + GAP;
      } else {
        positions.set(card.id, { x: offset, y: baseY });
        offset += w + GAP;
        groupHeight = Math.max(groupHeight, h + GAP);
      }
    }
    baseY += groupHeight;
  }

  return positions;
}

// function getCardPosition(
//   cards: StudioCard[],
//   cardId: string
// ): { x: number; y: number } {
//   return getCardPositions(cards).get(cardId) ?? { x: 0, y: 0 };
// }

function getCardsBounds(
  cards: StudioCard[]
): { maxX: number; maxY: number } | null {
  if (cards.length === 0) {
    return null;
  }

  const positions = getCardPositions(cards);
  let maxX = 0;
  let maxY = 0;
  for (const card of cards) {
    const pos = positions.get(card.id);
    if (!pos) {
      continue;
    }
    const { w, h } = getCardSize(card);
    maxX = Math.max(maxX, pos.x + w);
    maxY = Math.max(maxY, pos.y + h);
  }

  return { maxX, maxY };
}

function getGenerationBounds(
  cards: StudioCard[],
  generationId: string
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const positions = getCardPositions(cards);
  const generationCards = cards.filter(
    (card) => card.generationId === generationId
  );
  if (generationCards.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const card of generationCards) {
    const pos = positions.get(card.id);
    if (!pos) {
      continue;
    }
    const { w, h } = getCardSize(card);
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + w);
    maxY = Math.max(maxY, pos.y + h);
  }

  return { maxX, maxY, minX, minY };
}

function extractThumb(
  card: StudioCard,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): string {
  const size = THUMBNAIL_SIZE;
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext("2d");
  if (!ctx) {
    return "";
  }
  ctx.fillStyle = resolveCssTokenColor(
    STUDIO_TOKEN_COLORS.thumbnailFallbackBackground.cssVar,
    STUDIO_TOKEN_COLORS.thumbnailFallbackBackground.fallback
  );
  ctx.fillRect(0, 0, size, size);
  if (card.img && card.imgRect) {
    const { ix, iy, iw, ih } = card.imgRect;
    const sx = ((rx - ix) / iw) * card.img.naturalWidth;
    const sy = ((ry - iy) / ih) * card.img.naturalHeight;
    const sw = (rw / iw) * card.img.naturalWidth;
    const sh = (rh / ih) * card.img.naturalHeight;
    try {
      ctx.drawImage(card.img, sx, sy, sw, sh, 0, 0, size, size);
    } catch {
      // Ignore drawImage errors from transient crop/origin edge cases.
    }
  }
  return cv.toDataURL();
}

// Full-resolution crop of the marked region, sampled from the ORIGINAL image at its native pixel
// size with aspect ratio preserved (NO squish). This is what gets uploaded as the display image —
// the 56×56 `extractThumb` is kept only for the small in-UI attachment pill.
export function extractMaskedCrop(
  card: StudioCard,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): string {
  if (!card.img || !card.imgRect) {
    return "";
  }
  const { ix, iy, iw, ih } = card.imgRect;
  const { naturalWidth, naturalHeight } = card.img;
  // Map the canvas-space rect into the original image's natural pixels.
  const sx = ((rx - ix) / iw) * naturalWidth;
  const sy = ((ry - iy) / ih) * naturalHeight;
  const sw = (rw / iw) * naturalWidth;
  const sh = (rh / ih) * naturalHeight;
  // Clamp to the image bounds so integer rounding never samples outside it.
  const cropX = Math.max(0, Math.round(sx));
  const cropY = Math.max(0, Math.round(sy));
  const cropW = Math.min(naturalWidth - cropX, Math.round(sw));
  const cropH = Math.min(naturalHeight - cropY, Math.round(sh));
  if (cropW <= 0 || cropH <= 0) {
    return "";
  }
  const cv = document.createElement("canvas");
  cv.width = cropW;
  cv.height = cropH;
  const ctx = cv.getContext("2d");
  if (!ctx) {
    return "";
  }
  try {
    // Destination size equals the source crop size → 1:1, no scaling/distortion.
    ctx.drawImage(card.img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  } catch {
    // Ignore drawImage errors from transient crop/origin edge cases.
    return "";
  }
  return cv.toDataURL();
}

// function extractFullThumb(card: StudioCard): string {
//   const size = THUMBNAIL_SIZE;
//   const cv = document.createElement("canvas");
//   cv.width = size;
//   cv.height = size;
//   const ctx = cv.getContext("2d");
//   if (!ctx) {
//     return "";
//   }
//   ctx.fillStyle = resolveCssTokenColor(
//     STUDIO_TOKEN_COLORS.thumbnailFallbackBackground.cssVar,
//     STUDIO_TOKEN_COLORS.thumbnailFallbackBackground.fallback
//   );
//   ctx.fillRect(0, 0, size, size);
//   if (card.img) {
//     const sc = Math.min(
//       size / card.img.naturalWidth,
//       size / card.img.naturalHeight
//     );
//     const dw = card.img.naturalWidth * sc;
//     const dh = card.img.naturalHeight * sc;
//     try {
//       ctx.drawImage(card.img, (size - dw) / 2, (size - dh) / 2, dw, dh);
//     } catch {
//       // Ignore drawImage errors from transient origin edge cases.
//     }
//   }
//   return cv.toDataURL();
// }

function downloadCardImage(
  card: StudioCard,
  format: "png" | "jpg" | "svg"
): void {
  if (!card.img) {
    return;
  }
  const { img } = card;
  if (format === "svg") {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}"><image href="${img.src}" width="${img.naturalWidth}" height="${img.naturalHeight}"/></svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.svg";
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const cv = document.createElement("canvas");
  cv.width = img.naturalWidth;
  cv.height = img.naturalHeight;
  const ctx = cv.getContext("2d");
  if (!ctx) {
    return;
  }
  // if (format === "jpg") { // not needed yet
  //   ctx.fillStyle = STUDIO_COLORS.canvasExportJpgBackground;
  //   ctx.fillRect(0, 0, cv.width, cv.height);
  // }
  try {
    ctx.drawImage(img, 0, 0);
  } catch {
    return;
  }
  const a = document.createElement("a");
  a.href = cv.toDataURL(
    format === "jpg" ? "image/jpeg" : "image/png",
    EXPORT_JPEG_QUALITY
  );
  a.download = `image.${format}`;
  a.click();
}

export async function downloadCardImages(
  cards: StudioCard[],
  format: "png" | "jpg" | "svg"
): Promise<void> {
  if (cards.length === 0) {
    return;
  }
  if (cards.length === 1) {
    downloadCardImage(cards[0] as StudioCard, format);
    return;
  }
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (let i = 0; i < cards.length; i += 1) {
    const card = cards[i];
    if (!card?.img) {
      continue;
    }
    const { img } = card;
    if (format === "svg") {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.naturalWidth}" height="${img.naturalHeight}"><image href="${img.src}" width="${img.naturalWidth}" height="${img.naturalHeight}"/></svg>`;
      zip.file(`image-${i + 1}.svg`, svgContent);
      continue;
    }
    const cv = document.createElement("canvas");
    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    const ctx = cv.getContext("2d");
    if (!ctx) {
      continue;
    }
    // if (format === "jpg") {
    //   ctx.fillStyle = STUDIO_COLORS.canvasExportJpgBackground;
    //   ctx.fillRect(0, 0, cv.width, cv.height);
    // }
    try {
      ctx.drawImage(img, 0, 0);
    } catch {
      continue;
    }
    const mime = format === "jpg" ? "image/jpeg" : "image/png";
    const dataUrl = cv.toDataURL(mime, EXPORT_JPEG_QUALITY);
    const [, base64] = dataUrl.split(",");
    zip.file(`image-${i + 1}.${format}`, base64 as string, { base64: true });
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "images.zip";
  a.click();
  URL.revokeObjectURL(url);
}

function reindexAnnotationNumbers(cards: StudioCard[]) {
  const numberByAnnotationId = new Map<string, number>();
  const annotations = cards
    .flatMap((card) => card.annotations)
    .toSorted((a, b) => a.num - b.num);

  for (const [index, annotation] of annotations.entries()) {
    numberByAnnotationId.set(annotation.id, index + 1);
  }

  return {
    cards: cards.map((card) => ({
      ...card,
      annotations: card.annotations.map((annotation) => ({
        ...annotation,
        num: numberByAnnotationId.get(annotation.id) ?? annotation.num,
      })),
    })),
    count: annotations.length,
    numberByAnnotationId,
  };
}

function getNewImages(
  urls: string[],
  imageIds: string[] | undefined,
  addedUrlsRef: { current: Set<string> }
) {
  return urls
    .map((url, index) => ({ imageId: imageIds?.[index], url }))
    .filter((image) => !addedUrlsRef.current.has(image.url));
}

type PendingSkeleton = {
  genId: string;
  ids: string[];
  assetType: StudioAssetType;
} | null;

function resolveLoadImagesGenerationContext(
  options:
    | {
        generationId?: string;
        assetType?: StudioAssetType;
        noFocus?: boolean;
      }
    | undefined,
  pending: PendingSkeleton
) {
  const genId =
    options?.generationId ?? pending?.genId ?? generateRandomUUIDV4();
  const assetType = options?.assetType ?? pending?.assetType ?? "logo";
  const shouldUpdateLatestGenerationId = !pending && !options?.noFocus;

  return { assetType, genId, shouldUpdateLatestGenerationId };
}

function splitPendingSkeletonIds(pending: PendingSkeleton, count: number) {
  const pendingIds = pending?.ids ?? [];
  return {
    idsRemaining: pendingIds.slice(count),
    idsToUse: pendingIds.slice(0, count),
  };
}

// ─── useStudio ────────────────────────────────────────────
export function useStudio(getSuiteSidebarOffset?: () => number) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const getSuiteSidebarOffsetRef = useRef(getSuiteSidebarOffset);
  // oxlint-disable-next-line react/react-compiler -- ref is intentionally kept in sync with the latest getSuiteSidebarOffset callback during render to avoid stale closures in later ref reads
  getSuiteSidebarOffsetRef.current = getSuiteSidebarOffset;
  const [cards, setCards] = useState<StudioCard[]>([]);
  const cardsRef = useRef<StudioCard[]>([]);
  const [studioMode, setStudioModeState] = useState<StudioMode>(
    STUDIO_MODE.select
  );
  const studioModeRef = useRef<StudioMode>(STUDIO_MODE.select);
  const [spacePanning, setSpacePanning] = useState(false);
  const spaceKeyDownRef = useRef(false);
  const isDrawingRef = useRef(false);
  const [zoom, setZoom] = useState(100);
  const [attachments, setAttachments] = useState<AttachmentPill[]>([]);
  const attachmentsRef = useRef<AttachmentPill[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const selectedCardIdsRef = useRef<string[]>([]);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const imgAttachMapRef = useRef<Map<string, string>>(new Map());

  const loadingCountRef = useRef(0);
  const addedUrlsRef = useRef<Set<string>>(new Set());
  const pendingSkeletonRef = useRef<{
    genId: string;
    ids: string[];
    assetType: StudioAssetType;
  } | null>(null);
  const latestGenerationIdRef = useRef<string | null>(null);
  const rectCounterRef = useRef(0);
  const viewportTweenRef = useRef<Konva.Tween | null>(null);
  const didInitViewportRef = useRef(false);
  const suppressedFocusGenerationIdsRef = useRef<Set<string>>(new Set());
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const setCardsAndRef = useCallback(
    (updater: (cards: StudioCard[]) => StudioCard[]) => {
      const nextCards = updater(cardsRef.current);
      cardsRef.current = nextCards;
      setCards(nextCards);
    },
    []
  );

  const updatePopupPos = useCallback(() => {
    const ids = selectedCardIdsRef.current;
    if (ids.length === 0) {
      setPopupPos(null);
      return;
    }
    const container = canvasContainerRef.current;
    if (!container) {
      setPopupPos(null);
      return;
    }
    const boxes = ids
      .map((id) => {
        const card = cardsRef.current.find((c) => c.id === id);
        return card?.groupRef.current?.getClientRect() as
          | { x: number; y: number; width: number; height: number }
          | undefined;
      })
      .filter(
        (b): b is { x: number; y: number; width: number; height: number } => !!b
      );
    if (boxes.length === 0) {
      setPopupPos(null);
      return;
    }
    const minX = Math.min(...boxes.map((b) => b.x));
    const minY = Math.min(...boxes.map((b) => b.y));
    const maxX = Math.max(...boxes.map((b) => b.x + b.width));
    const bcr = container.getBoundingClientRect();
    setPopupPos({
      x: Math.round(bcr.left + (minX + maxX) / 2),
      y: Math.round(bcr.top + minY),
    });
  }, []);

  const selectCards = useCallback(
    (ids: string[]) => {
      selectedCardIdsRef.current = ids;
      setSelectedCardIds(ids);
      if (ids.length === 0) {
        setPopupPos(null);
      } else {
        updatePopupPos();
      }
    },
    [updatePopupPos]
  );

  const stopViewportTween = useCallback(() => {
    const tween = viewportTweenRef.current;
    if (!tween) {
      return;
    }
    tween.pause();
    tween.destroy();
    viewportTweenRef.current = null;
  }, []);

  // Returns the visible canvas dimensions.
  // Reads #sidebar (main app sidebar) width directly — not via the
  // --main-sidebar-offset CSS var — so the value is always accurate at call
  // time regardless of whether SuiteSidebarOffset's ResizeObserver has already
  // flushed its CSS var update. This eliminates the race condition between the
  // two ResizeObserver callbacks that both observe #sidebar.
  const getViewport = useCallback(() => {
    const mainSidebar = document.querySelector("#sidebar");
    const mainSidebarWidth = mainSidebar
      ? mainSidebar.getBoundingClientRect().width
      : 0;
    return {
      height: window.innerHeight,
      width: window.innerWidth - mainSidebarWidth,
    };
  }, []);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  const zoomAt = useCallback(
    (factor: number, cx?: number, cy?: number, animate = false) => {
      const stage = stageRef.current;
      if (!stage) {
        return;
      }
      stopViewportTween();
      const old = stage.scaleX();
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, old * factor));
      if (Math.abs(scale - old) < ZOOM_EPSILON) {
        return;
      }
      const vp = getViewport();
      const px = cx ?? vp.width / 2;
      const py = cy ?? vp.height / 2;
      const piv = { x: (px - stage.x()) / old, y: (py - stage.y()) / old };
      const targetX = px - piv.x * scale;
      const targetY = py - piv.y * scale;

      if (!animate) {
        stage.scale({ x: scale, y: scale });
        stage.position({ x: targetX, y: targetY });
        setZoom(Math.round(scale * 100));
        updatePopupPos();
        return;
      }

      const tween = new Konva.Tween({
        duration: ZOOM_ANIMATION_DURATION,
        easing: Konva.Easings.EaseOut,
        node: stage,
        onFinish: () => {
          setZoom(Math.round(scale * 100));
          // oxlint-disable-next-line react/react-compiler -- tween is self-referenced inside its own onFinish callback (Konva Tween pattern); restructuring risks changing animation cleanup timing
          tween.destroy();
          if (viewportTweenRef.current === tween) {
            viewportTweenRef.current = null;
          }
        },
        onUpdate: () => {
          const nextZoom = Math.round(stage.scaleX() * 100);
          setZoom((prevZoom) => (prevZoom === nextZoom ? prevZoom : nextZoom));
          updatePopupPos();
        },
        scaleX: scale,
        scaleY: scale,
        x: targetX,
        y: targetY,
      });

      viewportTweenRef.current = tween;
      tween.play();
    },
    [stopViewportTween, getViewport, updatePopupPos]
  );

  const zoomBy = useCallback(
    (delta: number, cx?: number, cy?: number, animate = false) => {
      const stage = stageRef.current;
      if (!stage) {
        return;
      }
      const old = stage.scaleX();
      const targetScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, old + delta));
      if (Math.abs(targetScale - old) < ZOOM_EPSILON) {
        return;
      }

      zoomAt(targetScale / old, cx, cy, animate);
    },
    [zoomAt]
  );

  const fitAll = useCallback(
    (animate = true) => {
      const stage = stageRef.current;
      const bounds = getCardsBounds(cardsRef.current);
      if (!stage || !bounds) {
        return;
      }
      stopViewportTween();
      const { maxX, maxY } = bounds;
      const vp = getViewport();
      const leftOffset = getSuiteSidebarOffsetRef.current?.() ?? 0;
      const visibleWidth = vp.width - leftOffset;
      const margin = FIT_VIEWPORT_MARGIN;
      const scale = Math.min(
        (visibleWidth * (1 - 2 * margin)) / maxX,
        (vp.height * (1 - 2 * margin)) / maxY,
        MAX_SCALE
      );
      const targetX = leftOffset + visibleWidth / 2 - (maxX / 2) * scale;
      const targetY = vp.height / 2 - (maxY / 2) * scale;

      if (!animate) {
        stage.scale({ x: scale, y: scale });
        stage.position({ x: targetX, y: targetY });
        setZoom(Math.round(scale * 100));
        didInitViewportRef.current = true;
        updatePopupPos();
        return;
      }

      const tween = new Konva.Tween({
        duration: FIT_ANIMATION_DURATION,
        easing: Konva.Easings.EaseInOut,
        node: stage,
        onFinish: () => {
          setZoom(Math.round(scale * 100));
          didInitViewportRef.current = true;
          // oxlint-disable-next-line react/react-compiler -- tween is self-referenced inside its own onFinish callback (Konva Tween pattern); restructuring risks changing animation cleanup timing
          tween.destroy();
          if (viewportTweenRef.current === tween) {
            viewportTweenRef.current = null;
          }
        },
        scaleX: scale,
        scaleY: scale,
        x: targetX,
        y: targetY,
      });

      viewportTweenRef.current = tween;
      tween.play();
    },
    [stopViewportTween, getViewport, updatePopupPos]
  );

  const fitFirstTemplateZoom = useCallback(
    (animate = false) => {
      const stage = stageRef.current;
      const bounds = getCardsBounds(cardsRef.current);
      if (!stage || !bounds) {
        return;
      }
      stopViewportTween();
      const scale = TEMPLATE_INITIAL_ZOOM_SCALE;
      const { maxX, maxY } = bounds;
      const vp = getViewport();
      const leftOffset = getSuiteSidebarOffsetRef.current?.() ?? 0;
      const visibleWidth = vp.width - leftOffset;
      const targetX = leftOffset + visibleWidth / 2 - (maxX / 2) * scale;
      const targetY = vp.height / 2 - (maxY / 2) * scale;

      if (!animate) {
        stage.scale({ x: scale, y: scale });
        stage.position({ x: targetX, y: targetY });
        setZoom(Math.round(scale * 100));
        didInitViewportRef.current = true;
        updatePopupPos();
        return;
      }

      const tween = new Konva.Tween({
        duration: FIT_ANIMATION_DURATION,
        easing: Konva.Easings.EaseInOut,
        node: stage,
        onFinish: () => {
          setZoom(Math.round(scale * 100));
          didInitViewportRef.current = true;
          // oxlint-disable-next-line react/react-compiler -- tween is self-referenced inside its own onFinish callback (Konva Tween pattern); restructuring risks changing animation cleanup timing
          tween.destroy();
          if (viewportTweenRef.current === tween) {
            viewportTweenRef.current = null;
          }
        },
        scaleX: scale,
        scaleY: scale,
        x: targetX,
        y: targetY,
      });

      viewportTweenRef.current = tween;
      tween.play();
    },
    [stopViewportTween, getViewport, updatePopupPos]
  );

  const focusGeneration = useCallback(
    (genId: string) => {
      const stage = stageRef.current;
      if (!stage) {
        return;
      }
      const bounds = getGenerationBounds(cardsRef.current, genId);
      if (!bounds) {
        return;
      }
      if (suppressedFocusGenerationIdsRef.current.has(genId)) {
        return;
      }
      stopViewportTween();
      const { minX, minY, maxX, maxY } = bounds;
      const vp = getViewport();
      const leftOffset = getSuiteSidebarOffsetRef.current?.() ?? 0;
      const visibleWidth = vp.width - leftOffset;
      const margin = GENERATION_FOCUS_VIEWPORT_MARGIN;
      const bboxW = maxX - minX;
      const bboxH = maxY - minY;
      const scale = Math.min(
        (visibleWidth * (1 - 2 * margin)) / bboxW,
        (vp.height * (1 - 2 * margin)) / bboxH,
        MAX_SCALE
      );
      const targetX =
        leftOffset + visibleWidth / 2 - (minX + bboxW / 2) * scale;
      const targetY = vp.height / 2 - (minY + bboxH / 2) * scale;

      if (!didInitViewportRef.current) {
        return;
      }

      const tween = new Konva.Tween({
        duration: FIT_ANIMATION_DURATION,
        easing: Konva.Easings.EaseInOut,
        node: stage,
        onFinish: () => {
          setZoom(Math.round(scale * 100));
          // oxlint-disable-next-line react/react-compiler -- tween is self-referenced inside its own onFinish callback (Konva Tween pattern); restructuring risks changing animation cleanup timing
          tween.destroy();
          if (viewportTweenRef.current === tween) {
            viewportTweenRef.current = null;
          }
        },
        scaleX: scale,
        scaleY: scale,
        x: targetX,
        y: targetY,
      });

      viewportTweenRef.current = tween;
      tween.play();
    },
    [stopViewportTween, getViewport]
  );

  // Helper: load a single image into an existing or new card
  const loadSingleImage = useCallback(
    (
      cardId: string,
      url: string,
      genId: string,
      assetType: StudioAssetType,
      isNew: boolean,
      imageId?: string
    ) => {
      loadingCountRef.current += 1;
      if (isNew) {
        const groupRef = {
          current: null,
        } as React.RefObject<Konva.Group | null>;
        setCardsAndRef((prev) => [
          ...prev,
          {
            annotations: [],
            assetType,
            generationId: genId,
            groupRef,
            id: cardId,
            imageId,
            status: "loading",
          },
        ]);
      } else {
        setCardsAndRef((prev) =>
          prev.map((c) =>
            c.id === cardId ? { ...c, ...(imageId && { imageId }) } : c
          )
        );
      }

      const img = new window.Image();
      img.addEventListener(
        "load",
        () => {
          loadingCountRef.current -= 1;
          setCardsAndRef((prev) =>
            prev.map((c) => {
              if (c.id !== cardId) {
                return c;
              }
              // Cell hugs the image at its natural aspect ratio, contain-scaled into the max box
              // (row cards: up to CELL_RATIO_SIDE_MAX wide × CELL_H tall; poster cards: CELL_W wide
              // × up to CELL_RATIO_SIDE_MAX tall). Pure math — valid for ANY ratio. The image fills
              // the cell exactly (ix/iy = 0), so the drawable area IS the image area. Broken
              // natural sizes (0) keep the default square cell with the old centered contain.
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                const maxW =
                  c.assetType === "poster" ? CELL_W : CELL_RATIO_SIDE_MAX;
                const maxH =
                  c.assetType === "poster" ? CELL_RATIO_SIDE_MAX : CELL_H;
                const sc = Math.min(
                  maxW / img.naturalWidth,
                  maxH / img.naturalHeight
                );
                const cellW = img.naturalWidth * sc;
                const cellH = img.naturalHeight * sc;
                return {
                  ...c,
                  cellH,
                  cellW,
                  img,
                  imgRect: { ih: cellH, iw: cellW, ix: 0, iy: 0 },
                  status: "loaded" as const,
                };
              }
              const sc = Math.min(CELL_W / img.width, CELL_H / img.height);
              const iw = img.width * sc;
              const ih = img.height * sc;
              return {
                ...c,
                img,
                imgRect: {
                  ih,
                  iw,
                  ix: (CELL_W - iw) / 2,
                  iy: (CELL_H - ih) / 2,
                },
                status: "loaded" as const,
              };
            })
          );
          if (genId === latestGenerationIdRef.current) {
            focusGeneration(genId);
          }
        },
        { once: true }
      );
      img.addEventListener(
        "error",
        () => {
          loadingCountRef.current -= 1;
          setCardsAndRef((prev) =>
            prev.map((c) =>
              c.id === cardId ? { ...c, status: "error" as const } : c
            )
          );
        },
        { once: true }
      );
      img.crossOrigin = "anonymous";
      // Route through the same-origin proxy so canvas ops (toDataURL/toBlob for export, download,
      // thumbnail crop) stay CORS-clean — the static image hosts don't send CORS headers.
      img.src = url;
    },
    [focusGeneration, setCardsAndRef]
  );

  const addSkeletons = useCallback(
    (
      count: number,
      options?: { generationId?: string; assetType?: StudioAssetType }
    ) => {
      const stage = stageRef.current;
      if (!stage || count <= 0) {
        return;
      }

      const genId = options?.generationId ?? generateRandomUUIDV4();
      const assetType = options?.assetType ?? "logo";
      latestGenerationIdRef.current = genId;
      if (!didInitViewportRef.current) {
        suppressedFocusGenerationIdsRef.current.add(genId);
      }
      const ids: string[] = [];
      // A new generation clears only the placeholder skeletons a prior failed/no-output turn
      // flipped to "Failed to load" (isOrphanFailure) — the new skeletons take their freed slot
      // (failed row is always the last group). Real image-load failures are left untouched.
      // Also remove any existing loading skeletons for the same genId so that a second addSkeletons
      // call (syncCanvasWithItems fires first with imageCount=1, then pendingSkeletonHint fires with
      // the real count) replaces rather than appends — preventing a 1→4→3 flash.
      const nextCards = cardsRef.current.filter(
        (c) =>
          !c.isOrphanFailure &&
          !(c.status === "loading" && c.generationId === genId)
      );

      for (let i = 0; i < count; i += 1) {
        const cardId = generateRandomUUIDV4();
        const groupRef = {
          current: null,
        } as React.RefObject<Konva.Group | null>;
        nextCards.push({
          annotations: [],
          assetType,
          generationId: genId,
          groupRef,
          id: cardId,
          status: "loading",
        });
        ids.push(cardId);
      }
      cardsRef.current = nextCards;
      setCards(nextCards);

      pendingSkeletonRef.current = { assetType, genId, ids };
      focusGeneration(genId);
    },
    [focusGeneration]
  );

  const loadImages = useCallback(
    (
      urls: string[],
      options?: {
        generationId?: string;
        assetType?: StudioAssetType;
        imageIds?: string[];
        noFocus?: boolean;
      }
    ) => {
      const stage = stageRef.current;
      if (!stage || urls.length === 0) {
        return;
      }

      const newImages = getNewImages(urls, options?.imageIds, addedUrlsRef);
      if (newImages.length === 0) {
        return;
      }

      const pending = pendingSkeletonRef.current;
      const { assetType, genId, shouldUpdateLatestGenerationId } =
        resolveLoadImagesGenerationContext(options, pending);

      if (shouldUpdateLatestGenerationId) {
        latestGenerationIdRef.current = genId;
      }
      // Only suppress focus when the viewport hasn't been initialized yet (first
      // load). Do NOT suppress for noFocus history loads: those are already
      // prevented from focusing via latestGenerationIdRef, and adding their
      // genId here pollutes the set that the trim path reads via isFocusSuppressed
      // — which would wrongly trigger fitAll (overriding focus) when the project
      // images query refetches a freshly generated image after reload.
      if (!didInitViewportRef.current) {
        suppressedFocusGenerationIdsRef.current.add(genId);
      }

      // Only consume as many skeleton IDs as we have new images (streaming-safe).
      // Put the rest back so subsequent IMAGE_READY calls can reuse them.
      const { idsToUse, idsRemaining } = splitPendingSkeletonIds(
        pending,
        newImages.length
      );

      pendingSkeletonRef.current =
        idsRemaining.length > 0 && pending
          ? { ...pending, ids: idsRemaining }
          : null;

      for (let i = 0; i < newImages.length; i += 1) {
        const { imageId, url } = newImages[i] as {
          imageId?: string;
          url: string;
        };
        addedUrlsRef.current.add(url);
        const existingId = idsToUse[i];
        const cardId = existingId ?? generateRandomUUIDV4();
        loadSingleImage(cardId, url, genId, assetType, !existingId, imageId);
      }

      if (!options?.noFocus) {
        focusGeneration(genId);
      }
    },
    [focusGeneration, loadSingleImage]
  );

  const setMode = useCallback(
    (mode: StudioMode) => {
      const stage = stageRef.current;
      if (!stage) {
        return;
      }
      studioModeRef.current = mode;
      setStudioModeState(mode);
      stage.draggable(mode === STUDIO_MODE.drag);
      if (mode !== STUDIO_MODE.select) {
        selectCards([]);
      }
    },
    [selectCards]
  );

  const tryActivateSpacePan = useCallback(() => {
    if (studioModeRef.current === STUDIO_MODE.drag) {
      return;
    }
    if (isDrawingRef.current) {
      return;
    }
    if (!spaceKeyDownRef.current) {
      return;
    }
    const stage = stageRef.current;
    if (stage) {
      stage.draggable(true);
    }
    setSpacePanning(true);
  }, []);

  // ─── space-to-pan (Figma-like) ───────────────────────────
  useEffect(() => {
    const resetSpacePan = () => {
      spaceKeyDownRef.current = false;
      setSpacePanning(false);
      const stage = stageRef.current;
      if (stage && studioModeRef.current !== STUDIO_MODE.drag) {
        stage.draggable(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") {
        return;
      }
      if (e.repeat) {
        return;
      }
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }

      spaceKeyDownRef.current = true;

      if (studioModeRef.current === STUDIO_MODE.drag) {
        return;
      }
      // Option B: ignore while rect is being drawn
      if (isDrawingRef.current) {
        return;
      }

      e.preventDefault();
      tryActivateSpacePan();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") {
        return;
      }
      spaceKeyDownRef.current = false;
      resetSpacePan();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", resetSpacePan);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", resetSpacePan);
    };
  }, [tryActivateSpacePan]);

  const resetView = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    stopViewportTween();
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    setZoom(100);
  }, [stopViewportTween]);

  useEffect(
    () => () => {
      stopViewportTween();
    },
    [stopViewportTween]
  );

  // ─── addAnnotation to card state ─────────────────────
  const addAnnotation = useCallback(
    (cardId: string, rx: number, ry: number, rw: number, rh: number) => {
      const annotationCount = cardsRef.current.reduce(
        (count, card) => count + card.annotations.length,
        0
      );
      if (annotationCount >= MAX_STUDIO_ANNOTATIONS) {
        return;
      }
      const num = (rectCounterRef.current += 1);
      const annotId = generateRandomUUIDV4();
      const annotation: AnnotationRect = {
        height: rh,
        id: annotId,
        num,
        width: rw,
        x: rx,
        y: ry,
      };

      setCardsAndRef((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? { ...c, annotations: [...c.annotations, annotation] }
            : c
        )
      );

      const card = cardsRef.current.find((c) => c.id === cardId);
      if (card) {
        const thumbDataUrl = extractThumb(card, rx, ry, rw, rh);
        setAttachments((pills) => {
          if (pills.some((pill) => pill.annotationId === annotId)) {
            return pills;
          }
          return [
            ...pills,
            { annotationId: annotId, id: `att-${annotId}`, num, thumbDataUrl },
          ];
        });
      }

      return annotId;
    },
    [setCardsAndRef]
  );

  const removeAnnotationById = useCallback((annotationId: string) => {
    const filteredCards = cardsRef.current.map((card) => ({
      ...card,
      annotations: card.annotations.filter(
        (annotation) => annotation.id !== annotationId
      ),
    }));
    const {
      cards: reindexedCards,
      count,
      numberByAnnotationId,
    } = reindexAnnotationNumbers(filteredCards);

    cardsRef.current = reindexedCards;
    rectCounterRef.current = count;
    setCards(reindexedCards);
    setAttachments((prev) =>
      prev
        .filter((pill) => pill.annotationId !== annotationId)
        .map((pill) =>
          pill.annotationId
            ? {
                ...pill,
                num: numberByAnnotationId.get(pill.annotationId) ?? pill.num,
              }
            : pill
        )
    );
  }, []);

  // ─── removeAnnotation ────────────────────────────────
  const removeAnnotation = useCallback(
    (_cardId: string, annotationId: string) => {
      removeAnnotationById(annotationId);
    },
    [removeAnnotationById]
  );

  const isFocusSuppressed = useCallback(
    (genId: string) => suppressedFocusGenerationIdsRef.current.has(genId),
    []
  );

  const clearAllAnnotations = useCallback(() => {
    const clearedCards = cardsRef.current.map((card) => ({
      ...card,
      annotations: [],
    }));
    cardsRef.current = clearedCards;
    rectCounterRef.current = 0;
    setCards(clearedCards);
    setAttachments((prev) => prev.filter((pill) => !pill.annotationId));
  }, []);

  const removeFullImageAttachment = useCallback(
    (pillId: string, cardId: string) => {
      imgAttachMapRef.current.delete(cardId);
      setAttachments((prev) => prev.filter((pill) => pill.id !== pillId));
    },
    []
  );

  // ─── removeAttachment (via pill × button) ───────────
  const removeAttachment = useCallback(
    (pillId: string) => {
      const pill = attachmentsRef.current.find((item) => item.id === pillId);
      if (!pill) {
        return;
      }
      if (pill.annotationId) {
        removeAnnotationById(pill.annotationId);
        return;
      }
      if (pill.cardId) {
        removeFullImageAttachment(pillId, pill.cardId);
      }
    },
    [removeAnnotationById, removeFullImageAttachment]
  );

  // ─── addFullImagePill ────────────────────────────────
  const addFullImagePill = useCallback((cardId: string) => {
    const card = cardsRef.current.find((c) => c.id === cardId);
    if (!card?.img) {
      return;
    }
    const existingPillId = imgAttachMapRef.current.get(cardId);
    if (existingPillId) {
      setAttachments((prev) => prev.filter((p) => p.id !== existingPillId));
    }
    const pillId = `att-img-${generateRandomUUIDV4()}`;
    imgAttachMapRef.current.set(cardId, pillId);
    const thumbDataUrl = card.img.src;
    setAttachments((prev) => [...prev, { cardId, id: pillId, thumbDataUrl }]);
  }, []);

  const removeFullImagePill = useCallback((cardId: string) => {
    const pillId = imgAttachMapRef.current.get(cardId);
    if (!pillId) {
      return;
    }

    imgAttachMapRef.current.delete(cardId);
    setAttachments((prev) => prev.filter((pill) => pill.id !== pillId));
  }, []);

  const trimOrphanSkeletons = useCallback(
    (generationId: string) => {
      const pending = pendingSkeletonRef.current;
      if (
        !pending ||
        pending.genId !== generationId ||
        pending.ids.length === 0
      ) {
        return;
      }
      const orphanIds = new Set(pending.ids);
      pendingSkeletonRef.current = null;
      setCardsAndRef((prev) => prev.filter((c) => !orphanIds.has(c.id)));
    },
    [setCardsAndRef]
  );

  // Like trimOrphanSkeletons, but KEEPS the leftover loading cards and flips them to "error"
  // (the "Failed to load" UI) instead of removing them. Used when a turn fails / settles without
  // delivering its promised images: the failed slots stay visible until the NEXT generation, which
  // clears them via addSkeletons. Clears pendingSkeletonRef so later loads won't reuse these cards.
  const failOrphanSkeletons = useCallback(
    (generationId: string) => {
      const pending = pendingSkeletonRef.current;
      if (
        !pending ||
        pending.genId !== generationId ||
        pending.ids.length === 0
      ) {
        return;
      }
      const orphanIds = new Set(pending.ids);
      pendingSkeletonRef.current = null;
      setCardsAndRef((prev) =>
        prev.map((c) =>
          orphanIds.has(c.id)
            ? { ...c, isOrphanFailure: true, status: "error" as const }
            : c
        )
      );
    },
    [setCardsAndRef]
  );

  return {
    addAnnotation,
    addFullImagePill,
    addSkeletons,
    attachments,
    canvasContainerRef,
    cards,
    clearAllAnnotations,
    failOrphanSkeletons,
    fitAll,
    fitFirstTemplateZoom,
    isDrawingRef,
    isFocusSuppressed,
    loadImages,
    popupPos,
    removeAnnotation,
    removeAttachment,
    removeFullImagePill,
    resetView,
    selectCards,
    selectedCardIds,
    setMode,
    spacePanning,
    stageRef,
    studioMode,
    trimOrphanSkeletons,
    tryActivateSpacePan,
    updatePopupPos,
    zoom,
    zoomAt,
    zoomBy,
  };
}
