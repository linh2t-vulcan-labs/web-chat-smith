"use client";

import Konva from "konva";
import { memo, useEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage, Path, Rect, Text } from "react-konva";

import {
  CELL_H,
  CELL_W,
  STUDIO_ERROR_ICON_PATH,
  STUDIO_LOADING_SHIMMER_COLOR_STOPS,
  STUDIO_MODE,
} from "./constants";
import type { StudioMode } from "./constants";
import { StudioAnnotation } from "./studio-annotation";
import type { StudioCard } from "./types";
import { useStudioTokenColors } from "./use-studio-token-colors";

interface StudioImageCardProps {
  card: StudioCard;
  // Position resolved by the canvas (single getCardPositions pass per cards change). Primitives so
  // React.memo can skip untouched cards — setCardsAndRef only re-creates the changed card object.
  posX: number;
  posY: number;
  isSelected: boolean;
  mode: StudioMode;
  spacePanningRef: React.MutableRefObject<boolean>;
  onDrawStart: (card: StudioCard, stagePos: { x: number; y: number }) => void;
  onDeleteAnnotation: (cardId: string, annotationId: string) => void;
  onCardClick: (cardId: string) => void;
  stageContent: HTMLDivElement | null;
}

export const StudioImageCard = memo(
  ({
    card,
    posX,
    posY,
    isSelected,
    mode,
    spacePanningRef,
    onDrawStart,
    onDeleteAnnotation,
    onCardClick,
    stageContent,
  }: StudioImageCardProps) => {
    const groupRef = useRef<Konva.Group | null>(null);
    const textShimmerRef = useRef<Konva.Text | null>(null);
    const bgRectRef = useRef<Konva.Rect | null>(null);
    const animRef = useRef<Konva.Animation | null>(null);
    const pulseAnimRef = useRef<Konva.Animation | null>(null);
    const [shimmerRunning, setShimmerRunning] = useState(
      card.status === "loading"
    );
    const [isHovered, setIsHovered] = useState(false);
    const showHoverBorder =
      isHovered &&
      !isSelected &&
      mode === STUDIO_MODE.select &&
      card.status === "loaded" &&
      !!card.imgRect;

    const tokenColors = useStudioTokenColors();

    // Keep groupRef in sync with card
    // oxlint-disable-next-line react/react-compiler -- intentionally writes into the parent-owned card.groupRef so external Konva code can reach this node's group; a ref hand-off, not React-owned render state
    useEffect(() => {
      // oxlint-disable-next-line react/react-compiler -- intentionally writes into the parent-owned card.groupRef so external Konva code can reach this node's group; a ref hand-off, not React-owned render state
      (card.groupRef as React.MutableRefObject<Konva.Group | null>).current =
        groupRef.current;
    });

    useEffect(() => {
      if (card.status !== "loading") {
        animRef.current?.stop();
        animRef.current = null;
        pulseAnimRef.current?.stop();
        pulseAnimRef.current = null;
        // oxlint-disable-next-line react/react-compiler -- stops shimmer state in sync with tearing down the Konva animations above; imperative animation lifecycle cleanup, not a render derivation
        setShimmerRunning(false);
        return;
      }

      const textNode = textShimmerRef.current;
      if (!textNode) {
        return;
      }

      const tw = 80; // approximate width of "Generating..." at fontSize 12
      const anim = new Konva.Animation((frame) => {
        if (!frame) {
          return;
        }
        const t = (frame.time % 1800) / 1800;
        const sx = -tw + t * tw * 3;
        textNode.fillLinearGradientStartPoint({ x: sx, y: 0 });
        textNode.fillLinearGradientEndPoint({ x: sx + tw, y: 0 });
      }, textNode.getLayer());
      anim.start();
      animRef.current = anim;

      // Pulse background opacity like animate-pulse
      const bgNode = bgRectRef.current;
      if (bgNode) {
        const pulseAnim = new Konva.Animation((frame) => {
          if (!frame) {
            return;
          }
          const t = (frame.time % 2000) / 2000;
          const opacity =
            0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 - Math.PI / 2));
          bgNode.opacity(opacity);
        }, bgNode.getLayer());
        pulseAnim.start();
        pulseAnimRef.current = pulseAnim;
      }

      return () => {
        anim.stop();
        pulseAnimRef.current?.stop();
        pulseAnimRef.current = null;
      };
    }, [card.status]);

    return (
      <Group
        ref={groupRef}
        x={posX}
        y={posY}
        onClick={(e) => {
          e.cancelBubble = true;
          if (mode !== STUDIO_MODE.select) {
            return;
          }
          onCardClick(card.id);
        }}
      >
        {card.status === "loaded" && card.img && card.imgRect && (
          <Rect
            name="cardBg"
            width={card.imgRect.iw}
            height={card.imgRect.ih}
            x={card.imgRect.ix}
            y={card.imgRect.iy}
            fill="rgba(0,0,0,0)"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={(e) => {
              if (mode !== STUDIO_MODE.draw || spacePanningRef.current) {
                return;
              }
              e.cancelBubble = true;
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              if (stage && pos) {
                onDrawStart(card, pos);
              }
            }}
          />
        )}
        {shimmerRunning && (
          <>
            <Rect
              ref={bgRectRef}
              width={CELL_W}
              height={CELL_H}
              fill={tokenColors.surfaceGlassDarkBreath}
              // Mid-breath initial opacity; the pulse animation drives it 0.25→1.0 once loading starts.
              opacity={0.625}
              listening={false}
            />
            <Text
              ref={textShimmerRef}
              text="Generating..."
              fontSize={12}
              x={0}
              y={12}
              width={CELL_W - 16}
              align="right"
              fillLinearGradientStartPoint={{ x: -80, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: 0 }}
              fillLinearGradientColorStops={STUDIO_LOADING_SHIMMER_COLOR_STOPS}
              listening={false}
            />
          </>
        )}

        {card.status === "loaded" && card.img && card.imgRect && (
          <KonvaImage
            image={card.img}
            x={card.imgRect.ix}
            y={card.imgRect.iy}
            width={card.imgRect.iw}
            height={card.imgRect.ih}
            listening={false}
          />
        )}

        {showHoverBorder && card.imgRect && (
          <Rect
            x={card.imgRect.ix}
            y={card.imgRect.iy}
            width={card.imgRect.iw}
            height={card.imgRect.ih}
            stroke={tokenColors.transformerStroke}
            strokeWidth={1}
            listening={false}
          />
        )}

        {card.status === "error" && (
          <>
            {/* --surface-glass-dark-breath background */}
            <Rect
              x={0}
              y={0}
              width={CELL_W}
              height={CELL_H}
              fill={tokenColors.surfaceGlassDarkBreath}
              listening={false}
            />
            {/* badge: top-right, mirrors Figma (badge x=116 in 236px → 114 in 232px card space) */}
            {/* inner Chat Dialog row: x=122 (114+8), y=8 (badge padding) */}
            <Group x={122} y={8} listening={false}>
              <Path
                data={STUDIO_ERROR_ICON_PATH}
                fill={tokenColors.iconsStatusError}
                x={0}
                y={0}
                listening={false}
              />
              <Text
                x={16}
                y={0}
                height={12}
                text="Failed to load"
                fill={tokenColors.textStatusError}
                fontSize={12}
                verticalAlign="middle"
                listening={false}
              />
            </Group>
          </>
        )}

        <Group>
          {card.annotations.map((annotation) => (
            <StudioAnnotation
              key={annotation.id}
              annotation={annotation}
              mode={mode}
              spacePanningRef={spacePanningRef}
              onDelete={(annotationId) =>
                onDeleteAnnotation(card.id, annotationId)
              }
              onDrawStart={(stagePos) => onDrawStart(card, stagePos)}
              stageContent={stageContent}
            />
          ))}
        </Group>
      </Group>
    );
  }
);
StudioImageCard.displayName = "StudioImageCard";
