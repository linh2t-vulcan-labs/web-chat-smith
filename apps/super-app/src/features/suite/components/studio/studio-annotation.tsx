"use client";

import type Konva from "konva";
import { Group, Path, Rect } from "react-konva";

import { STUDIO_ANNOTATION_DELETE_ICON_PATH, STUDIO_MODE } from "./constants";
import type { StudioMode } from "./constants";
import type { AnnotationRect } from "./types";
import { useStudioTokenColors } from "./use-studio-token-colors";

interface StudioAnnotationProps {
  annotation: AnnotationRect;
  mode: StudioMode;
  onDelete: (annotationId: string) => void;
  onDrawStart: (stagePos: { x: number; y: number }) => void;
  stageContent: HTMLDivElement | null;
  spacePanningRef: React.MutableRefObject<boolean>;
}

export function StudioAnnotation({
  annotation,
  mode,
  onDelete,
  onDrawStart,
  stageContent,
  spacePanningRef,
}: StudioAnnotationProps) {
  const { id, x, y, width: rw, height: rh } = annotation;

  const tokenColors = useStudioTokenColors();

  // Delete button is sized as a fraction of the annotation (so it never dominates a small
  // box), capped at its 20×16 design size for large annotations. Driven by the annotation's
  // own dimensions — no hardcoded breakpoint.
  const DELETE_TO_ANNOTATION_RATIO = 0.3;
  const deleteScale = Math.min(
    1,
    (rw * DELETE_TO_ANNOTATION_RATIO) / 16,
    (rh * DELETE_TO_ANNOTATION_RATIO) / 12
  );
  const deleteW = 20 * deleteScale;
  const deleteMargin = 4 * deleteScale;

  const setDeleteHoverCursor = () => {
    if (!stageContent) {
      return;
    }
    // oxlint-disable-next-line react/react-compiler -- imperatively mutates the Konva stage DOM container's cursor style (an external DOM node passed as a prop), not React-owned render state
    stageContent.style.cursor = "pointer";
  };

  const restoreStageCursor = () => {
    if (!stageContent) {
      return;
    }
    if (mode === STUDIO_MODE.draw && !spacePanningRef.current) {
      // oxlint-disable-next-line react/react-compiler -- imperatively mutates the Konva stage DOM container's cursor style (an external DOM node passed as a prop), not React-owned render state
      stageContent.style.cursor = "crosshair";
    } else if (mode === STUDIO_MODE.drag) {
      stageContent.style.cursor = "grab";
    } else {
      stageContent.style.cursor = "default";
    }
  };

  return (
    <Group
      x={x}
      y={y}
      onMouseDown={(e) => {
        if (mode === STUDIO_MODE.draw && !spacePanningRef.current) {
          e.cancelBubble = true;
        }
        if (mode === STUDIO_MODE.draw) {
          const stage = e.target.getStage();
          const pos = stage?.getPointerPosition();
          if (stage && pos) {
            onDrawStart(pos);
          }
        }
      }}
    >
      <Rect
        width={rw}
        height={rh}
        stroke={tokenColors.annotationStroke}
        strokeWidth={1}
        dash={[3, 2]}
        fill={tokenColors.annotationFill}
        cornerRadius={5}
      />

      <Group
        x={rw - deleteW - deleteMargin}
        y={deleteMargin}
        scaleX={deleteScale}
        scaleY={deleteScale}
        onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => {
          if (!spacePanningRef.current) {
            e.cancelBubble = true;
          }
        }}
        // oxlint-disable-next-line react/react-compiler -- this handler calls restoreStageCursor, which imperatively mutates the stageContent DOM node's cursor style outside render; intentional external-system side effect, not React-owned state
        onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
          e.cancelBubble = true;
          onDelete(id);
          restoreStageCursor();
        }}
        // oxlint-disable-next-line react/react-compiler -- this handler calls restoreStageCursor, which imperatively mutates the stageContent DOM node's cursor style outside render; intentional external-system side effect, not React-owned state
        onTap={(e: Konva.KonvaEventObject<TouchEvent>) => {
          e.cancelBubble = true;
          onDelete(id);
          restoreStageCursor();
        }}
      >
        <Rect
          x={0}
          y={0}
          width={20}
          height={16}
          fill={tokenColors.annotationDeleteFill}
          stroke={tokenColors.annotationDeleteStroke}
          strokeWidth={1}
          cornerRadius={8}
          onMouseEnter={setDeleteHoverCursor}
          // oxlint-disable-next-line react/react-compiler -- passes an imperative DOM-cursor-mutating handler as an event prop; not a render derivation
          onMouseLeave={restoreStageCursor}
        />
        <Path
          data={STUDIO_ANNOTATION_DELETE_ICON_PATH}
          fill={tokenColors.annotationDeleteText}
          x={6.5}
          y={4.5}
          listening={false}
        />
      </Group>
    </Group>
  );
}
