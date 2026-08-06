"use client";

import type { Experimental_TranscriptionResult as TranscriptionResult } from "ai";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext } from "react";

import { useControllableState } from "#hooks/use-controllable-state";
import { cn } from "#lib/utils";

type TranscriptionSegment = TranscriptionResult["segments"][number];

interface TranscriptionContextValue {
  segments: TranscriptionSegment[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSeek?: (time: number) => void;
}

const TranscriptionContext = createContext<TranscriptionContextValue | null>(
  null
);

const useTranscription = () => {
  const context = useContext(TranscriptionContext);
  if (!context) {
    throw new Error(
      "Transcription components must be used within Transcription"
    );
  }
  return context;
};

export type TranscriptionProps = Omit<ComponentProps<"div">, "children"> & {
  segments: TranscriptionSegment[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  children: (segment: TranscriptionSegment, index: number) => ReactNode;
};

export const Transcription = ({
  segments,
  currentTime: externalCurrentTime,
  onSeek,
  className,
  children,
  ...props
}: TranscriptionProps) => {
  const [currentTime, setCurrentTime] = useControllableState({
    defaultProp: 0,
    onChange: onSeek,
    prop: externalCurrentTime,
  });

  const contextValue = {
    currentTime,
    onSeek,
    onTimeUpdate: setCurrentTime,
    segments,
  };

  const rendered: ReactNode[] = [];
  for (const segment of segments) {
    if (segment.text.trim()) {
      rendered.push(children(segment, rendered.length));
    }
  }

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <TranscriptionContext.Provider value={contextValue}>
      <div
        className={cn(
          "flex flex-wrap gap-1 text-sm leading-relaxed",
          className
        )}
        data-slot="transcription"
        {...props}
      >
        {rendered}
      </div>
    </TranscriptionContext.Provider>
  );
};

export type TranscriptionSegmentProps = ComponentProps<"button"> & {
  segment: TranscriptionSegment;
  index: number;
};

type SegmentTimeState = "active" | "past" | "future";

const getSegmentTimeState = (
  isActive: boolean,
  isPast: boolean
): SegmentTimeState => {
  if (isActive) {
    return "active";
  }
  return isPast ? "past" : "future";
};

const segmentTimeStateClasses: Record<SegmentTimeState, string> = {
  active: "text-primary",
  future: "text-muted-foreground/60",
  past: "text-muted-foreground",
};

const getSegmentClassName = (
  timeState: SegmentTimeState,
  isSeekable: boolean
) =>
  cn(
    "inline text-left",
    segmentTimeStateClasses[timeState],
    isSeekable ? "cursor-pointer hover:text-foreground" : "cursor-default"
  );

export const TranscriptionSegment = ({
  segment,
  index,
  className,
  onClick,
  ...props
}: TranscriptionSegmentProps) => {
  const { currentTime, onSeek } = useTranscription();

  const isActive =
    currentTime >= segment.startSecond && currentTime < segment.endSecond;
  const isPast = currentTime >= segment.endSecond;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onSeek) {
      onSeek(segment.startSecond);
    }
    onClick?.(event);
  };

  return (
    <button
      className={cn(
        getSegmentClassName(
          getSegmentTimeState(isActive, isPast),
          Boolean(onSeek)
        ),
        className
      )}
      data-active={isActive}
      data-index={index}
      data-slot="transcription-segment"
      onClick={handleClick}
      type="button"
      {...props}
    >
      {segment.text}
    </button>
  );
};
