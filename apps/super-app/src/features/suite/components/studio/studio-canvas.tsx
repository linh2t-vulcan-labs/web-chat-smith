"use client";

import type Konva from "konva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, Rect, Stage, Transformer } from "react-konva";

import { STUDIO_MODE, STUDIO_SELECTION_RECT_BORDER } from "./constants";
import type { StudioMode } from "./constants";
import { StudioEmptyState } from "./studio-empty-state";
import { StudioImageCard } from "./studio-image-card";
import type { StudioCard } from "./types";
import { getCardPositions, getCardSize } from "./use-studio";
import { useStudioTokenColors } from "./use-studio-token-colors";

function haveIntersection(
  r1: { x: number; y: number; width: number; height: number },
  r2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

interface TempRect {
  cardId: string;
  startCardX: number;
  startCardY: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DrawState {
  card: StudioCard;
  cardAbsX: number;
  cardAbsY: number;
  startCardX: number;
  startCardY: number;
}

interface StudioCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  cards: StudioCard[];
  isNewProject?: boolean;
  sidebarOffset?: number;
  mode: StudioMode;
  spacePanning: boolean;
  isDrawingRef: React.MutableRefObject<boolean>;
  onDrawInteractionEnd: () => void;
  zoomAt: (factor: number, cx?: number, cy?: number, animate?: boolean) => void;
  onAddAnnotation: (
    cardId: string,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ) => void;
  onDeleteAnnotation: (cardId: string, annotationId: string) => void;
  selectedCardIds: string[];
  onSelectCards: (ids: string[]) => void;
  onCardClick: (cardId: string) => void;
  onStageEmptyClick: () => void;
  onStageDragMove: () => void;
}

export function StudioCanvas({
  stageRef,
  containerRef,
  cards,
  isNewProject,
  sidebarOffset = 0,
  mode,
  spacePanning,
  isDrawingRef,
  zoomAt,
  onAddAnnotation,
  onDeleteAnnotation,
  onDrawInteractionEnd,
  selectedCardIds,
  onSelectCards,
  onCardClick,
  onStageEmptyClick,
  onStageDragMove,
}: StudioCanvasProps) {
  const tokenColors = useStudioTokenColors();
  const drawStateRef = useRef<DrawState | null>(null);
  const spacePanningRef = useRef(spacePanning);
  const isPointerDownRef = useRef(false);
  const middlePanningRef = useRef(false);
  const middlePanLastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [middlePanning, setMiddlePanning] = useState(false);
  const [tempRect, setTempRect] = useState<TempRect | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const selRectRef = useRef<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const selRectWasLargeRef = useRef(false);
  const [selRectVisible, setSelRectVisible] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Layout computed ONCE per cards change. Each card previously derived its own position from the
  // whole cards array (O(n²) per render and a cards prop that defeated memoization).
  const cardPositions = useMemo(() => getCardPositions(cards), [cards]);

  // Pan compensation — fires on every frame of the sidebar CSS transition.
  // Stage size stays fixed at window.innerWidth × window.innerHeight;
  // container overflow:hidden does the clipping.  We only need to shift
  // stage.x so the world centre stays fixed as the visible width changes.
  const prevWidthRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    // Seed the initial width so first resize doesn't over-compensate.
    prevWidthRef.current = el.getBoundingClientRect().width;

    const ro = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      const { width } = entry.contentRect;
      const stage = stageRef.current;
      if (stage && prevWidthRef.current !== null) {
        const dW = width - prevWidthRef.current;
        if (Math.abs(dW) > 0.5) {
          stage.x(stage.x() + dW / 2);
        }
      }
      prevWidthRef.current = width;
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, stageRef]);

  // Keep spacePanningRef in sync
  useEffect(() => {
    spacePanningRef.current = spacePanning;
  }, [spacePanning]);

  const stopMiddlePan = useCallback(() => {
    middlePanningRef.current = false;
    middlePanLastPosRef.current = null;
    isPointerDownRef.current = false;
    setMiddlePanning(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", stopMiddlePan);
    window.addEventListener("blur", stopMiddlePan);
    return () => {
      window.removeEventListener("mouseup", stopMiddlePan);
      window.removeEventListener("blur", stopMiddlePan);
    };
  }, [stopMiddlePan]);

  // Sync Transformer nodes when selectedCardIds changes
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) {
      return;
    }
    const nodes = selectedCardIds
      .map((id) => cards.find((c) => c.id === id)?.groupRef.current)
      .filter((n): n is NonNullable<typeof n> => !!n);
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedCardIds, cards]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) {
        return;
      }

      const shouldZoom = e.evt.ctrlKey || e.evt.metaKey;

      if (!shouldZoom) {
        // trackpad two-finger scroll → pan
        stage.position({
          x: stage.x() - e.evt.deltaX,
          y: stage.y() - e.evt.deltaY,
        });
        onStageDragMove();
        return;
      }

      const pointer = stage.getPointerPosition();
      if (!pointer) {
        return;
      }

      let delta = e.evt.deltaY;
      if (e.evt.deltaMode === 1) {
        // LINE mode: ~15px per line (Firefox default)
        delta *= 15;
      }
      if (e.evt.deltaMode === 2) {
        // PAGE mode: rough estimate for one viewport height
        delta *= 300;
      }

      // Clamp before applying — trackpad sends ~1-3, mouse wheel sends ~100-150
      // Without clamping: tune for trackpad = mouse wheel too fast, and vice versa
      const MAX_DELTA = 10;
      const clamped = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, delta));
      const factor = 2 ** (-clamped * 0.01);

      zoomAt(factor, pointer.x, pointer.y);
      onStageDragMove();
    },
    [stageRef, zoomAt, onStageDragMove]
  );

  const startDraw = useCallback(
    (card: StudioCard, stagePos: { x: number; y: number }) => {
      if (spacePanningRef.current) {
        return;
      }
      const stage = stageRef.current;
      if (!stage) {
        return;
      }
      const scale = stage.scaleX();
      // Use getAbsolutePosition() for accurate card screen coords
      const gabs = card.groupRef.current?.getAbsolutePosition() ?? {
        x: 0,
        y: 0,
      };
      const startCardX = (stagePos.x - gabs.x) / scale;
      const startCardY = (stagePos.y - gabs.y) / scale;

      drawStateRef.current = {
        card,
        cardAbsX: gabs.x,
        cardAbsY: gabs.y,
        startCardX,
        startCardY,
      };
      isDrawingRef.current = true;

      setTempRect({
        cardId: card.id,
        height: 0,
        startCardX,
        startCardY,
        width: 0,
        x: startCardX,
        y: startCardY,
      });
    },
    [stageRef, isDrawingRef]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (middlePanningRef.current) {
        const stage = stageRef.current;
        const last = middlePanLastPosRef.current;
        if (stage && last) {
          const dx = e.evt.clientX - last.x;
          const dy = e.evt.clientY - last.y;
          stage.position({
            x: stage.x() + dx,
            y: stage.y() + dy,
          });
          onStageDragMove();
        }
        middlePanLastPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
        return;
      }

      const ds = drawStateRef.current;
      const stage = stageRef.current;
      if (ds && stage) {
        const scale = stage.scaleX();
        const ptr = stage.getPointerPosition();
        if (ptr) {
          let rw = (ptr.x - ds.cardAbsX) / scale - ds.startCardX;
          let rh = (ptr.y - ds.cardAbsY) / scale - ds.startCardY;
          let rx = ds.startCardX;
          let ry = ds.startCardY;
          if (rw < 0) {
            rx += rw;
            rw = -rw;
          }
          if (rh < 0) {
            ry += rh;
            rh = -rh;
          }
          rx = Math.max(0, rx);
          ry = Math.max(0, ry);
          // Clamp to THIS card's cell (ratio-sized, hugs the image) — not the fixed square.
          const { w: cardW, h: cardH } = getCardSize(ds.card);
          rw = Math.min(rw, cardW - rx);
          rh = Math.min(rh, cardH - ry);
          setTempRect((prev) =>
            prev ? { ...prev, height: rh, width: rw, x: rx, y: ry } : null
          );
        }
      }

      const sr = selRectRef.current;
      const ptr = stageRef.current?.getPointerPosition();
      if (sr && ptr) {
        sr.x2 = ptr.x;
        sr.y2 = ptr.y;
        setSelRectVisible({
          height: Math.abs(sr.y2 - sr.y1),
          width: Math.abs(sr.x2 - sr.x1),
          x: Math.min(sr.x1, sr.x2),
          y: Math.min(sr.y1, sr.y2),
        });
      }
    },
    [onStageDragMove, stageRef]
  );

  const handleMouseUp = useCallback(() => {
    if (middlePanningRef.current) {
      stopMiddlePan();
      return;
    }

    const ds = drawStateRef.current;
    const tr = tempRect;
    drawStateRef.current = null;
    isDrawingRef.current = false;
    isPointerDownRef.current = false;
    setTempRect(null);
    onDrawInteractionEnd();

    if (ds && tr) {
      const { x, y, width: w, height: h } = tr;
      if (w >= 10 && h >= 10) {
        onAddAnnotation(ds.card.id, x, y, w, h);
      }
    }

    // Finalize selection rect
    const sr = selRectRef.current;
    selRectRef.current = null;
    setSelRectVisible(null);
    if (sr) {
      const x = Math.min(sr.x1, sr.x2);
      const y = Math.min(sr.y1, sr.y2);
      const w = Math.abs(sr.x2 - sr.x1);
      const h = Math.abs(sr.y2 - sr.y1);
      if (w > 5 && h > 5) {
        const selBox = { height: h, width: w, x, y };
        const selected = cards
          .filter((card) => {
            const groupNode = card.groupRef.current;
            if (!groupNode) {
              return false;
            }
            const cardBox = groupNode.getClientRect();
            return haveIntersection(selBox, cardBox);
          })
          .map((c) => c.id);
        if (selected.length > 0) {
          selRectWasLargeRef.current = true;
          onSelectCards(selected);
        }
      }
    }
  }, [
    tempRect,
    onAddAnnotation,
    onDrawInteractionEnd,
    isDrawingRef,
    cards,
    onSelectCards,
    stopMiddlePan,
  ]);

  const getCursor = () => {
    if (middlePanning) {
      return "grabbing";
    }
    if (spacePanning) {
      return isPointerDownRef.current ? "grabbing" : "grab";
    }
    if (mode === STUDIO_MODE.drag) {
      return isPointerDownRef.current ? "grabbing" : "grab";
    }
    if (mode === STUDIO_MODE.draw) {
      return "crosshair";
    }
    return "default";
  };

  return (
    <>
      <div
        className="suite-canvas bg-v1-surface-hierarchy-base fixed start-[var(--main-sidebar-offset)] end-0 bottom-0 overflow-hidden select-none"
        ref={containerRef}
        // oxlint-disable-next-line react/react-compiler -- getCursor reads isPointerDownRef.current during render to reflect the live pointer-down state in the cursor style; imperative pointer tracking, not standard render state
        style={{ cursor: getCursor() }}
      >
        <Stage
          ref={stageRef as React.RefObject<Konva.Stage>}
          width={typeof window === "undefined" ? 1280 : window.innerWidth}
          height={typeof window === "undefined" ? 800 : window.innerHeight}
          draggable={mode === STUDIO_MODE.drag}
          onWheel={handleWheel}
          onMouseDown={(e) => {
            if (e.evt.button === 1) {
              e.evt.preventDefault();
              e.cancelBubble = true;
              middlePanningRef.current = true;
              middlePanLastPosRef.current = {
                x: e.evt.clientX,
                y: e.evt.clientY,
              };
              isPointerDownRef.current = true;
              setMiddlePanning(true);
              return;
            }
            if (e.evt.button === 0) {
              isPointerDownRef.current = true;
            }
            // Start selection rect when clicking empty area in select mode
            if (
              mode === STUDIO_MODE.select &&
              e.target === stageRef.current &&
              e.evt.button === 0
            ) {
              const stage = stageRef.current;
              const ptr = stage?.getPointerPosition();
              if (ptr) {
                selRectRef.current = {
                  x1: ptr.x,
                  x2: ptr.x,
                  y1: ptr.y,
                  y2: ptr.y,
                };
              }
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={(e) => {
            if (e.target === stageRef.current) {
              if (selRectWasLargeRef.current) {
                selRectWasLargeRef.current = false;
                return;
              }
              onStageEmptyClick();
            }
          }}
          onDragMove={onStageDragMove}
        >
          <Layer>
            {isNewProject && cards.length === 0 && (
              <StudioEmptyState
                stageRef={stageRef}
                sidebarOffset={sidebarOffset}
              />
            )}
            {/* Render all image cards */}
            {/* oxlint-disable-next-line react/react-compiler -- passes the live DOM container ref down for imperative cursor styling in child cards; container isn't reactive React state */}
            {cards.map((card) => {
              const pos = cardPositions.get(card.id) ?? { x: 0, y: 0 };
              return (
                <StudioImageCard
                  key={card.id}
                  card={card}
                  posX={pos.x}
                  posY={pos.y}
                  isSelected={selectedCardIds.includes(card.id)}
                  mode={mode}
                  spacePanningRef={spacePanningRef}
                  onDrawStart={startDraw}
                  onDeleteAnnotation={onDeleteAnnotation}
                  onCardClick={onCardClick}
                  // oxlint-disable-next-line react/react-compiler -- passes the live DOM container ref down for imperative cursor styling in child cards; container isn't reactive React state
                  stageContent={containerRef.current}
                />
              );
            })}

            {tempRect && (
              <Rect
                x={(cardPositions.get(tempRect.cardId)?.x ?? 0) + tempRect.x}
                y={(cardPositions.get(tempRect.cardId)?.y ?? 0) + tempRect.y}
                width={tempRect.width}
                height={tempRect.height}
                stroke={tokenColors.annotationStroke}
                strokeWidth={1}
                dash={[3, 2]}
                fill={tokenColors.annotationFill}
                cornerRadius={3}
                listening={false}
              />
            )}

            {/* Selection transformer — nodes set via useEffect */}
            <Transformer
              ref={transformerRef as React.RefObject<Konva.Transformer>}
              resizeEnabled={true}
              rotateEnabled={false}
              borderStroke={tokenColors.transformerStroke}
              borderStrokeWidth={2}
              anchorFill={tokenColors.transformerAnchorFill}
              anchorStroke={tokenColors.transformerStroke}
              anchorSize={9}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ]}
              boundBoxFunc={(oldBox) => oldBox}
              anchorStyleFunc={(anchor: Konva.Rect) => {
                anchor.cornerRadius(0);
                anchor.strokeWidth(1.5);
              }}
            />
          </Layer>
        </Stage>
      </div>

      {/* Selection rectangle DOM overlay */}
      {selRectVisible &&
        // oxlint-disable-next-line react/react-compiler -- reads the live DOM container ref during render to position the selection overlay relative to the current bounding box; DOM measurement, not React-owned render state
        (() => {
          const bcr = containerRef.current?.getBoundingClientRect();
          const left = (bcr?.left ?? 0) + selRectVisible.x;
          const top = (bcr?.top ?? 0) + selRectVisible.y;
          return (
            <div
              className="pointer-events-none fixed z-200"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-v1-border-interactive-focus-suite-c) 8%, transparent)",
                border: STUDIO_SELECTION_RECT_BORDER,
                height: selRectVisible.height,
                left,
                top,
                width: selRectVisible.width,
              }}
            />
          );
        })()}
    </>
  );
}
