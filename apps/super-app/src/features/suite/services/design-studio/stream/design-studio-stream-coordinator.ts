import type { TCreateSuiteConversationStore } from "@/features/suite/stores/conversation/store";
import type {
  DesignGuidelineSection,
  SuiteAssetType,
  ThinkingStep,
} from "@/features/suite/types/conversation";
import type {
  TSuiteCreativeSSEAnalysisReadyPayload,
  TSuiteCreativeSSEDirection,
  TSuiteCreativeSSEHandlers,
  TSuiteCreativeSSEOutputReadyPayload,
  TSuiteCreativeSSEPlanReadyPayload,
} from "@/features/suite/types/design-studio";
import { SuiteCreativeDirectionModel } from "@/features/suite/types/design-studio/message";
import { CONVERSATION_ITEM_TYPE } from "@/features/suite/utils/constants/conversation";
import {
  SUITE_BLOCK_KIND,
  SUITE_CREATIVE_STAGE_STATUS,
  SUITE_CREATIVE_STREAM_EVENT,
  SUITE_CREATIVE_STREAM_STAGE,
  SUITE_CREATIVE_TASK_TYPE,
} from "@/features/suite/utils/constants/design-studio-stream";
import { SUITE_TEXT_ANIMATION } from "@/features/suite/utils/constants/text-animation";
import { TransformerBuilder } from "@/libs/class-transformer";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";

import { createAnimationQueue } from "./animation-queue";
import type { AnimationQueue } from "./animation-queue";
import { parseStageInfo } from "./parse-frame";
import { resolveStage } from "./pipelines";

const DEFAULT_GENERATING_DURATION_MS = 120_000;
const MIN_GENERATING_VISIBLE_MS = 3000;
const MAX_GENERATING_VISIBLE_MS = 5000;
// When analysis.ready arrives BEFORE the thinking block gets its queue turn (its in-progress
// "Analyzing..." window was eaten by the preceding bot block), we replay the real analyze
// duration (measured client-side between the two events) + a small buffer before revealing the
// result — so the "Analyzing..." phase is actually visible. Capped so a stalled stream can't
// freeze the queue.
const THINKING_RESULT_DELAY_BUFFER_MS = 200;
const THINKING_MAX_GAP_MS = 5000;
// Bot text is revealed progressively (we grow the string over time) so Streamdown animates it as a
// real stream — fading only the newly-appended tail each tick. Feeding the whole multi-block
// markdown at once makes Streamdown's per-render delta logic fade only the FIRST block and render
// the rest instantly. We reveal a few chars per tick; the tick interval equals the chunk's own
// fade time (chars × stagger) so the fade stays continuous with no gap between chunks.
const BOT_REVEAL_CHARS_PER_TICK = 1;

// `text[index]` is `string | undefined` under noUncheckedIndexedAccess even when the caller has
// already bounds-checked `index`. Callers only invoke this within a `revealed < total` guard, so
// the char is always defined at runtime.
function isNonWhitespaceCharAt(text: string, index: number): boolean {
  const char = text[index];
  return char !== undefined && !/\s/u.test(char);
}

type StoreApi = TCreateSuiteConversationStore;

export interface CreativeStreamCoordinatorOptions {
  generationId: string;
  store: StoreApi;
  assetType: SuiteAssetType;
  onMessageDone: () => void;
  onError?: () => void;
  /** Defers queue advancement out of the React effect / DOM event that triggered it. */
  scheduleAdvance?: (cb: () => void) => void;
  /** Fires when the animation queue goes busy (true) / fully drained (false). */
  onQueueActiveChange?: (active: boolean) => void;
}

// Analytics action for the image_gen event, derived from the `generating` stage (logo_design only).
export type SuiteImageGenAction = "create logo" | "create image" | "edit image";

// Maps a logo_design `generating` stage to its analytics action. Other stages / task_types are
// intentionally absent so they don't produce an image_gen event (tracked separately later).
const IMAGE_GEN_ACTION_BY_STAGE: Partial<Record<string, SuiteImageGenAction>> =
  {
    [SUITE_CREATIVE_STREAM_STAGE.GENERATE_LOGO]: "create logo",
    [SUITE_CREATIVE_STREAM_STAGE.GENERATE_IMAGE]: "create image",
    [SUITE_CREATIVE_STREAM_STAGE.EDIT_LOGO]: "edit image",
  };

