"use client";

import React, { useCallback, useEffect, useRef } from "react";

type FontSize = number;
interface CTATextAnimationProps {
  words: string[];
  color?: string;
  className?: string;
  size?: FontSize;
}

const DEFAULT_WORDS = ["Web Search", "Deep Research", "Real-time Search"];

function at<T>(arr: T[], index: number): T {
  const value = arr[index];
  if (value === undefined) {
    throw new Error(`Index ${index} out of bounds`);
  }
  return value;
}

const CTATextAnimation: React.FC<CTATextAnimationProps> = ({
  words = DEFAULT_WORDS,
  color = "#408977",
  className = "",
  size = 20,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const stateRef = useRef({
    H: 300,
    PX: 150,
    W: 800,
    current: [] as number[][],
    dissolveTarget: [] as number[][],
    dpr: 1,
    frame: 0,
    phase: 0,
    scale: 1,
    targetPerWord: [] as number[][][],
    tmpA: [] as number[][],
    wordIdx: 0,
  });

  // Constants
  const LEFT_PAD = 5;
  const SIDE_PAD = 50;
  const TOP_PAD = 20;
  const BASE_PX = size * 4.5; // Scale base font size based on size prop
  const PARTICLES = 6000;
  const MORPH_STEPS = 40; // Animate word
  const HOLD_STEPS = 120; // Animate between works
  const DISSOLVE_STEPS = 43;

  // Calculate container dimensions based on size
  const getContainerDimensions = useCallback((fontSize: number) => {
    // Base dimensions for size 20
    const baseWidth = 201;
    const baseHeight = 44;
    const baseFontSize = 20;

    // Scale dimensions based on font size
    const scale = fontSize / baseFontSize;
    const width = Math.round(baseWidth * scale);
    const height = Math.round(baseHeight * scale);

    return { height, width };
  }, []);

  const { width, height } = getContainerDimensions(size);

  // Helper functions
  const ease = useCallback(
    (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
    []
  );

  const gauss = useCallback(
    (mu: number, sigma: number) =>
      mu +
      sigma *
        Math.sqrt(-2 * Math.log(Math.random())) *
        Math.cos(2 * Math.PI * Math.random()),
    []
  );

  const measureWord = useCallback(
    (ctx: CanvasRenderingContext2D, fontPx: number, w: string) => {
      ctx.font = `300 ${fontPx}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif`;
      const m = ctx.measureText(w);
      const ascent = m.actualBoundingBoxAscent || fontPx * 0.8;
      const descent = m.actualBoundingBoxDescent || fontPx * 0.2;
      return { ascent, descent, height: ascent + descent, width: m.width };
    },
    []
  );

  const computeCanvasForPX = useCallback(
    (ctx: CanvasRenderingContext2D, fontPx: number) => {
      const sizes = words.map((w) => measureWord(ctx, fontPx, w));
      const maxW = Math.max(...sizes.map((s) => s.width));
      const maxH = Math.max(...sizes.map((s) => s.height));
      const w = Math.max(Math.floor(maxW + LEFT_PAD + SIDE_PAD), 320);
      const h = Math.max(Math.floor(maxH + TOP_PAD * 2), 150);
      return { h, sizes, w };
    },
    [words, measureWord]
  );

  const makeMaskPoints = useCallback(
    (word: string, n: number, W: number, H: number, PX: number) => {
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const octx = off.getContext("2d");
      if (!octx) {
        throw new Error("Failed to get 2D context for offscreen canvas");
      }
      octx.textBaseline = "alphabetic";
      octx.textAlign = "left";
      octx.fillStyle = "#fff";
      octx.font = `300 ${PX}px Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif`;
      const m = measureWord(octx, PX, word);
      // Center text vertically in the canvas
      const y = (H - m.height) / 2 + m.ascent;
      octx.fillText(word, LEFT_PAD, y);
      const img = octx.getImageData(0, 0, W, H).data;
      const pts: number[][] = [];
      for (let y0 = 0; y0 < H; y0 += 1) {
        const row = y0 * W * 4;
        for (let x0 = 0; x0 < W; x0 += 1) {
          const a = img[row + x0 * 4 + 3] ?? 0;
          if (a > 10) {
            pts.push([x0, y0]);
          }
        }
      }
      const out: number[][] = Array.from({ length: PARTICLES });
      for (let i = 0; i < PARTICLES; i += 1) {
        out[i] = pts.length
          ? (pts[Math.trunc(Math.random() * pts.length)] ?? [0, 0])
          : [0, 0];
      }
      return out;
    },
    [measureWord]
  );

  const makeScatter = useCallback(
    (n: number, W: number, H: number, leftBias = 0.35) => {
      const out: number[][] = Array.from({ length: n });
      const cx = leftBias * W;
      const cy = 0.5 * H;
      const sx = 0.22 * W;
      const sy = 0.22 * H;
      for (let i = 0; i < n; i += 1) {
        let x = gauss(cx, sx);
        let y = gauss(cy, sy);
        x = Math.max(0, Math.min(W - 1, x));
        y = Math.max(0, Math.min(H - 1, y));
        out[i] = [x, y];
      }
      return out;
    },
    [gauss]
  );

  const renderParticles = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      arr: number[][],
      canvas: HTMLCanvasElement,
      W: number,
      H: number,
      scale: number,
      dpr: number
    ) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      for (const p of arr) {
        ctx.fillRect(Math.trunc(p[0] ?? 0), Math.trunc(p[1] ?? 0), 1, 1);
      }
    },
    [color]
  );

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      return;
    }

    ctx.imageSmoothingEnabled = false;

    const dpr = window.devicePixelRatio || 1;

    // Calculate canvas dimensions based on text size (like original)
    const dims = computeCanvasForPX(ctx, BASE_PX);
    const PX = BASE_PX;
    const W = dims.w;
    // Use fixed height to prevent text shifting
    const H = Math.max(dims.h, height);

    // Calculate scale to fit within container dimensions
    const sx = width / W;
    const sy = height / H;
    let scale = Math.min(sx, sy);

    // If text is too wide, prioritize height scaling to maintain text size
    if (W > width * 1.5) {
      scale = sy; // Use only height scaling to prevent text from being too small
    }

    // Ensure minimum scale for readability
    scale = Math.max(scale, 0.3);
    scale = Math.min(scale, 2);

    // Set canvas size with scaling
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
    canvas.width = Math.floor(W * scale * dpr);
    canvas.height = Math.floor(H * scale * dpr);

    const targetPerWord = words.map((w) =>
      makeMaskPoints(w, PARTICLES, W, H, PX)
    );
    const current = makeScatter(PARTICLES, W, H, 0.4);
    const dissolveTarget = makeScatter(PARTICLES, W, H, 0.3).map((p) => [
      (p[0] ?? 0) - Math.random() * (0.1 * W),
      p[1] ?? 0,
    ]);
    const tmpA: number[][] = Array.from({ length: PARTICLES });
    for (let i = 0; i < PARTICLES; i += 1) {
      tmpA[i] = [0, 0];
    }

    // Update state
    stateRef.current = {
      H,
      PX,
      W,
      current,
      dissolveTarget,
      dpr,
      frame: 0,
      phase: 0,
      scale,
      targetPerWord,
      tmpA,
      wordIdx: 0,
    };
  }, [
    words,
    makeMaskPoints,
    makeScatter,
    computeCanvasForPX,
    width,
    height,
    BASE_PX,
  ]);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      return;
    }

    const state = stateRef.current;
    let total: number;
    if (state.phase === 0) {
      total = MORPH_STEPS;
    } else if (state.phase === 1) {
      total = HOLD_STEPS;
    } else {
      total = DISSOLVE_STEPS;
    }
    const t = total <= 1 ? 1 : state.frame / (total - 1);
    const tt = ease(t);
    // targetPerWord/current/dissolveTarget/tmpA are all pre-filled with
    // exactly PARTICLES entries (see setup()), so indices 0..PARTICLES-1
    // are always populated.
    const targets = at(state.targetPerWord, state.wordIdx);

    if (state.phase === 0) {
      for (let i = 0; i < PARTICLES; i += 1) {
        const a = at(state.current, i);
        const b = at(targets, i);
        const tmp = at(state.tmpA, i);
        tmp[0] = at(a, 0) + (at(b, 0) - at(a, 0)) * tt;
        tmp[1] = at(a, 1) + (at(b, 1) - at(a, 1)) * tt;
      }
    } else if (state.phase === 1) {
      for (let i = 0; i < PARTICLES; i += 1) {
        const b = at(targets, i);
        const tmp = at(state.tmpA, i);
        tmp[0] = at(b, 0) + (Math.random() - 0.5) * 0.3;
        tmp[1] = at(b, 1) + (Math.random() - 0.5) * 0.3;
      }
    } else {
      for (let i = 0; i < PARTICLES; i += 1) {
        const a = at(targets, i);
        const b = at(state.dissolveTarget, i);
        const tmp = at(state.tmpA, i);
        tmp[0] = at(a, 0) + (at(b, 0) - at(a, 0)) * tt;
        tmp[1] = at(a, 1) + (at(b, 1) - at(a, 1)) * tt;
      }
    }
    renderParticles(
      ctx,
      state.tmpA,
      canvas,
      state.W,
      state.H,
      state.scale,
      state.dpr
    );

    state.frame += 1;
    if (state.frame >= total) {
      state.frame = 0;
      if (state.phase === 0) {
        state.phase = 1;
      } else if (state.phase === 1) {
        state.phase = 2;
        state.dissolveTarget = makeScatter(PARTICLES, state.W, state.H, 0.3);
        for (let i = 0; i < PARTICLES; i += 1) {
          const point = at(state.dissolveTarget, i);
          point[0] = (point[0] ?? 0) - Math.random() * (0.1 * state.W);
        }
      } else {
        state.current = state.dissolveTarget.map((p) => [p[0] ?? 0, p[1] ?? 0]);
        state.wordIdx = (state.wordIdx + 1) % words.length;
        state.phase = 0;
      }
    }

    // oxlint-disable-next-line react/react-compiler -- self-referential rAF animation loop: `tick` schedules its own next frame, so it's necessarily read before its own const binding is fully assigned; restructuring this recursive pattern is a larger change out of scope here
    animationRef.current = requestAnimationFrame(tick);
  }, [ease, renderParticles, makeScatter, words]);

  useEffect(() => {
    const handleResize = () => {
      setup();
    };

    window.addEventListener("resize", handleResize);

    // Wait for fonts to load, then setup and start animation
    const startAnimation = () => {
      setup();
      tick();
    };

    if (document.fonts?.ready) {
      (async () => {
        // oxlint-disable-next-line react/react-compiler -- compiler flags this await inside an async IIFE closure over effect-scoped functions (startAnimation); not a real declaration-order bug, restructuring risks changing font-load timing
        await document.fonts.ready;
        startAnimation();
      })();
    } else {
      startAnimation();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [setup, tick]);

  return (
    <div
      className={`${className}`}
      style={{ minHeight: height, minWidth: width, overflow: "visible" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          background: "transparent",
          display: "block",
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
};

export default CTATextAnimation;
