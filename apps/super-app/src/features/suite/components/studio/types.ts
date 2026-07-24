import type Konva from "konva";

export interface AnnotationRect {
  id: string;
  num: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AttachmentPill {
  id: string;
  thumbDataUrl: string;
  /** Present on annotation-based pills. Absent on full-image pills. */
  num?: number;
  /** Present on annotation-based pills. Absent on full-image pills. */
  annotationId?: string;
  /** Present on full-image pills. Absent on annotation-based pills. */
  cardId?: string;
}

export interface CardImageRect {
  ix: number;
  iy: number;
  iw: number;
  ih: number;
}

export type StudioAssetType = "logo" | "poster";

export interface StudioCard {
  id: string;
  generationId: string;
  imageId?: string;
  assetType: StudioAssetType;
  groupRef: React.RefObject<Konva.Group | null>;
  // Cell size in canvas units. Set from the image's natural aspect ratio on load (one side fixed
  // at CELL_W/CELL_H, the other ratio-derived and clamped). Absent (= CELL_W × CELL_H square)
  // while loading or when the image failed to load.
  cellW?: number;
  cellH?: number;
  status: "loading" | "loaded" | "error";
  // True only for skeletons flipped to "Failed to load" by a failed/no-output turn (failOrphan
  // Skeletons). Distinguishes them from genuine image-load failures so the NEXT generation clears
  // only these placeholders — never a real delivered image that failed to render.
  isOrphanFailure?: boolean;
  img?: HTMLImageElement;
  imgRect?: CardImageRect;
  annotations: AnnotationRect[];
}