interface CoordinatorState {
  thinkingId: string | null;
  guidelineId: string | null;
  generatingId: string | null;
  generatedId: string | null;
  createImageCount: number;
  // Pending block data: filled before/while the block is queued, applied on run().
  thinkingTitle: string;
  thinkingSteps: ThinkingStep[];
  // Resume-the-in-progress-phase support: timestamp of the analyze in-progress event, the
  // measured analyze gap, and the buffered analysis result (set when analysis.ready beats the
  // block's render so run() can still show "Analyzing..." then reveal the result after the gap).
  thinkingInProgressAt: number | null;
  thinkingGapMs: number;
  thinkingPendingResult: { title: string | null; steps: ThinkingStep[] } | null;
  thinkingResultTimer: ReturnType<typeof setTimeout> | null;
  guidelineTitle: string;
  guidelineSections: DesignGuidelineSection[];
  guidelineDirections: TSuiteCreativeSSEDirection[] | undefined;
  guidelineStatus: "generating" | "complete";
  // guideline stage errored (message.error non-system) before block could render → run() advances.
  guidelineAbandoned: boolean;
  // generating block completed before it had a chance to render → finish on run().
  generatingDoneEarly: boolean;
  // Turn ended (message.done) while the generate stage was still open and produced nothing —
  // the queued generating block must not render at all; run() just advances the queue.
  generatingAbandoned: boolean;
  // Minimum visible duration enforcement: timestamp when generating block rendered + random target.
  generatingStartedAt: number | null;
  generatingMinDurationMs: number;
  generatingTimer: ReturnType<typeof setTimeout> | null;
  generatedEnqueued: boolean;
  generatedImages: string[];
  generatedImageIds: string[];
  // Stream finished (message.done seen): the delivered image count is now final, so the generated
  // grid must size to the actual outputs received — NOT the analysis-planned count — otherwise a
  // shortfall (planned 3, got 2) leaves a trailing null slot stuck as a skeleton when the block
  // renders AFTER message.done (queue hadn't reached it yet, so the done-shrink was a no-op).
  streamDone: boolean;
  botTimers: Map<string, ReturnType<typeof setTimeout>>;
  // Every assistant block id created this turn — removed wholesale when an error replaces them.
  streamedIds: string[];
  errored: boolean;
  // The image-gen analytics action, captured from the `generating` stage (logo_design only). null
  // when this turn produced no image generation (e.g. chat-only) → no image_gen event is fired.
  imageGenAction: SuiteImageGenAction | null;
}

const createState = (): CoordinatorState => ({
  botTimers: new Map(),
  createImageCount: 1,
  errored: false,
  generatedEnqueued: false,
  generatedId: null,
  generatedImageIds: [],
  generatedImages: [],
  generatingAbandoned: false,
  generatingDoneEarly: false,
  generatingId: null,
  generatingMinDurationMs: 0,
  generatingStartedAt: null,
  generatingTimer: null,
  guidelineAbandoned: false,
  guidelineDirections: undefined,
  guidelineId: null,
  guidelineSections: [],
  guidelineStatus: "generating",
  guidelineTitle: "Design concepts",
  imageGenAction: null,
  streamDone: false,
  streamedIds: [],
  thinkingGapMs: 0,
  thinkingId: null,
  thinkingInProgressAt: null,
  thinkingPendingResult: null,
  thinkingResultTimer: null,
  thinkingSteps: [],
  thinkingTitle: "Though",
});

const analysisStepsFromData = (
  data: NonNullable<TSuiteCreativeSSEAnalysisReadyPayload["payload"]["data"]>
): ThinkingStep[] =>
  [
    data.brand_name && { description: data.brand_name, label: "Brand name" },
    data.industry && { description: data.industry, label: "Industry" },
    data.logo_type && { description: data.logo_type, label: "Type" },
    data.style && { description: data.style, label: "Style" },
  ].filter((s): s is ThinkingStep => Boolean(s));

