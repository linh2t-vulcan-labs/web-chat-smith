const fencePattern = /^ {0,3}(?<marker>`{3,}|~{3,})/u;

type LineKind =
  | { kind: "fenceOpen"; marker: string }
  | { kind: "fenceClose" }
  | { kind: "fenceContinue" }
  | { kind: "mathOpen" }
  | { kind: "mathClose" }
  | { kind: "mathContinue" }
  | { kind: "blank" }
  | { kind: "text" };

const closesFence = (marker: string | undefined, fenceMarker: string) =>
  marker !== undefined &&
  marker[0] === fenceMarker[0] &&
  marker.length >= fenceMarker.length;

const classifyInsideFence = (line: string, fenceMarker: string): LineKind => {
  const fenceMatch = fencePattern.exec(line);
  const marker = fenceMatch?.groups?.marker;
  return closesFence(marker, fenceMarker)
    ? { kind: "fenceClose" }
    : { kind: "fenceContinue" };
};

const classifyInsideMath = (line: string): LineKind =>
  line.trim() === "$$" ? { kind: "mathClose" } : { kind: "mathContinue" };

const classifyOutsideBlock = (line: string): LineKind => {
  const fenceMatch = fencePattern.exec(line);
  const marker = fenceMatch?.groups?.marker;
  if (marker) {
    return { kind: "fenceOpen", marker };
  }
  const trimmed = line.trim();
  if (trimmed === "$$") {
    return { kind: "mathOpen" };
  }
  if (trimmed === "") {
    return { kind: "blank" };
  }
  return { kind: "text" };
};

const classifyLine = (
  line: string,
  fenceMarker: string | null,
  inMathBlock: boolean
): LineKind => {
  if (fenceMarker) {
    return classifyInsideFence(line, fenceMarker);
  }
  if (inMathBlock) {
    return classifyInsideMath(line);
  }
  return classifyOutsideBlock(line);
};

interface SplitState {
  blocks: string[];
  current: string[];
  fenceMarker: string | null;
  inMathBlock: boolean;
}

const flushBlock = (state: SplitState) => {
  if (state.current.length > 0) {
    state.blocks.push(state.current.join("\n"));
    state.current = [];
  }
};

type ContinuationHandler = (state: SplitState, line: string) => void;

const continuationHandlers: Record<
  Exclude<LineKind["kind"], "fenceOpen">,
  ContinuationHandler
> = {
  blank: (state) => flushBlock(state),
  fenceClose: (state, line) => {
    state.fenceMarker = null;
    state.current.push(line);
  },
  fenceContinue: (state, line) => state.current.push(line),
  mathClose: (state, line) => {
    state.inMathBlock = false;
    state.current.push(line);
  },
  mathContinue: (state, line) => state.current.push(line),
  mathOpen: (state, line) => {
    state.inMathBlock = true;
    state.current.push(line);
  },
  text: (state, line) => state.current.push(line),
};

/**
 * Splits markdown into top-level blocks on blank-line boundaries, without
 * splitting inside a fenced code block or a `$$...$$` block. Paired with a
 * memoized per-block renderer, this is what keeps streaming smooth: only the
 * block that's still growing needs to re-parse on each token, instead of the
 * whole message re-parsing (and its whole tree re-rendering) from scratch
 * every time.
 */
export const splitMarkdownIntoBlocks = (markdown: string): string[] => {
  const state: SplitState = {
    blocks: [],
    current: [],
    fenceMarker: null,
    inMathBlock: false,
  };

  for (const line of markdown.split("\n")) {
    const lineKind = classifyLine(line, state.fenceMarker, state.inMathBlock);

    if (lineKind.kind === "fenceOpen") {
      state.fenceMarker = lineKind.marker;
      state.current.push(line);
      continue;
    }

    continuationHandlers[lineKind.kind](state, line);
  }
  flushBlock(state);

  return state.blocks;
};
