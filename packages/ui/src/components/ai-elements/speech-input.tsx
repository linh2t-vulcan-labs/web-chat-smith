"use client";

import { MicIcon, SquareIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "#components/shadcn/button";
import { Spinner } from "#components/shadcn/spinner";
import { cn } from "#lib/utils";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item: (index: number) => SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type SpeechInputMode = "speech-recognition" | "media-recorder" | "none";

export type SpeechInputProps = ComponentProps<typeof Button> & {
  onTranscriptionChange?: (text: string) => void;
  /**
   * Callback for when audio is recorded using MediaRecorder fallback.
   * This is called in browsers that don't support the Web Speech API (Firefox, Safari).
   * The callback receives an audio Blob that should be sent to a transcription service.
   * Return the transcribed text, which will be passed to onTranscriptionChange.
   */
  onAudioRecorded?: (audioBlob: Blob) => Promise<string>;
  lang?: string;
};

// Lookup table instead of chained ifs: each entry's `matches` decides
// whether that mode is supported in the current environment.
const speechInputModeChecks: {
  mode: Exclude<SpeechInputMode, "none">;
  matches: () => boolean;
}[] = [
  {
    matches: () =>
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
    mode: "speech-recognition",
  },
  {
    matches: () => "MediaRecorder" in window && "mediaDevices" in navigator,
    mode: "media-recorder",
  },
];

const transcriptOf = (result: SpeechRecognitionResult): string =>
  result[0]?.transcript ?? "";

// Reads the transcript of a single result once it has been finalized,
// split out of extractFinalTranscript to keep the loop body a plain call.
const finalSegmentOf = (
  result: SpeechRecognitionResult | undefined
): string => {
  if (!result?.isFinal) {
    return "";
  }
  return transcriptOf(result);
};

// Concatenates every finalized alternative in a speech result event.
// Extracted so the "result" listener itself is a one-line dispatch.
const extractFinalTranscript = (
  speechEvent: SpeechRecognitionEvent
): string => {
  let finalTranscript = "";

  for (
    let i = speechEvent.resultIndex;
    i < speechEvent.results.length;
    i += 1
  ) {
    finalTranscript += finalSegmentOf(speechEvent.results[i]);
  }

  return finalTranscript;
};

const detectSpeechInputMode = (): SpeechInputMode => {
  if (typeof window === "undefined") {
    return "none";
  }

  const supported = speechInputModeChecks.find((check) => check.matches());
  return supported?.mode ?? "none";
};

/**
 * Wires up the Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`)
 * for `mode === "speech-recognition"` and exposes the minimal
 * listening/ready state plus start/stop controls `SpeechInput` needs. Kept
 * as its own hook so the effect's event-listener setup/teardown doesn't
 * inflate the component's own complexity.
 */
const useSpeechRecognitionMode = (
  mode: SpeechInputMode,
  lang: string,
  onTranscriptionChange?: (text: string) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptionChangeRef = useRef(onTranscriptionChange);

  useEffect(() => {
    onTranscriptionChangeRef.current = onTranscriptionChange;
  });

  useEffect(() => {
    if (mode !== "speech-recognition") {
      return;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechRecognition = new SpeechRecognitionCtor();

    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = lang;

    const handleStart = () => {
      setIsListening(true);
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    const handleResult = (event: Event) => {
      const finalTranscript = extractFinalTranscript(
        event as SpeechRecognitionEvent
      );
      if (finalTranscript) {
        onTranscriptionChangeRef.current?.(finalTranscript);
      }
    };

    const handleError = () => {
      setIsListening(false);
    };

    speechRecognition.addEventListener("start", handleStart);
    speechRecognition.addEventListener("end", handleEnd);
    speechRecognition.addEventListener("result", handleResult);
    speechRecognition.addEventListener("error", handleError);

    recognitionRef.current = speechRecognition;
    // oxlint-disable-next-line react/react-compiler -- setState in an effect body is intentional here: it signals that the just-constructed SpeechRecognition instance (an external system) finished initializing, not a derivable render value
    setIsReady(true);

    return () => {
      speechRecognition.removeEventListener("start", handleStart);
      speechRecognition.removeEventListener("end", handleEnd);
      speechRecognition.removeEventListener("result", handleResult);
      speechRecognition.removeEventListener("error", handleError);
      speechRecognition.stop();
      recognitionRef.current = null;
      setIsReady(false);
    };
  }, [mode, lang]);

  return {
    isListening,
    isReady,
    start: () => recognitionRef.current?.start(),
    stop: () => recognitionRef.current?.stop(),
  };
};

// Shared by the unmount cleanup, "error", and "stop" handlers below, which
// all need to release the microphone the same way.
const stopMediaStreamTracks = (stream: MediaStream | null) => {
  if (!stream) {
    return;
  }
  for (const track of stream.getTracks()) {
    track.stop();
  }
};

// Hands the recorded blob to onAudioRecorded and forwards the transcript.
// Extracted so the "stop" event handler stays a short sequence of steps.
const transcribeRecordedAudio = async (
  audioBlob: Blob,
  onAudioRecorded: (audioBlob: Blob) => Promise<string>,
  onTranscriptionChange: ((text: string) => void) | undefined,
  setIsProcessing: (processing: boolean) => void
) => {
  setIsProcessing(true);
  try {
    const transcript = await onAudioRecorded(audioBlob);
    if (transcript) {
      onTranscriptionChange?.(transcript);
    }
  } catch {
    // Error handling delegated to the onAudioRecorded caller
  } finally {
    setIsProcessing(false);
  }
};

/**
 * Records audio via `MediaRecorder` for browsers without the Web Speech API
 * (Firefox, Safari), then hands the recorded blob to `onAudioRecorded` for
 * transcription. Kept as its own hook for the same reason as
 * `useSpeechRecognitionMode` — isolates the recorder/stream lifecycle from
 * `SpeechInput`'s render logic.
 */
const useMediaRecorderMode = (
  onTranscriptionChange?: (text: string) => void,
  onAudioRecorded?: (audioBlob: Blob) => Promise<string>
) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const onTranscriptionChangeRef = useRef(onTranscriptionChange);
  const onAudioRecordedRef = useRef(onAudioRecorded);

  useEffect(() => {
    onTranscriptionChangeRef.current = onTranscriptionChange;
    onAudioRecordedRef.current = onAudioRecorded;
  });

  // Cleanup MediaRecorder and stream on unmount
  useEffect(
    () => () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      stopMediaStreamTracks(streamRef.current);
    },
    []
  );

  const start = async () => {
    if (!onAudioRecordedRef.current) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      const handleDataAvailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Mutual cleanup between the "stop" and "error" handlers needs a
      // reference to "the other handler" before both are defined, so both
      // are stored on this holder instead of referencing bare identifiers.
      const handlers: { stop?: () => Promise<void>; error?: () => void } = {};

      const removeMediaRecorderListeners = () => {
        mediaRecorder.removeEventListener("dataavailable", handleDataAvailable);
        if (handlers.stop) {
          mediaRecorder.removeEventListener("stop", handlers.stop);
        }
        if (handlers.error) {
          mediaRecorder.removeEventListener("error", handlers.error);
        }
      };

      handlers.error = () => {
        removeMediaRecorderListeners();

        setIsListening(false);
        stopMediaStreamTracks(stream);
        streamRef.current = null;
      };

      handlers.stop = async () => {
        removeMediaRecorderListeners();

        stopMediaStreamTracks(stream);
        streamRef.current = null;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (audioBlob.size > 0 && onAudioRecordedRef.current) {
          await transcribeRecordedAudio(
            audioBlob,
            onAudioRecordedRef.current,
            onTranscriptionChangeRef.current,
            setIsProcessing
          );
        }
      };

      mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
      mediaRecorder.addEventListener("stop", handlers.stop);
      mediaRecorder.addEventListener("error", handlers.error);

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const stop = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  return { isListening, isProcessing, start, stop };
};

interface SpeechModeController {
  isListening: boolean;
  start: () => void;
  stop: () => void;
}

type SpeechModeControllers = Record<
  Exclude<SpeechInputMode, "none">,
  SpeechModeController
>;

// Split out of useActiveSpeechMode so the mode->controller lookup (a plain
// ternary) doesn't stack with the rest of the hook's derived state.
const pickActiveController = (
  mode: SpeechInputMode,
  controllersByMode: SpeechModeControllers
): SpeechModeController | null =>
  mode === "none" ? null : controllersByMode[mode];

// Split out for the same reason: keeps the "none"/readiness/processing
// checks in one small, independently-readable place.
const computeIsDisabled = (
  mode: SpeechInputMode,
  isReadyByMode: Record<Exclude<SpeechInputMode, "none">, boolean>,
  isProcessing: boolean
): boolean => {
  if (mode === "none") {
    return true;
  }
  return !isReadyByMode[mode] || isProcessing;
};

// Combines the two mode-specific hooks into the single set of derived state
// SpeechInput's render actually needs (isListening/isDisabled/toggle),
// keeping mode branching out of the component itself.
const useActiveSpeechMode = (
  mode: SpeechInputMode,
  speechRecognition: ReturnType<typeof useSpeechRecognitionMode>,
  mediaRecorder: ReturnType<typeof useMediaRecorderMode>,
  hasAudioRecorder: boolean
) => {
  const controllersByMode: SpeechModeControllers = {
    "media-recorder": mediaRecorder,
    "speech-recognition": speechRecognition,
  };
  const isReadyByMode: Record<Exclude<SpeechInputMode, "none">, boolean> = {
    "media-recorder": hasAudioRecorder,
    "speech-recognition": speechRecognition.isReady,
  };

  const active = pickActiveController(mode, controllersByMode);
  const isListening = active?.isListening ?? false;
  const { isProcessing } = mediaRecorder;
  const isDisabled = computeIsDisabled(mode, isReadyByMode, isProcessing);

  const toggleListening = () => {
    if (!active) {
      return;
    }
    if (isListening) {
      active.stop();
    } else {
      active.start();
    }
  };

  return { isDisabled, isListening, isProcessing, toggleListening };
};

const SpeechInputPulseRings = () => (
  <>
    {[0, 1, 2].map((index) => (
      <div
        className="absolute inset-0 animate-ping rounded-full border-2 border-red-400/30"
        key={index}
        style={{
          animationDelay: `${index * 0.3}s`,
          animationDuration: "2s",
        }}
      />
    ))}
  </>
);

const SpeechInputIcon = ({
  isProcessing,
  isListening,
}: {
  isProcessing: boolean;
  isListening: boolean;
}) => {
  if (isProcessing) {
    return <Spinner />;
  }
  if (isListening) {
    return <SquareIcon className="size-4" />;
  }
  return <MicIcon className="size-4" />;
};

export const SpeechInput = ({
  className,
  onTranscriptionChange,
  onAudioRecorded,
  lang = "en-US",
  ...props
}: SpeechInputProps) => {
  const [mode] = useState<SpeechInputMode>(detectSpeechInputMode);

  const speechRecognition = useSpeechRecognitionMode(
    mode,
    lang,
    onTranscriptionChange
  );
  const mediaRecorder = useMediaRecorderMode(
    onTranscriptionChange,
    onAudioRecorded
  );
  const { isDisabled, isListening, isProcessing, toggleListening } =
    useActiveSpeechMode(
      mode,
      speechRecognition,
      mediaRecorder,
      !!onAudioRecorded
    );

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Animated pulse rings */}
      {isListening && <SpeechInputPulseRings />}

      {/* Main record button */}
      <Button
        className={cn(
          "relative z-10 rounded-full transition-all duration-300",
          isListening
            ? "bg-destructive text-white hover:bg-destructive/80 hover:text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground",
          className
        )}
        disabled={isDisabled}
        onClick={toggleListening}
        {...props}
      >
        <SpeechInputIcon
          isListening={isListening}
          isProcessing={isProcessing}
        />
      </Button>
    </div>
  );
};
