"use client";

import { useMemo } from "react";

import { buildInitializeConfig, usePaddle } from "@/libs/paddle-js";

export default function PaddleContainer() {
  // GU-1250: initialize paddle retain for guest mode.
  const paddleConfig = useMemo(() => buildInitializeConfig(), []);
  usePaddle(paddleConfig);

  return null;
}
