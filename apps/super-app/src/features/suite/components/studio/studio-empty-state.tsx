"use client";

import Konva from "konva";
import { useEffect, useRef } from "react";
import { Group, Path, Text } from "react-konva";

import {
  STUDIO_CHATSMITH_ICON_PATH,
  STUDIO_EMPTY_STATE_TEXT,
  STUDIO_LOADING_SHIMMER_COLOR_STOPS,
} from "./constants";
import { useStudioTokenColors } from "./use-studio-token-colors";

const ICON_SIZE = 24;
const GAP = 4;
const TEXT_W = 260;
const ROW_H = 24;

interface StudioEmptyStateProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  sidebarOffset: number;
}

export function StudioEmptyState({
  stageRef,
  sidebarOffset,
}: StudioEmptyStateProps) {
  const textRef = useRef<Konva.Text | null>(null);
  const animRef = useRef<Konva.Animation | null>(null);
  const tokenColors = useStudioTokenColors();

  // oxlint-disable-next-line react/react-compiler -- reads the Konva stage ref during render to size/position this overlay to the current canvas dimensions; Konva stage isn't reactive React state, so its size must be read imperatively
  const stageW = stageRef.current?.width() ?? 1280;
  // oxlint-disable-next-line react/react-compiler -- reads the Konva stage ref during render to size/position this overlay to the current canvas dimensions; Konva stage isn't reactive React state, so its size must be read imperatively
  const stageH = stageRef.current?.height() ?? 800;

  const visibleCenterX = sidebarOffset + (stageW - sidebarOffset) / 2;
  const gx = visibleCenterX - (ICON_SIZE + GAP + TEXT_W) / 2;
  const gy = stageH / 2 - ROW_H / 2;

  useEffect(() => {
    const textNode = textRef.current;
    if (!textNode) {
      return;
    }

    const anim = new Konva.Animation((frame) => {
      if (!frame) {
        return;
      }
      const t = (frame.time % 1800) / 1800;
      const sx = -TEXT_W + t * TEXT_W * 3;
      textNode.fillLinearGradientStartPoint({ x: sx, y: 0 });
      textNode.fillLinearGradientEndPoint({ x: sx + TEXT_W, y: 0 });
    }, textNode.getLayer());
    anim.start();
    animRef.current = anim;

    return () => {
      anim.stop();
      animRef.current = null;
    };
  }, []);

  return (
    <Group x={gx} y={gy} listening={false}>
      <Path
        data={STUDIO_CHATSMITH_ICON_PATH}
        fill={tokenColors.iconsHierarchySecondary}
        fillRule="evenodd"
        x={0}
        y={0}
        listening={false}
      />
      <Text
        ref={textRef}
        x={ICON_SIZE + GAP}
        y={0}
        width={TEXT_W}
        height={ROW_H}
        text={STUDIO_EMPTY_STATE_TEXT}
        fontSize={16}
        verticalAlign="middle"
        fillLinearGradientStartPoint={{ x: -TEXT_W, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: 0 }}
        fillLinearGradientColorStops={STUDIO_LOADING_SHIMMER_COLOR_STOPS}
        listening={false}
      />
    </Group>
  );
}
