import type { SuiteBlockKind } from "@/features/suite/utils/constants/design-studio-stream";

/**
 * How a queue step signals it is done (so the queue can advance to the next block):
 * - "anim":    a UI animation finishes and calls markDone(id). Streamdown has no real
 *              animation-complete event, so the bot block advances via an estimated timer
 *              (getTextAnimationDurationMs); thinking/guideline advance via usePhaseAnimation
 *              onComplete (also timer-based, derived from the same shared config).
 * - "event":   an external SSE event marks it done (generating → stage.status "complete").
 *              The rendered item stays in the DOM; only the queue advances.
 * - "instant": done immediately after run() (generated images — no animation to wait for).
 */
export type QueueStepDoneSignal = "anim" | "event" | "instant";

export interface QueueStep {
  /** Stable id, shared with the store item this step renders. */
  id: string;
  kind: SuiteBlockKind;
  doneSignal: QueueStepDoneSignal;
  /** Appends/inserts the item into the store so the component mounts and starts animating. */
  run: () => void;
  /** Side effect to run when this step completes (e.g. close thinking, remove skeleton). */
  onDone?: () => void;
}

export interface AnimationQueue {
  /** Push a step to the tail and try to advance. */
  enqueue: (step: QueueStep) => void;
  /** Signal a step finished (idempotent). Advances the queue. */
  markDone: (id: string) => void;
  /** Whether a step with this id has already started rendering. */
  hasRun: (id: string) => boolean;
  reset: () => void;
}

type InternalStep = QueueStep & { hasRun: boolean; done: boolean };

export interface CreateAnimationQueueOptions {
  /**
   * Defers advancing the queue out of the current call stack. Animation-complete callbacks
   * fire inside React effects/DOM events; deferring avoids appending the next item mid-lifecycle.
   * Defaults to running synchronously (callers that aren't in a render path can use that).
   */
  scheduleAdvance?: (cb: () => void) => void;
  /**
   * Fires when the queue transitions between "has undone steps" (true) and "fully drained" (false).
   * Lets callers keep UI busy until the LAST block finishes animating, not just until the network
   * stream ends. Only fires on a change, so it's safe to wire to React state.
   */
  onActiveChange?: (active: boolean) => void;
}

/**
 * A single sequential FIFO that renders blocks one at a time: the next block only runs after
 * the current one signals done. Fully task-agnostic — it knows nothing about logo/video, only
 * QueueSteps. Mapping SSE → steps lives in the coordinator + pipeline registry.
 */
export const createAnimationQueue = (
  options: CreateAnimationQueueOptions = {}
): AnimationQueue => {
  const schedule = options.scheduleAdvance ?? ((cb: () => void) => cb());
  const steps: InternalStep[] = [];
  let activeId: string | null = null;
  let lastActive = false;

  // Active = at least one enqueued step hasn't finished yet. Emit only on change.
  const emitActive = () => {
    const active = steps.some((step) => !step.done);
    if (active !== lastActive) {
      lastActive = active;
      options.onActiveChange?.(active);
    }
  };

  const pump = () => {
    if (activeId !== null) {
      return;
    } // a block is animating → wait for its markDone
    const next = steps.find((step) => !step.done && !step.hasRun);
    if (!next) {
      return;
    }

    next.hasRun = true;
    activeId = next.id;
    next.run();

    if (next.doneSignal === "instant") {
      finish(next.id);
    }
  };

  const finish = (id: string) => {
    const step = steps.find((s) => s.id === id);
    if (!step || step.done) {
      return;
    } // idempotent

    step.done = true;
    if (activeId === id) {
      activeId = null;
    }
    step.onDone?.();
    pump();
    // After pump (which may have started the next step) → emit so we go idle only when truly drained.
    emitActive();
  };

  return {
    enqueue: (step) => {
      steps.push({ ...step, done: false, hasRun: false });
      emitActive();
      pump();
    },
    hasRun: (id) => steps.find((s) => s.id === id)?.hasRun ?? false,
    markDone: (id) => {
      schedule(() => finish(id));
    },
    reset: () => {
      steps.length = 0;
      activeId = null;
      emitActive();
    },
  };
};