const getGuidelineSections = (
  directions: TSuiteCreativeSSEDirection[]
): DesignGuidelineSection[] => {
  const transformed = new TransformerBuilder(SuiteCreativeDirectionModel)
    .format(directions, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeDirectionModel[];
  return transformed.map((d) => ({
    coreConcept: d.coreConcept,
    label: d.title,
  }));
};

/**
 * Builds the SSE handlers around a single sequential animation queue. Every block — for both
 * create and edit — is enqueued in SSE arrival order and rendered one at a time: the next block
 * only appears once the current one signals done (bot: Streamdown onAnimationEnd; thinking/
 * guideline: usePhaseAnimation onComplete; generating: generate stage "complete"; generated:
 * instant). No gate / no special create-vs-edit branching.
 */
export const createCreativeStreamCoordinator = ({
  generationId,
  store,
  assetType,
  onMessageDone,
  onError,
  scheduleAdvance,
  onQueueActiveChange,
}: CreativeStreamCoordinatorOptions) => {
  const state = createState();
  const queue: AnimationQueue = createAnimationQueue({
    onActiveChange: onQueueActiveChange,
    scheduleAdvance,
  });

  // ─── bot ────────────────────────────────────────────────────────────────────
  const enqueueBot = (text: string) => {
    const id = generateRandomUUIDV4();
    state.streamedIds.push(id);
    queue.enqueue({
      doneSignal: "anim",
      id,
      kind: SUITE_BLOCK_KIND.BOT,
      onDone: () => {
        const timer = state.botTimers.get(id);
        if (timer) {
          clearTimeout(timer);
          state.botTimers.delete(id);
        }
        // Ensure the full text is shown even if the queue advanced before the reveal finished
        // (e.g. cancel / forced markDone), and stop the streaming animation.
        store.getState().updateItem(id, (item) => {
          if (item?.type === CONVERSATION_ITEM_TYPE.BOT) {
            item.text = text;
            item.isAnimating = false;
          }
        });
      },
      run: () => {
        // Reveal the text progressively (grow the string) so Streamdown animates it as a real
        // stream and fades each newly-appended tail — works for single- AND multi-block markdown.
        // Streamdown has no real animation-complete event, so once fully revealed we wait the last
        // chunk's fade time, then advance the queue.
        const { stagger, duration } = SUITE_TEXT_ANIMATION;
        const tickMs = BOT_REVEAL_CHARS_PER_TICK * stagger;
        const total = text.length;
        // Whitespace is revealed for free (Streamdown gives it no stagger slot), so the pace is set
        // by the count of NON-whitespace chars only.
        const totalNonWs = text.replaceAll(/\s/gu, "").length;
        store
          .getState()
          .appendItem({ id, isAnimating: true, text: "", type: "bot" });

        // Time-based reveal: each tick reveals up to (elapsed / stagger) non-whitespace chars by
        // REAL elapsed time, not a fixed +N per tick. As the message grows, each render gets heavier
        // (Streamdown re-parses the whole string and wraps every char in its own fade <span>), which
        // delays the next timer — a fixed-step loop would visibly slow toward the end. Time-basing
        // makes a delayed tick catch up (reveal a bit more) so the pace stays constant start→finish.
        const start = performance.now();
        let revealed = 0;
        let revealedNonWs = 0;
        const step = () => {
          const elapsed = performance.now() - start;
          const targetNonWs = Math.min(
            totalNonWs,
            Math.floor(elapsed / stagger) + BOT_REVEAL_CHARS_PER_TICK
          );
          while (revealed < total && revealedNonWs < targetNonWs) {
            if (isNonWhitespaceCharAt(text, revealed)) {
              revealedNonWs += 1;
            }
            revealed += 1;
          }
          // Never stop right after an emphasis-marker run (** / __ / *). On its own that line gets
          // auto-closed by Streamdown's incomplete-markdown parser into **** — a line of only
          // asterisks, i.e. a thematic break — which renders an <hr> border for one frame (flick).
          // Pull in the following char so the opening delimiter is never alone on a line.
          while (
            revealed < total &&
            (text[revealed - 1] === "*" || text[revealed - 1] === "_")
          ) {
            if (isNonWhitespaceCharAt(text, revealed)) {
              revealedNonWs += 1;
            }
            revealed += 1;
          }
          // Stop right after the last revealed non-whitespace char — do NOT pull the next line's
          // leading whitespace/indentation ahead of its first visible char. Revealing a dangling
          // "\n    " (e.g. a 4-space-indented nested bullet) makes Streamdown briefly parse it as an
          // indented code block, whose bordered wrapper flickers in until the bullet char arrives.
          // Trailing whitespace then rides the NEXT tick together with the char that follows it.
          // Once every non-whitespace char is out, flush the remaining trailing whitespace so we
          // actually reach the end (otherwise markDone would never fire).
          if (revealedNonWs >= totalNonWs) {
            revealed = total;
          }
          const slice = text.slice(0, revealed);
          store.getState().updateItem(id, (item) => {
            if (item?.type === CONVERSATION_ITEM_TYPE.BOT) {
              item.text = slice;
            }
          });
          if (revealed >= total) {
            state.botTimers.set(
              id,
              setTimeout(() => queue.markDone(id), tickMs + duration)
            );
            return;
          }
          state.botTimers.set(id, setTimeout(step, tickMs));
        };
        step();
      },
    });
  };

  // ─── thinking ─────────────────────────────────────────────────────────────────
  // Reveal the buffered analysis result on the (already-rendered) thinking block. Steps then
  // animate via usePhaseAnimation, which calls markDone — except an empty result, advanced here.
  const applyThinkingResult = () => {
    const result = state.thinkingPendingResult;
    if (!result || state.thinkingId === null) {
      return;
    }
    state.thinkingPendingResult = null;
    if (result.title) {
      state.thinkingTitle = result.title;
    }
    state.thinkingSteps = result.steps;
    store.getState().updateItem(state.thinkingId, (item) => {
      if (item?.type === CONVERSATION_ITEM_TYPE.THINKING) {
        if (result.title) {
          item.title = result.title;
        }
        item.steps = result.steps;
      }
    });
    if (result.steps.length === 0) {
      queue.markDone(state.thinkingId);
    }
  };

  const enqueueThinking = (message: string | null) => {
    if (state.thinkingId !== null) {
      if (message) {
        state.thinkingTitle = message;
        if (queue.hasRun(state.thinkingId)) {
          store.getState().updateItem(state.thinkingId, (item) => {
            if (item?.type === CONVERSATION_ITEM_TYPE.THINKING) {
              item.title = message;
            }
          });
        }
      }
      return;
    }

    const id = generateRandomUUIDV4();
    state.thinkingId = id;
    state.streamedIds.push(id);
    state.thinkingInProgressAt = performance.now(); // start of the analyze gap measurement
    if (message) {
      state.thinkingTitle = message;
    }
    queue.enqueue({
      id,
      kind: SUITE_BLOCK_KIND.THINKING,
      doneSignal: "anim",
      run: () => {
        // Always render the in-progress snapshot first: in-progress title + NO steps (steps
        // belong to the "Thought" result). Empty steps + isAnimating → usePhaseAnimation never
        // completes, so the block holds "Analyzing..." until the result is applied — mirrors the
        // guideline's "Drafting..." → "Design Concepts" behavior.
        store.getState().appendItem({
          id,
          isAnimating: true,
          isOpen: true,
          status: "generating",
          steps: [],
          title: state.thinkingTitle,
          type: "thinking",
        });
        // analysis.ready already arrived (its in-progress window was eaten by the bot) → replay
        // the real analyze gap (+buffer) so "Analyzing..." is visible, then reveal the result.
        if (state.thinkingPendingResult) {
          state.thinkingResultTimer = setTimeout(
            applyThinkingResult,
            state.thinkingGapMs + THINKING_RESULT_DELAY_BUFFER_MS
          );
        }
      },
      // Thinking is persistent (NOT removed), but collapses on done like the guideline: mark
      // complete, stop animating, and close it (isOpen=undefined) so the header shows the expand
      // chevron and the steps stay available behind it.
      // Exception: when all brand fields were empty (no steps), remove the block entirely.
      onDone: () => {
        if (state.thinkingSteps.length === 0) {
          store.getState().removeItem(id);
          return;
        }
        store.getState().updateItem(id, (item) => {
          if (item?.type === CONVERSATION_ITEM_TYPE.THINKING) {
            item.status = "complete";
            item.isAnimating = false;
            item.isOpen = undefined;
          }
        });
      },
    });
  };

  const fillThinking = (payload: TSuiteCreativeSSEAnalysisReadyPayload) => {
    const { data } = payload.payload;
    if (!data) {
      return;
    }

    state.createImageCount = Math.max(data.count, 1);
    store.getState().setPendingSkeletonHint({
      assetType,
      count: state.createImageCount,
      generationId,
    });
    const steps = analysisStepsFromData(data);
    const { message } = parseStageInfo(payload); // "Thought"

    // No block enqueued (defensive) → stash so a later render shows the result directly.
    if (state.thinkingId === null) {
      if (message) {
        state.thinkingTitle = message;
      }
      state.thinkingSteps = steps;
      return;
    }

    if (queue.hasRun(state.thinkingId)) {
      // Block already rendered "Analyzing..." (natural case: analysis.ready arrived after the
      // block rendered) → reveal the result now.
      if (message) {
        state.thinkingTitle = message;
      }
      state.thinkingSteps = steps;
      store.getState().updateItem(state.thinkingId, (item) => {
        if (item?.type === CONVERSATION_ITEM_TYPE.THINKING) {
          if (message) {
            item.title = message;
          }
          item.steps = steps;
        }
      });
      // No steps to animate → usePhaseAnimation never completes; advance the queue ourselves.
      if (steps.length === 0) {
        queue.markDone(state.thinkingId);
      }
    } else {
      // Block NOT rendered yet (its in-progress window was eaten by the bot anim) → buffer the
      // result + measured analyze gap WITHOUT overwriting thinkingTitle/Steps; run() will render
      // "Analyzing..." then apply this after the gap (mirrors the guideline's deferred reveal).
      state.thinkingPendingResult = { steps, title: message };
      state.thinkingGapMs =
        state.thinkingInProgressAt === null
          ? 0
          : Math.min(
              performance.now() - state.thinkingInProgressAt,
              THINKING_MAX_GAP_MS
            );
    }
  };

  // ─── guideline ──────────────────────────────────────────────────────────────
  const enqueueGuideline = (message: string | null) => {
    if (state.guidelineId !== null) {
      if (message) {
        state.guidelineTitle = message;
        if (queue.hasRun(state.guidelineId)) {
          store.getState().updateItem(state.guidelineId, (item) => {
            if (item?.type === CONVERSATION_ITEM_TYPE.DESIGN_GUIDELINES) {
              item.title = message;
            }
          });
        }
      }
      return;
    }

    const id = generateRandomUUIDV4();
    state.guidelineId = id;
    state.streamedIds.push(id);
    if (message) {
      state.guidelineTitle = message;
    }
    queue.enqueue({
      id,
      kind: SUITE_BLOCK_KIND.GUIDELINE,
      doneSignal: "anim",
      run: () => {
        if (state.guidelineAbandoned) {
          queue.markDone(id);
          return;
        }
        const item = {
          id,
          type: "design-guidelines" as const,
          title: state.guidelineTitle,
          status: state.guidelineStatus,
          sections: state.guidelineSections,
          ...(state.guidelineDirections && {
            directions: state.guidelineDirections,
          }),
          isOpen: true,
          isAnimating: true,
        };
        if (state.generatingId === null) {
          store.getState().appendItem(item);
        } else {
          store.getState().insertBefore(state.generatingId, item);
        }
      },
      // Collapse + stop animating as soon as the guideline finishes its own animation.
      onDone: () => {
        store.getState().updateItem(id, (item) => {
          if (item?.type === CONVERSATION_ITEM_TYPE.DESIGN_GUIDELINES) {
            item.isAnimating = false;
            item.isOpen = undefined;
          }
        });
      },
    });
  };

  const fillGuideline = (payload: TSuiteCreativeSSEPlanReadyPayload) => {
    const directions = payload.payload.data?.concept_direction;
    if (!directions) {
      return;
    }

    const sections = getGuidelineSections(directions);
    const { message } = parseStageInfo(payload);
    state.guidelineSections = sections;
    state.guidelineDirections = directions;
    state.guidelineStatus = "complete";
    if (message) {
      state.guidelineTitle = message;
    }

    if (state.guidelineId === null) {
      enqueueGuideline(message);
    }

    if (state.guidelineId !== null && queue.hasRun(state.guidelineId)) {
      store.getState().updateItem(state.guidelineId, (item) => {
        if (item?.type === CONVERSATION_ITEM_TYPE.DESIGN_GUIDELINES) {
          item.title = state.guidelineTitle;
          item.status = "complete";
          item.sections = sections;
          item.directions = directions;
          item.isAnimating = true;
        }
      });
    }
    // No sections to animate → advance so the queue doesn't stall on guideline.
    if (sections.length === 0 && state.guidelineId !== null) {
      queue.markDone(state.guidelineId);
    }
  };

  // ─── generating (live skeleton) ───────────────────────────────────────────────
  const enqueueGenerating = (message: string | null) => {
    if (state.generatingId !== null) {
      if (message && queue.hasRun(state.generatingId)) {
        store.getState().updateItem(state.generatingId, (item) => {
          if (item?.type === CONVERSATION_ITEM_TYPE.GENERATING) {
            item.message = message;
          }
        });
      }
      return;
    }

    const id = generateRandomUUIDV4();
    state.generatingId = id;
    state.streamedIds.push(id);
    // Canvas skeleton count = the analysis-planned image count, regardless of edit/create/inpaint
    // modeHint. The mode is the BE operation type, NOT a reliable image-count signal (a follow-up
    // "edit" can still generate N images, e.g. "tạo 10 logo"). The generated grid
    // (buildGeneratedImages) is already sized from createImageCount, so this keeps the canvas
    // skeletons in sync with it instead of always defaulting non-create turns to 1.
    const imageCount = state.createImageCount;
    queue.enqueue({
      doneSignal: "event",
      id,
      kind: SUITE_BLOCK_KIND.GENERATING,
      run: () => {
        // Turn already settled with nothing generated (message.done while the stage was still
        // open) → don't render a stale "Generating..." card, just let the queue move on.
        if (state.generatingAbandoned) {
          queue.markDone(id);
          return;
        }
        state.generatingStartedAt = performance.now();
        state.generatingMinDurationMs =
          MIN_GENERATING_VISIBLE_MS +
          Math.random() *
            (MAX_GENERATING_VISIBLE_MS - MIN_GENERATING_VISIBLE_MS);
        store.getState().appendItem({
          assetType,
          durationMs: DEFAULT_GENERATING_DURATION_MS,
          generationId,
          id,
          imageCount,
          type: "generating",
          ...(message && { message }),
        });
        // Generation already finished before the skeleton got its turn → honour min duration,
        // then release (the skeleton stays in the DOM until generated replaces it).
        if (state.generatingDoneEarly) {
          const elapsed = performance.now() - state.generatingStartedAt;
          const remaining = Math.max(
            0,
            state.generatingMinDurationMs - elapsed
          );
          state.generatingTimer = setTimeout(
            () => queue.markDone(id),
            remaining
          );
        }
      },
    });
  };

  const markGeneratingDone = () => {
    if (state.generatingId === null) {
      return;
    }
    const id = state.generatingId;
    if (queue.hasRun(id)) {
      const elapsed =
        state.generatingStartedAt === null
          ? Infinity
          : performance.now() - state.generatingStartedAt;
      const remaining = Math.max(0, state.generatingMinDurationMs - elapsed);
      if (remaining > 0) {
        state.generatingTimer = setTimeout(() => queue.markDone(id), remaining);
      } else {
        queue.markDone(id);
      }
    } else {
      state.generatingDoneEarly = true;
    }
  };

  // ─── generated (images) ───────────────────────────────────────────────────────
  // Builds the generated block's image grid from the accumulated images. Pre-sized to the
  // planned count (analysis) so not-yet-arrived slots render as skeleton and it matches the
  // canvas skeletons; grows if more images than planned actually arrive.
  const buildGeneratedImages = (): (string | null)[] => {
    // While streaming, pre-size to the analysis-planned count so not-yet-arrived slots render as
    // skeleton (and match the canvas skeletons). Once the stream is done the planned count is no
    // longer the source of truth — size to the actual images received so a shortfall (planned 3,
    // got 2) doesn't leave a trailing null slot stuck as a skeleton.
    const slotCount = state.streamDone
      ? Math.max(state.generatedImages.length, 1)
      : Math.max(state.createImageCount, state.generatedImages.length, 1);
    const arr: (string | null)[] = Array.from<string | null>({
      length: slotCount,
    }).fill(null);
    for (const [i, url] of state.generatedImages.entries()) {
      arr[i] = url;
    }
    return arr;
  };
  const buildGeneratedTitle = () =>
    `Generated ${state.generatedImages.length === 1 ? "image" : "images"}`;

  const handleOutput = (payload: TSuiteCreativeSSEOutputReadyPayload) => {
    // An output.ready can carry MULTIPLE images, and `image.total` is the count in THIS event
    // (per-event), NOT the grand total — so loop every image and accumulate. The running total
    // is simply generatedImages.length (no summing of `total` needed once all urls are kept).
    const images = payload.payload.data?.images ?? [];
    if (images.length === 0) {
      return;
    }
    for (const image of images) {
      state.generatedImages.push(image.download_url);
      state.generatedImageIds.push(image.image_id);
    }

    if (!state.generatedEnqueued) {
      state.generatedEnqueued = true;
      const id = generateRandomUUIDV4();
      state.generatedId = id;
      state.streamedIds.push(id);
      queue.enqueue({
        doneSignal: "instant",
        id,
        kind: SUITE_BLOCK_KIND.GENERATED_IMAGE,
        run: () => {
          // Remove the skeleton the moment images appear — order-independent.
          if (state.generatingId !== null) {
            store.getState().removeItem(state.generatingId);
            state.generatingId = null;
          }
          store.getState().appendItem({
            assetType,
            generationId,
            id,
            imageIds: [...state.generatedImageIds],
            images: buildGeneratedImages(),
            title: buildGeneratedTitle(),
            type: "generated",
          });
        },
      });
      return;
    }

    // Later images for an already-rendered generated block → rebuild from the accumulated set.
    if (state.generatedId !== null && queue.hasRun(state.generatedId)) {
      store.getState().updateItem(state.generatedId, (item) => {
        if (item?.type === CONVERSATION_ITEM_TYPE.GENERATED) {
          item.title = buildGeneratedTitle();
          item.images = buildGeneratedImages();
          item.imageIds = [...state.generatedImageIds];
        }
      });
    }
  };

  // ─── error ──────────────────────────────────────────────────────────────────
  // Break the queue and replace THIS turn's streamed assistant blocks with a single error
  // card. User message + prior history stay. Does NOT throw (so no rollback), but DOES toast
  // via onError(). Triggered by message.error / stream.error / ai.error events and by any
  // `generating` stage with status "error".
  // keepRendered=false (default): wipe this turn's streamed assistant blocks, leaving only the error
  // card (used by the fully-fatal paths — stream.error / ai.error / generating-stage error).
  // keepRendered=true: keep the blocks already rendered and just append the error card after them
  // (used by a system-stage message.error, where the partial response so far should remain visible).
  const renderError = ({
    keepRendered = false,
  }: { keepRendered?: boolean } = {}) => {
    if (state.errored) {
      return;
    }
    state.errored = true;

    for (const timer of state.botTimers.values()) {
      clearTimeout(timer);
    }
    state.botTimers.clear();
    queue.reset();

    if (!keepRendered) {
      for (const id of state.streamedIds) {
        store.getState().removeItem(id);
      }
      state.streamedIds = [];
    }
    // Tag the error item with THIS turn's generationId so the canvas can scope the failed-skeleton
    // cleanup to the turn that actually failed — a later turn must not be treated as failed just
    // because a prior turn's error card still sits in the conversation.
    store.getState().appendItem({ generationId, type: "error" });

    onError?.();
    onMessageDone();
  };

  // ─── handlers (switch on event + stage.status) ─────────────────────────────────
  const handlers: Partial<TSuiteCreativeSSEHandlers> = {
    [SUITE_CREATIVE_STREAM_EVENT.MESSAGE_SUMMARY]: (payload) => {
      if (state.errored) {
        return;
      }
      if (payload.payload.text) {
        enqueueBot(payload.payload.text);
      }
    },
    [SUITE_CREATIVE_STREAM_EVENT.GENERATING]: (payload) => {
      if (state.errored) {
        return;
      }
      const { stageName, stageStatus, message } = parseStageInfo(payload);
      // Capture the image_gen analytics action the moment its generating stage arrives — logo_design
      // only (other task_types are tracked separately later). Fired once the stream ends.
      if (
        payload.task_type === SUITE_CREATIVE_TASK_TYPE.LOGO_DESIGN &&
        stageName
      ) {
        const imageGenAction = IMAGE_GEN_ACTION_BY_STAGE[stageName];
        if (imageGenAction) {
          state.imageGenAction = imageGenAction;
        }
      }
      if (stageName === SUITE_CREATIVE_STREAM_STAGE.STARTED) {
        return;
      }

      if (stageStatus === SUITE_CREATIVE_STAGE_STATUS.ERROR) {
        renderError();
        return;
      }

      const desc = resolveStage(payload.task_type, stageName);
      if (!desc) {
        return;
      }

      if (stageStatus === SUITE_CREATIVE_STAGE_STATUS.IN_PROGRESS) {
        if (desc.block === SUITE_BLOCK_KIND.THINKING) {
          enqueueThinking(message);
        } else if (desc.block === SUITE_BLOCK_KIND.GUIDELINE) {
          enqueueGuideline(message);
        } else if (desc.block === SUITE_BLOCK_KIND.GENERATING) {
          enqueueGenerating(message);
        }
      } else if (
        stageStatus === SUITE_CREATIVE_STAGE_STATUS.COMPLETE &&
        desc.block === SUITE_BLOCK_KIND.GENERATING
      ) {
        markGeneratingDone();
      }
    },
    [SUITE_CREATIVE_STREAM_EVENT.ANALYSIS_READY]: (payload) => {
      // if (state.errored) return;
      fillThinking(payload);
    },
    [SUITE_CREATIVE_STREAM_EVENT.PLAN_READY]: (payload) => {
      if (state.errored) {
        return;
      }
      fillGuideline(payload);
    },
    [SUITE_CREATIVE_STREAM_EVENT.OUTPUT_READY]: (payload) => {
      if (state.errored) {
        return;
      }
      handleOutput(payload);
    },
    [SUITE_CREATIVE_STREAM_EVENT.MESSAGE_DONE]: () => {
      // Stream ended → the delivered image count is final. Flag it so any generated block that
      // still renders AFTER this point (queue hadn't reached it yet) sizes its grid to the actual
      // outputs instead of the analysis-planned count.
      state.streamDone = true;
      // Turn ended with NO image output (e.g. BE returned a clarification instead of
      // generating). generatedEnqueued flips true the moment the first output.ready arrives
      // — independent of the animation queue — so it reliably means "no output is coming",
      // unlike isStreaming (which the queue outlives). Signal the canvas (keyed by this
      // turn's generationId) to drop its orphan skeletons / annotations. The error path
      // handles its own cleanup, so skip when errored.
      if (!state.generatedEnqueued && !state.errored) {
        store.getState().markTurnSettledWithoutOutput(generationId);
        // The generate stage can end up STUCK open: BE sent `generating in-progress` but finished
        // the turn without ever sending the stage's `complete`, an output.ready, or any error
        // event (e.g. a safety refusal answered via a plain summary). The generating block's
        // doneSignal is "event", so nothing would ever release it and every block queued behind
        // it (like that refusal summary) would never render. The stream is over — no more events
        // can come — so release it ourselves: drop the stale "Generating..." card and advance.
        if (state.generatingId !== null) {
          if (queue.hasRun(state.generatingId)) {
            store.getState().removeItem(state.generatingId);
            queue.markDone(state.generatingId);
          } else {
            state.generatingAbandoned = true;
          }
        }
      }
      // Stream is over → the delivered count is final. If BE delivered FEWER images than the
      // planned count (e.g. count 5, got 4), the grid was pre-sized to count and still holds
      // trailing null slots (skeletons). Shrink images to exactly what arrived so the grid
      // drops the phantom slot AND images.every(!== null) becomes true → the canvas effect
      // runs trimOrphanSkeletons to clear the leftover loading card. No-op when count matched.
      if (
        state.generatedEnqueued &&
        state.generatedId !== null &&
        !state.errored
      ) {
        store.getState().updateItem(state.generatedId, (item) => {
          if (item?.type === CONVERSATION_ITEM_TYPE.GENERATED) {
            item.images = [...state.generatedImages];
            item.imageIds = [...state.generatedImageIds];
            item.title = buildGeneratedTitle();
          }
        });
      }
      onMessageDone();
    },
    [SUITE_CREATIVE_STREAM_EVENT.MESSAGE_ERROR]: (payload) => {
      // Only a system-stage error is fatal: switch to the error card but KEEP what's already rendered.
      // Any other stage's message.error is non-fatal — BE keeps streaming, so leave the UI untouched
      // and let the following events render. (message.error is not a terminal event for this reason.)
      const { stageName } = parseStageInfo(payload);
      if (stageName === SUITE_CREATIVE_STREAM_STAGE.SYSTEM) {
        renderError({ keepRendered: true });
        return;
      }
      // Non-system error: release any stuck guideline block so the queue can advance to render
      // the subsequent summary/apology that BE continues to stream after a non-fatal error.
      if (state.guidelineId !== null) {
        if (queue.hasRun(state.guidelineId)) {
          store.getState().removeItem(state.guidelineId);
          queue.markDone(state.guidelineId);
        } else {
          state.guidelineAbandoned = true;
        }
      }
    },
    [SUITE_CREATIVE_STREAM_EVENT.STREAM_ERROR]: () => renderError(),
    [SUITE_CREATIVE_STREAM_EVENT.AI_ERROR]: () => renderError(),
  };

  return {
    dispose: () => {
      for (const timer of state.botTimers.values()) {
        clearTimeout(timer);
      }
      state.botTimers.clear();
      if (state.thinkingResultTimer) {
        clearTimeout(state.thinkingResultTimer);
      }
      state.thinkingResultTimer = null;
      queue.reset();
    },
    /**
     * Read once the stream has ended to emit the image_gen analytics event. `action` is null when
     * this turn produced no logo_design image generation (e.g. chat-only) → caller fires nothing.
     * `failed` is true if a fatal error rendered (stream.error / ai.error / message.error system).
     */
    getImageGenResult: (): {
      action: SuiteImageGenAction | null;
      failed: boolean;
    } => ({
      action: state.imageGenAction,
      failed: state.errored,
    }),
    handlers,
    /** Called by the UI when a block's animation completes (bot/thinking/guideline). */
    onBlockAnimationComplete: (id?: string) => {
      if (id) {
        queue.markDone(id);
      }
    },
  };
};
